import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Tipo semántico del toast: define el color/ícono en el host. */
export type ToastKind = 'success' | 'error' | 'info';

/** Toast individual mostrado por `ToastHostComponent`. */
export interface Toast {
  /** Id único, útil para el `track` en la lista. */
  id: string;
  /** Mensaje visible. */
  message: string;
  /** Estilo semántico. */
  kind: ToastKind;
}

/**
 * Servicio ligero de notificaciones toast basado en signals.
 * - Sin dependencias externas.
 * - Auto-dismiss configurable por invocación.
 * - SSR-safe: en el servidor no dispara timers (los mensajes quedan visibles
 *   hasta la hidratación, pero típicamente el toast se emite tras un evento
 *   del usuario, que solo sucede en el browser).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Cola actual de toasts visibles. La consume `ToastHostComponent`. */
  readonly toasts = signal<Toast[]>([]);

  /**
   * Muestra un toast durante `durationMs` (por defecto 2600 ms).
   * @returns Id del toast por si el llamador quiere descartarlo antes.
   */
  show(message: string, kind: ToastKind = 'info', durationMs = 2600): string {
    const id = this.uuid();
    const toast: Toast = { id, message, kind };
    this.toasts.update((current) => [...current, toast]);
    if (this.isBrowser && durationMs > 0) {
      window.setTimeout(() => this.dismiss(id), durationMs);
    }
    return id;
  }

  /** Atajos por tipo. */
  success(message: string, durationMs?: number): string {
    return this.show(message, 'success', durationMs);
  }
  error(message: string, durationMs?: number): string {
    return this.show(message, 'error', durationMs ?? 4000);
  }
  info(message: string, durationMs?: number): string {
    return this.show(message, 'info', durationMs);
  }

  /** Descarta un toast antes de que expire. */
  dismiss(id: string): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  /** Descarta todos. Útil al navegar entre secciones si quisiéramos limpiar. */
  clear(): void {
    this.toasts.set([]);
  }

  private uuid(): string {
    if (this.isBrowser && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
