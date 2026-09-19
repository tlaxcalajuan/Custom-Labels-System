import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LabelTemplateComponent } from '../label-template/label-template.component';
import { LabelCatalogService, SavedLabel } from '../services/label-catalog.service';

/** Criterios de ordenamiento soportados por el catálogo. */
type SortKey = 'updated-desc' | 'updated-asc' | 'name-asc' | 'name-desc' | 'created-desc';

/**
 * Catálogo de etiquetas guardadas: búsqueda, filtros por color / tamaño,
 * ordenamiento y acciones (editar, duplicar, renombrar, exportar JSON, eliminar).
 */
@Component({
  selector: 'app-label-catalog',
  standalone: true,
  imports: [FormsModule, RouterLink, LabelTemplateComponent],
  template: `
    <div class="catalog">
      <div class="catalog__toolbar">
        <div>
          <h2 class="catalog__title">Mis etiquetas</h2>
          <p class="catalog__count">
            {{ filtered().length }} de {{ total() }} etiqueta{{ total() === 1 ? '' : 's' }}
          </p>
        </div>
        <a class="btn btn--primary" routerLink="/labels">+ Nueva etiqueta</a>
      </div>

      <div class="catalog__filters">
        <label class="field">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Nombre, producto, subtítulo…"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
          />
        </label>

        <label class="field">
          <span>Ordenar por</span>
          <select [ngModel]="sort()" (ngModelChange)="sort.set($event)">
            <option value="updated-desc">Modificadas recientes</option>
            <option value="updated-asc">Modificadas antiguas</option>
            <option value="created-desc">Creadas recientes</option>
            <option value="name-asc">Nombre A → Z</option>
            <option value="name-desc">Nombre Z → A</option>
          </select>
        </label>

        <label class="field">
          <span>Fondo</span>
          <select [ngModel]="backgroundFilter()" (ngModelChange)="backgroundFilter.set($event)">
            <option value="all">Todos</option>
            <option value="solid">Con fondo</option>
            <option value="transparent">Transparentes</option>
          </select>
        </label>
      </div>

      @if (total() === 0) {
        <div class="empty">
          <p>Aún no tienes etiquetas guardadas.</p>
          <a class="btn btn--primary" routerLink="/labels">Crear la primera</a>
        </div>
      } @else if (filtered().length === 0) {
        <p class="empty empty--small">Ningún resultado para los filtros actuales.</p>
      } @else {
        <div class="grid">
          @for (entry of filtered(); track entry.id) {
            <article class="card">
              <div class="card__preview" [style.background]="previewFrame(entry)">
                <div
                  class="card__preview-inner"
                  [style.--preview-scale]="previewScale(entry)"
                >
                  <app-label-template [data]="entry.data" />
                </div>
              </div>
              <div class="card__body">
                <h3 class="card__name" [title]="entry.name">{{ entry.name }}</h3>
                <dl class="card__meta">
                  <div>
                    <dt>Producto</dt>
                    <dd>{{ entry.data.productSpanish || entry.data.title }}</dd>
                  </div>
                  <div>
                    <dt>Tamaño</dt>
                    <dd>{{ entry.data.widthMm }} × {{ entry.data.heightMm }} mm</dd>
                  </div>
                  <div>
                    <dt>Modificada</dt>
                    <dd>{{ formatDate(entry.updatedAt) }}</dd>
                  </div>
                </dl>
                <div class="card__actions">
                  <a class="btn btn--primary" [routerLink]="['/labels/edit', entry.id]">
                    Editar
                  </a>
                  <button type="button" class="btn" (click)="duplicate(entry.id)">
                    Duplicar
                  </button>
                  <button type="button" class="btn" (click)="rename(entry)">
                    Renombrar
                  </button>
                  <button type="button" class="btn" (click)="exportJson(entry)">
                    JSON
                  </button>
                  <button
                    type="button"
                    class="btn btn--danger"
                    (click)="confirmDelete(entry)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .catalog {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .catalog__toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .catalog__title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #111827;
      }

      .catalog__count {
        margin: 4px 0 0;
        font-size: 13px;
        color: #6b7280;
      }

      .catalog__filters {
        display: grid;
        grid-template-columns: minmax(240px, 2fr) minmax(160px, 1fr) minmax(160px, 1fr);
        gap: 12px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 14px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #4b5563;
      }

      input[type='search'],
      select {
        width: 100%;
        font: inherit;
        font-size: 13px;
        color: #111827;
        padding: 8px 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
      }

      input:focus-visible,
      select:focus-visible,
      button:focus-visible,
      a:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 1px;
      }

      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 48px 20px;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        background: #f9fafb;
        color: #374151;
        text-align: center;
      }

      .empty--small {
        padding: 24px;
        color: #6b7280;
        font-size: 14px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .card {
        display: flex;
        flex-direction: column;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.15s, box-shadow 0.15s;
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgb(0 0 0 / 8%);
      }

      /* Previsualización: la etiqueta se dibuja a tamaño real (mm) y se
         escala mediante transform para caber en el card. */
      .card__preview {
        position: relative;
        height: 170px;
        overflow: hidden;
        border-bottom: 1px solid #e5e7eb;
      }

      .card__preview-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(var(--preview-scale, 0.2));
        transform-origin: center;
        pointer-events: none;
      }

      .card__body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
      }

      .card__name {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #111827;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card__meta {
        margin: 0;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: 12px;
        color: #4b5563;
      }

      .card__meta div {
        display: contents;
      }

      .card__meta dt {
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 11px;
        align-self: center;
      }

      .card__meta dd {
        margin: 0;
        color: #111827;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card__actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      .btn {
        font: inherit;
        font-size: 12px;
        padding: 6px 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #f9fafb;
        color: #111827;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
      }

      .btn:hover {
        background: #f3f4f6;
      }

      .btn--primary {
        background: #4f46e5;
        border-color: #4338ca;
        color: #fff;
      }

      .btn--primary:hover {
        background: #4338ca;
      }

      .btn--danger {
        color: #b91c1c;
        border-color: #fecaca;
        background: #fef2f2;
      }

      .btn--danger:hover {
        background: #fee2e2;
      }

      @media (max-width: 720px) {
        .catalog__filters {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelCatalogComponent {
  private readonly catalog = inject(LabelCatalogService);

  /** Búsqueda por texto libre (nombre, productos, subtítulo). */
  readonly query = signal('');
  /** Criterio de ordenamiento actual. */
  readonly sort = signal<SortKey>('updated-desc');
  /** Filtro por tipo de fondo. */
  readonly backgroundFilter = signal<'all' | 'solid' | 'transparent'>('all');

  /** Total sin filtrar (para mostrar "3 de 8"). */
  protected readonly total = computed(() => this.catalog.entries().length);

  /** Entradas después de aplicar búsqueda, filtros y orden. */
  protected readonly filtered = computed<SavedLabel[]>(() => {
    const rawQuery = this.query().trim().toLowerCase();
    const bg = this.backgroundFilter();
    const list = this.catalog.entries().filter((entry) => {
      if (bg === 'solid' && entry.data.transparentBackground) {
        return false;
      }
      if (bg === 'transparent' && !entry.data.transparentBackground) {
        return false;
      }
      if (!rawQuery) {
        return true;
      }
      const haystack = [
        entry.name,
        entry.data.title,
        entry.data.productSpanish,
        entry.data.productEnglish,
        entry.data.subtitle,
        entry.data.company,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(rawQuery);
    });

    // El orden usa `slice()` para no mutar la referencia del signal.
    switch (this.sort()) {
      case 'name-asc':
        return list.slice().sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.slice().sort((a, b) => b.name.localeCompare(a.name));
      case 'updated-asc':
        return list.slice().sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      case 'created-desc':
        return list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'updated-desc':
      default:
        return list.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
  });

  /** Formatea fecha ISO a una cadena corta legible (ej. "18 sep 2026 14:32"). */
  protected formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Escala para que la etiqueta encaje verticalmente en el preview de 170px.
   * Se calcula con 1mm ≈ 3.78px; se resta un pequeño padding para no rozar los bordes.
   */
  protected previewScale(entry: SavedLabel): number {
    const mmToPx = 3.7795;
    const targetHeightPx = 150; // 170 preview - 20 aire visual
    const targetWidthPx = 280; // ancho aproximado del card
    const scaleByHeight = targetHeightPx / (entry.data.heightMm * mmToPx);
    const scaleByWidth = targetWidthPx / (entry.data.widthMm * mmToPx);
    return Math.min(scaleByHeight, scaleByWidth);
  }

  /** Fondo del contenedor del preview: gris para sólidas, checker para transparentes. */
  protected previewFrame(entry: SavedLabel): string {
    if (entry.data.transparentBackground) {
      // Cuadrícula de checker para indicar transparencia.
      return (
        'repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 50% / 20px 20px'
      );
    }
    return '#f3f4f6';
  }

  /** Duplica una entrada con nombre "(copia)". */
  protected duplicate(id: string): void {
    this.catalog.duplicate(id);
  }

  /** Solicita un nuevo nombre y lo aplica. */
  protected rename(entry: SavedLabel): void {
    const next = typeof window !== 'undefined' ? window.prompt('Nuevo nombre', entry.name) : null;
    if (next && next.trim()) {
      this.catalog.rename(entry.id, next);
    }
  }

  /** Confirma y elimina una entrada. */
  protected confirmDelete(entry: SavedLabel): void {
    if (typeof window === 'undefined') {
      return;
    }
    const ok = window.confirm(`¿Eliminar la etiqueta "${entry.name}"? Esta acción no se puede deshacer.`);
    if (ok) {
      this.catalog.remove(entry.id);
    }
  }

  /** Descarga el JSON completo de una entrada. */
  protected exportJson(entry: SavedLabel): void {
    if (typeof window === 'undefined') {
      return;
    }
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.slugify(entry.name)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /** Nombre válido para descarga: minúsculas, guiones, sin acentos. */
  private slugify(name: string): string {
    const base = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return base || 'etiqueta';
  }
}
