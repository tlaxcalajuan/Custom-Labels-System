import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LabelData } from '../../../shared/models/label';

/** Entrada del catálogo: nombre + timestamps + JSON completo de la etiqueta. */
export interface SavedLabel {
  /** Identificador único (uuid v4 cuando el navegador lo soporta). */
  id: string;
  /** Nombre elegido por el usuario, ej. "VANTA 500ml". */
  name: string;
  /** Fecha de creación en formato ISO. */
  createdAt: string;
  /** Fecha de última modificación en formato ISO. */
  updatedAt: string;
  /** Datos completos de la etiqueta (mismo shape que usa el editor). */
  data: LabelData;
}

/** Clave usada en `localStorage`. Incluye versión para futuras migraciones. */
const STORAGE_KEY = 'label-catalog.v1';

/** URL base de la API expuesta por el servidor Express. */
const API_URL = '/api/labels';

/**
 * Persistencia del catálogo de etiquetas guardadas.
 * - Sincroniza con la API `/api/labels` del servidor (JSON por etiqueta en disco).
 * - Usa `localStorage` como caché offline + fallback cuando la API no responde.
 * - En SSR (sin `window`) el servicio funciona en memoria vacía.
 * - Expone `entries` como signal para que la UI reaccione a cambios.
 */
@Injectable({ providedIn: 'root' })
export class LabelCatalogService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly http = inject(HttpClient);

  /** Estado reactivo del catálogo. La UI lo consume vía computed / template. */
  readonly entries = signal<SavedLabel[]>([]);

  /** Estado de la última sincronización con el servidor. */
  readonly syncStatus = signal<'idle' | 'loading' | 'ok' | 'offline'>('idle');

  constructor() {
    if (this.isBrowser) {
      // 1) Hidrata inmediatamente desde localStorage (rápido, sirve offline).
      this.entries.set(this.readAll());
      // 2) Refresca desde el servidor (fuente de verdad) en background.
      void this.hydrateFromServer();
    }
  }

  /** Devuelve la entrada por id, o `undefined`. */
  get(id: string): SavedLabel | undefined {
    return this.entries().find((entry) => entry.id === id);
  }

  /**
   * Crea o actualiza una entrada.
   * - Si `id` corresponde a una entrada existente, la reemplaza (updatedAt=ahora).
   * - Si no, crea una nueva con id nuevo y createdAt/updatedAt=ahora.
   * La escritura al servidor se hace en background: la UI queda consistente
   * localmente aunque el servidor esté caído.
   */
  save(name: string, data: LabelData, id?: string): SavedLabel {
    const now = new Date().toISOString();
    const cleanedName = name.trim() || 'Etiqueta sin nombre';
    const cloned = this.cloneData(data);
    const current = this.entries();
    let entry: SavedLabel;
    if (id) {
      const existing = current.find((e) => e.id === id);
      if (existing) {
        entry = { ...existing, name: cleanedName, data: cloned, updatedAt: now };
        const next = current.map((e) => (e.id === id ? entry : e));
        this.commit(next);
        this.pushEntry(entry);
        return entry;
      }
    }
    entry = {
      id: this.uuid(),
      name: cleanedName,
      createdAt: now,
      updatedAt: now,
      data: cloned,
    };
    const next = [entry, ...current];
    this.commit(next);
    this.pushEntry(entry);
    return entry;
  }

  /** Elimina una entrada por id (no falla si no existe). */
  remove(id: string): void {
    const next = this.entries().filter((entry) => entry.id !== id);
    this.commit(next);
    this.pushDelete(id);
  }

  /** Duplica una entrada existente añadiendo "(copia)" al nombre. */
  duplicate(id: string): SavedLabel | null {
    const entry = this.get(id);
    if (!entry) {
      return null;
    }
    return this.save(`${entry.name} (copia)`, entry.data);
  }

  /** Renombra una entrada. Nombres vacíos se ignoran. */
  rename(id: string, name: string): void {
    const cleaned = name.trim();
    if (!cleaned) {
      return;
    }
    const now = new Date().toISOString();
    let renamed: SavedLabel | null = null;
    const next = this.entries().map((entry) => {
      if (entry.id !== id) return entry;
      renamed = { ...entry, name: cleaned, updatedAt: now };
      return renamed;
    });
    this.commit(next);
    if (renamed) {
      this.pushEntry(renamed);
    }
  }

  /**
   * Consulta el servidor y fusiona los resultados con lo que hay local.
   * Estrategia: para cada id, si existe en ambos lados se toma el más
   * reciente (por `updatedAt`). Los locales que no estén en el servidor
   * se envían para no perderlos.
   */
  private async hydrateFromServer(): Promise<void> {
    this.syncStatus.set('loading');
    try {
      const remote = await firstValueFrom(this.http.get<SavedLabel[]>(API_URL));
      if (!Array.isArray(remote)) {
        this.syncStatus.set('offline');
        return;
      }
      const local = this.entries();
      const merged = this.merge(local, remote);
      this.commit(merged);
      // Empuja al servidor los que faltaban o eran más recientes localmente.
      const remoteById = new Map(remote.map((e) => [e.id, e]));
      const pending = merged.filter((entry) => {
        const remoteEntry = remoteById.get(entry.id);
        if (!remoteEntry) return true;
        return entry.updatedAt > remoteEntry.updatedAt;
      });
      await Promise.allSettled(pending.map((entry) => this.putRemote(entry)));
      this.syncStatus.set('ok');
    } catch (error) {
      // Offline: el catálogo sigue funcionando con localStorage.
      if (error instanceof HttpErrorResponse) {
        console.warn('Catálogo: servidor no disponible, usando caché local.', error.status);
      }
      this.syncStatus.set('offline');
    }
  }

  /** Empuja una entrada al servidor (PUT idempotente). */
  private async pushEntry(entry: SavedLabel): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await this.putRemote(entry);
    } catch (error) {
      console.warn('No se pudo sincronizar la etiqueta con el servidor:', error);
    }
  }

  /** Elimina la entrada en el servidor. */
  private async pushDelete(id: string): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/${encodeURIComponent(id)}`));
    } catch (error) {
      console.warn('No se pudo eliminar la etiqueta en el servidor:', error);
    }
  }

  private putRemote(entry: SavedLabel): Promise<SavedLabel> {
    return firstValueFrom(
      this.http.put<SavedLabel>(`${API_URL}/${encodeURIComponent(entry.id)}`, entry),
    );
  }

  /** Fusiona local y remoto quedándose con la versión más reciente por id. */
  private merge(local: SavedLabel[], remote: SavedLabel[]): SavedLabel[] {
    const map = new Map<string, SavedLabel>();
    for (const entry of remote) {
      if (this.isValidEntry(entry)) {
        map.set(entry.id, entry);
      }
    }
    for (const entry of local) {
      if (!this.isValidEntry(entry)) continue;
      const remoteEntry = map.get(entry.id);
      if (!remoteEntry || entry.updatedAt > remoteEntry.updatedAt) {
        map.set(entry.id, entry);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /** Actualiza el estado en memoria y persiste al storage. */
  private commit(next: SavedLabel[]): void {
    this.entries.set(next);
    this.writeAll(next);
  }

  /** Lee el catálogo desde `localStorage`. Devuelve `[]` si no hay o falla. */
  private readAll(): SavedLabel[] {
    if (!this.isBrowser) {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(this.isValidEntry);
    } catch {
      return [];
    }
  }

  /** Serializa el catálogo actual al storage. Falla silenciosamente si excede cuota. */
  private writeAll(items: SavedLabel[]): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('No se pudo guardar el catálogo local:', error);
    }
  }

  /** Validador defensivo: asegura la estructura mínima de una entrada. */
  private readonly isValidEntry = (value: unknown): value is SavedLabel => {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const record = value as Record<string, unknown>;
    return (
      typeof record['id'] === 'string' &&
      typeof record['name'] === 'string' &&
      typeof record['createdAt'] === 'string' &&
      typeof record['updatedAt'] === 'string' &&
      !!record['data'] &&
      typeof record['data'] === 'object'
    );
  };

  /** Clona el `LabelData` para desacoplar el estado guardado del editor. */
  private cloneData(data: LabelData): LabelData {
    return {
      ...data,
      properties: data.properties.map((p) => ({ ...p })),
      info: data.info.map((section) => ({ ...section })),
      scale: data.scale ? { ...data.scale } : null,
      theme: { ...data.theme },
    };
  }

  /** Genera un id: `crypto.randomUUID` si existe, fallback pseudo-aleatorio. */
  private uuid(): string {
    if (this.isBrowser && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
