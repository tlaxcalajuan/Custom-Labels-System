import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LabelData, LabelInfoSection, LabelScale, LabelTheme } from '../../../shared/models/label';
import { VANTA_LABEL } from '../data/vanta-label.data';
import { LabelTemplateComponent } from '../label-template/label-template.component';
import { LabelExportFormat, LabelExportService } from '../services/label-export.service';
import { LabelCatalogService } from '../services/label-catalog.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Normaliza una propiedad a `LabelProperty`. Tolera formatos viejos
 * (string) o corruptos (objeto con índices numéricos, sin `text`).
 */
function normalizeProperty(value: unknown): { text: string; icon?: string } {
  if (typeof value === 'string') {
    return { text: value };
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const text = typeof record['text'] === 'string' ? (record['text'] as string) : '';
    const icon = typeof record['icon'] === 'string' ? (record['icon'] as string) : undefined;
    // Si `text` está vacío pero el objeto tiene índices numéricos (spread de string),
    // reconstruye la cadena a partir de esos índices.
    if (!text) {
      const chars = Object.keys(record)
        .filter((k) => /^\d+$/.test(k))
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => String(record[k]));
      if (chars.length) {
        return icon ? { text: chars.join(''), icon } : { text: chars.join('') };
      }
    }
    return icon ? { text, icon } : { text };
  }
  return { text: '' };
}

/** Clona los datos de etiqueta sin compartir referencias. */
function cloneLabel(source: LabelData): LabelData {
  return {
    ...source,
    properties: source.properties.map(normalizeProperty),
    info: source.info.map((section) => ({ ...section })),
    scale: source.scale ? { ...source.scale } : null,
    theme: { ...source.theme },
  };
}

/**
 * Editor de etiquetas: formulario a la izquierda, vista previa en vivo a la derecha.
 */
@Component({
  selector: 'app-label-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, LabelTemplateComponent],
  template: `
    <div class="editor">
      <aside class="editor__panel">
        <h2 class="editor__title">Contenido de la etiqueta</h2>

        <details class="group" open>
          <summary class="group__legend">Identidad</summary>
          <div class="group__body">

          <label class="field">
            <span>Title</span>
            <input type="text" [ngModel]="label().title" (ngModelChange)="patch({ title: $event })" />
          </label>

          <label class="field field--inline">
            <span>Tamaño del title</span>
            <input
              type="range"
              min="40"
              max="150"
              step="1"
              [ngModel]="label().titleSize"
              (ngModelChange)="patch({ titleSize: +$event })"
            />
            <output>{{ label().titleSize }}%</output>
          </label>

          <label class="field">
            <span>Product (español)</span>
            <input
              type="text"
              [ngModel]="label().productSpanish"
              (ngModelChange)="patch({ productSpanish: $event })"
            />
          </label>

          <label class="field field--inline">
            <span>Tamaño</span>
            <input
              type="range"
              min="50"
              max="200"
              step="1"
              [ngModel]="label().productSpanishSize"
              (ngModelChange)="patch({ productSpanishSize: +$event })"
            />
            <output>{{ label().productSpanishSize }}%</output>
          </label>

          <label class="field">
            <span>Product (english)</span>
            <input
              type="text"
              [ngModel]="label().productEnglish"
              (ngModelChange)="patch({ productEnglish: $event })"
            />
          </label>

          <label class="field">
            <span>Subtitle</span>
            <input
              type="text"
              [ngModel]="label().subtitle"
              (ngModelChange)="patch({ subtitle: $event })"
            />
          </label>

          <label class="field">
            <span>Description</span>
            <textarea
              rows="7"
              [ngModel]="label().description"
              (ngModelChange)="patch({ description: $event })"
            ></textarea>
          </label>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Properties (puntos)</summary>
          <div class="group__body">

          <label class="field">
            <span>Viñeta</span>
            <select
              [ngModel]="label().propertyBullet"
              (ngModelChange)="patch({ propertyBullet: $event })"
            >
              <option value="dot">Punto</option>
              <option value="icon">Icono (Material Symbols)</option>
              <option value="none">Sin viñeta</option>
            </select>
          </label>

          @if (label().propertyBullet === 'icon') {
            <small class="field__hint">
              Elige el ícono en cada propiedad. Puedes ampliar la lista buscando nombres en
              <a href="https://fonts.google.com/icons" target="_blank" rel="noopener"
                >fonts.google.com/icons</a
              >.
            </small>
          }

          @for (property of label().properties; track $index) {
            <div class="property">
              @if (label().propertyBullet === 'icon') {
                <label
                  class="property__icon-picker"
                  [attr.aria-label]="'Ícono de la propiedad ' + ($index + 1)"
                >
                  <span
                    class="material-symbols-rounded property__icon-preview"
                    aria-hidden="true"
                    >{{ property.icon || label().propertyIcon }}</span
                  >
                  <select
                    [ngModel]="property.icon ?? ''"
                    (ngModelChange)="updatePropertyIcon($index, $event)"
                  >
                    <option value="">(por defecto)</option>
                    @for (name of iconSuggestions; track name) {
                      <option [value]="name">{{ name }}</option>
                    }
                  </select>
                </label>
              }
              <input
                type="text"
                class="property__text"
                [attr.aria-label]="'Propiedad ' + ($index + 1)"
                [ngModel]="property.text"
                (ngModelChange)="updatePropertyText($index, $event)"
              />
              <button type="button" class="btn btn--icon" (click)="removeProperty($index)">
                Quitar
              </button>
            </div>
          }

          <button type="button" class="btn" (click)="addProperty()">+ Agregar propiedad</button>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Info (etiqueta trasera)</summary>
          <div class="group__body">

          @for (section of label().info; track $index) {
            <div class="card">
              <div class="row">
                <input
                  type="text"
                  placeholder="Encabezado"
                  [attr.aria-label]="'Encabezado del bloque ' + ($index + 1)"
                  [ngModel]="section.heading"
                  (ngModelChange)="updateInfo($index, { heading: $event })"
                />
                <button type="button" class="btn btn--icon" (click)="removeInfo($index)">
                  Quitar
                </button>
              </div>
              <textarea
                rows="4"
                placeholder="Contenido"
                [attr.aria-label]="'Contenido del bloque ' + ($index + 1)"
                [ngModel]="section.body"
                (ngModelChange)="updateInfo($index, { body: $event })"
              ></textarea>
              <div class="card__moves">
                <button
                  type="button"
                  class="btn btn--icon"
                  [disabled]="$first"
                  (click)="moveInfo($index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="btn btn--icon"
                  [disabled]="$last"
                  (click)="moveInfo($index, 1)"
                >
                  ↓
                </button>
              </div>
            </div>
          }

          <button type="button" class="btn" (click)="addInfo()">+ Agregar bloque</button>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Contenido y marca</summary>
          <div class="group__body">

          <label class="field">
            <span>Contenido</span>
            <input
              type="text"
              [ngModel]="label().content"
              (ngModelChange)="patch({ content: $event })"
            />
          </label>

          <label class="field">
            <span>Origen / legal</span>
            <input
              type="text"
              [ngModel]="label().origin"
              (ngModelChange)="patch({ origin: $event })"
            />
          </label>

          <label class="field">
            <span>Tagline</span>
            <input
              type="text"
              [ngModel]="label().companyTagline"
              (ngModelChange)="patch({ companyTagline: $event })"
            />
          </label>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Logo principal (centro)</summary>
          <div class="group__body">

          <label class="field">
            <span>Archivo</span>
            <input type="file" accept="image/*" (change)="onLogoSelected($event, 'logoUrl')" />
          </label>

          <label class="field">
            <span>o URL</span>
            <input
              type="text"
              placeholder="https://… o vacío para dejar el espacio"
              [ngModel]="label().logoUrl ?? ''"
              (ngModelChange)="patch({ logoUrl: $event || null })"
            />
          </label>

          <label class="field field--inline">
            <span>Tamaño</span>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              [ngModel]="label().logoSize"
              (ngModelChange)="patch({ logoSize: +$event })"
            />
            <output>{{ label().logoSize }}%</output>
          </label>

          @if (label().logoUrl) {
            <button type="button" class="btn" (click)="patch({ logoUrl: null })">
              Quitar logo principal
            </button>
          }
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Logo del pie</summary>
          <div class="group__body">

          <label class="field">
            <span>Archivo</span>
            <input type="file" accept="image/*" (change)="onLogoSelected($event, 'footerLogoUrl')" />
          </label>

          <label class="field">
            <span>o URL</span>
            <input
              type="text"
              placeholder="https://… o vacío para dejar el espacio"
              [ngModel]="label().footerLogoUrl ?? ''"
              (ngModelChange)="patch({ footerLogoUrl: $event || null })"
            />
          </label>

          <label class="field field--inline">
            <span>Tamaño</span>
            <input
              type="range"
              min="30"
              max="300"
              step="5"
              [ngModel]="label().footerLogoSize"
              (ngModelChange)="patch({ footerLogoSize: +$event })"
            />
            <output>{{ label().footerLogoSize }}%</output>
          </label>

          @if (label().footerLogoUrl) {
            <button type="button" class="btn" (click)="patch({ footerLogoUrl: null })">
              Quitar logo del pie
            </button>
          }
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Escala (pH u otro indicador)</summary>
          <div class="group__body">

          <label class="field field--inline">
            <input type="checkbox" [ngModel]="!!label().scale" (ngModelChange)="toggleScale($event)" />
            <span>Mostrar escala</span>
          </label>

          @if (label().scale; as scale) {
            <label class="field">
              <span>Etiqueta</span>
              <input
                type="text"
                [ngModel]="scale.label"
                (ngModelChange)="patchScale({ label: $event })"
              />
            </label>

            <div class="row">
              <label class="field">
                <span>Puntos</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  [ngModel]="scale.steps"
                  (ngModelChange)="patchScale({ steps: +$event })"
                />
              </label>

              <label class="field">
                <span>Punto activo (0 = primero)</span>
                <input
                  type="number"
                  min="0"
                  [max]="scale.steps - 1"
                  [ngModel]="scale.activeIndex"
                  (ngModelChange)="patchScale({ activeIndex: +$event })"
                />
              </label>
            </div>
          }
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Color</summary>
          <div class="group__body">

          <label class="field field--inline">
            <input
              type="checkbox"
              [ngModel]="!!label().transparentBackground"
              (ngModelChange)="patch({ transparentBackground: $event })"
            />
            <span>Fondo transparente</span>
          </label>

          <label class="field field--inline">
            <input
              type="color"
              [disabled]="!!label().transparentBackground"
              [ngModel]="label().theme.background"
              (ngModelChange)="patchTheme({ background: $event })"
            />
            <span>Fondo</span>
          </label>

          <label class="field field--inline">
            <input
              type="color"
              [ngModel]="label().theme.accent"
              (ngModelChange)="patchTheme({ accent: $event })"
            />
            <span>Acento</span>
          </label>

          <label class="field field--inline">
            <input
              type="color"
              [ngModel]="label().theme.text"
              (ngModelChange)="patchTheme({ text: $event })"
            />
            <span>Texto</span>
          </label>

          <label class="field field--inline">
            <input
              type="color"
              [ngModel]="label().theme.muted"
              (ngModelChange)="patchTheme({ muted: $event })"
            />
            <span>Texto secundario</span>
          </label>

          <label class="field field--inline">
            <input
              type="color"
              [ngModel]="label().theme.highlight"
              (ngModelChange)="patchTheme({ highlight: $event })"
            />
            <span>Punto activo</span>
          </label>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Medidas (mm)</summary>
          <div class="group__body">

          <div class="row">
            <label class="field">
              <span>Ancho</span>
              <input
                type="number"
                min="40"
                max="600"
                [ngModel]="label().widthMm"
                (ngModelChange)="patch({ widthMm: +$event })"
              />
            </label>

            <label class="field">
              <span>Alto</span>
              <input
                type="number"
                min="30"
                max="600"
                [ngModel]="label().heightMm"
                (ngModelChange)="patch({ heightMm: +$event })"
              />
            </label>
          </div>

          <label class="field field--inline">
            <span>Margen interior</span>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              [ngModel]="label().paddingMm"
              (ngModelChange)="patch({ paddingMm: +$event })"
            />
            <output>{{ label().paddingMm }} mm</output>
          </label>

          <label class="field field--inline">
            <span>Radio de borde</span>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              [ngModel]="label().borderRadiusMm"
              (ngModelChange)="patch({ borderRadiusMm: +$event })"
            />
            <output>{{ label().borderRadiusMm }} mm</output>
          </label>
        </div>
        </details>

        <details class="group" open>
          <summary class="group__legend">Datos (JSON)</summary>
          <div class="group__body">
          <textarea rows="6" [ngModel]="json()" (ngModelChange)="draftJson.set($event)"></textarea>
          @if (jsonError()) {
            <p class="error" role="alert">{{ jsonError() }}</p>
          }
          <div class="row">
            <button type="button" class="btn" (click)="applyJson()">Aplicar JSON</button>
            <button type="button" class="btn" (click)="reset()">Restablecer ejemplo</button>
          </div>
        </div>
        </details>
      </aside>

      <section class="preview">
        <div class="preview__savebar">
          <label class="preview__name field">
            <span>Nombre de la etiqueta</span>
            <input
              type="text"
              placeholder="Ej. VANTA 500ml"
              [ngModel]="labelName()"
              (ngModelChange)="labelName.set($event)"
            />
          </label>
          <div class="preview__savebar-actions">
            <button type="button" class="btn btn--primary" (click)="save()">
              {{ currentId() ? 'Guardar cambios' : 'Guardar etiqueta' }}
            </button>
            <a class="btn" routerLink="/labels/catalog">Ir al catálogo</a>
          </div>
        </div>

        <div class="preview__toolbar">
          <label class="field field--inline">
            <span>Zoom</span>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.05"
              [ngModel]="zoom()"
              (ngModelChange)="zoom.set(+$event)"
            />
            <output>{{ zoomPercent() }}%</output>
          </label>
          <div class="preview__actions">
            <button
              type="button"
              class="btn"
              [disabled]="isExporting()"
              (click)="exportAs('png')"
            >
              PNG
            </button>
            <button
              type="button"
              class="btn"
              [disabled]="isExporting()"
              (click)="exportAs('jpg')"
            >
              JPG
            </button>
            <button
              type="button"
              class="btn"
              [disabled]="isExporting()"
              (click)="exportAs('pdf')"
            >
              PDF
            </button>
            <button type="button" class="btn" (click)="print()">Imprimir</button>
          </div>
        </div>

        @if (exportError()) {
          <p class="preview__error" role="alert">{{ exportError() }}</p>
        }

        <div class="preview__scroll">
          <div #stage class="preview__stage" [style.transform]="'scale(' + zoom() + ')'">
            <app-label-template [data]="label()" />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .editor {
        display: grid;
        grid-template-columns: minmax(320px, 400px) minmax(0, 1fr);
        gap: 24px;
        align-items: start;
      }

      .editor__panel {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        max-height: calc(100vh - 160px);
        overflow-y: auto;
      }

      .editor__title {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
      }

      /* Cada grupo es un <details> colapsable con estilo de tarjeta. */
      .group {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        margin: 0 0 16px;
        background: #fff;
        overflow: hidden;
      }

      .group__legend {
        list-style: none;
        cursor: pointer;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        color: #4b5563;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Oculta el marcador nativo en todos los navegadores. */
      .group__legend::-webkit-details-marker { display: none; }
      .group__legend::marker { content: ''; }

      /* Chevron rotatorio a la izquierda del título. */
      .group__legend::before {
        content: '';
        width: 0;
        height: 0;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-left: 6px solid #6b7280;
        transition: transform 0.15s ease-out;
        flex: 0 0 auto;
      }

      .group[open] > .group__legend::before {
        transform: rotate(90deg);
      }

      .group[open] > .group__legend {
        border-bottom: 1px solid #e5e7eb;
      }

      .group__legend:hover {
        background: #f9fafb;
      }

      .group__legend:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: -2px;
      }

      .group__body {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #4b5563;
        flex: 1 1 auto;
        min-width: 0;
      }

      .field--inline {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }

      input[type='text'],
      input[type='number'],
      textarea {
        width: 100%;
        font: inherit;
        font-size: 13px;
        color: #111827;
        padding: 8px 10px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
      }

      textarea {
        resize: vertical;
        line-height: 1.5;
      }

      input:focus-visible,
      textarea:focus-visible,
      button:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 1px;
      }

      .row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      .card {
        border: 1px dashed #d1d5db;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .card__moves {
        display: flex;
        gap: 6px;
      }

      .btn {
        font: inherit;
        font-size: 13px;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #f9fafb;
        color: #111827;
        cursor: pointer;
        white-space: nowrap;
      }

      .btn:hover:not(:disabled) {
        background: #f3f4f6;
      }

      .btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .btn--icon {
        padding: 8px 10px;
      }

      .row--wrap {
        flex-wrap: wrap;
        gap: 6px;
      }

      .property {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .property__text {
        flex: 1 1 auto;
        min-width: 0;
      }

      .property__icon-picker {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 6px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
        flex: 0 0 auto;
        cursor: pointer;
      }

      .property__icon-picker:focus-within {
        outline: 2px solid #6366f1;
        outline-offset: 1px;
      }

      .property__icon-picker select {
        border: none;
        padding: 4px 4px 4px 0;
        background: transparent;
        font-size: 12px;
        cursor: pointer;
        width: 108px;
      }

      .property__icon-picker select:focus-visible {
        outline: none;
      }

      .property__icon-preview {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: #eef2ff;
        color: #4338ca;
        font-size: 18px;
        flex: 0 0 auto;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        font: inherit;
        font-size: 12px;
        line-height: 1.2;
        color: #374151;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 999px;
        cursor: pointer;
      }

      .chip:hover {
        background: #e5e7eb;
      }

      .chip.is-active {
        border-color: #6366f1;
        background: #eef2ff;
        color: #3730a3;
      }

      .chip__icon {
        font-size: 16px;
      }

      .field__hint {
        font-size: 11px;
        color: #6b7280;
      }

      .field__hint a {
        color: #4f46e5;
      }

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

      .error {
        margin: 0;
        font-size: 12px;
        color: #b91c1c;
      }

      .preview {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }

      .preview__toolbar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 10px 14px;
      }

      .preview__savebar {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 12px 14px;
        flex-wrap: wrap;
      }

      .preview__name {
        flex: 1 1 260px;
        min-width: 220px;
      }

      .preview__savebar-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .btn--primary {
        background: #4f46e5;
        border-color: #4338ca;
        color: #fff;
      }

      .btn--primary:hover:not(:disabled) {
        background: #4338ca;
      }

      .preview__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }

      .preview__error {
        margin: -4px 0 0;
        padding: 8px 12px;
        border-radius: 8px;
        background: #fee2e2;
        color: #991b1b;
        font-size: 13px;
      }

      .preview__scroll {
        overflow: auto;
        background: #e5e7eb;
        border-radius: 12px;
        padding: 20px;
      }

      .preview__stage {
        transform-origin: top left;
        width: fit-content;
        box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
      }

      @media print {
        .editor {
          display: block;
        }

        .editor__panel,
        .preview__toolbar,
        .preview__savebar {
          display: none;
        }

        .preview__scroll {
          overflow: visible;
          background: none;
          padding: 0;
          border-radius: 0;
        }

        .preview__stage {
          transform: none !important;
          box-shadow: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelEditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(LabelCatalogService);
  private readonly toast = inject(ToastService);

  /** Estado editable de la etiqueta. */
  readonly label = signal<LabelData>(cloneLabel(VANTA_LABEL));

  /** Id de la entrada del catálogo cargada (null = etiqueta nueva). */
  readonly currentId = signal<string | null>(null);

  /** Nombre editable para guardar en el catálogo. */
  readonly labelName = signal<string>('');

  constructor() {
    // Reacciona a cambios en :id: si estamos navegando entre etiquetas
    // guardadas (edit/1 → edit/2), se recarga automáticamente.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadFromCatalog(id);
      } else if (this.currentId() !== null) {
        // Volvimos a /labels (sin id): desasocia la entrada activa.
        this.reset();
      }
    });
  }

  /** Carga la etiqueta guardada por id desde el catálogo. */
  private loadFromCatalog(id: string): void {
    const entry = this.catalog.get(id);
    if (!entry) {
      // Id inválido: se limpia y se navega al catálogo.
      this.router.navigate(['/labels/catalog']);
      return;
    }
    this.label.set(cloneLabel(entry.data));
    this.currentId.set(entry.id);
    this.labelName.set(entry.name);
    this.draftJson.set(null);
    this.jsonError.set(null);
  }

  /**
   * Guarda la etiqueta. Si ya existe (`currentId`), actualiza esa entrada.
   * Si no hay nombre en el input, se pregunta al usuario (usa el título como
   * sugerencia). Así el botón siempre es clicable y no queda oculto.
   */
  save(): void {
    let name = this.labelName().trim();
    if (!name) {
      if (typeof window === 'undefined') {
        return;
      }
      const suggestion = this.label().title?.trim() || 'Etiqueta';
      const answer = window.prompt('Nombre de la etiqueta', suggestion);
      if (!answer || !answer.trim()) {
        return;
      }
      name = answer.trim();
      this.labelName.set(name);
    }
    const wasNew = !this.currentId();
    const entry = this.catalog.save(name, this.label(), this.currentId() ?? undefined);
    this.currentId.set(entry.id);
    this.labelName.set(entry.name);
    this.toast.success(
      wasNew ? `Etiqueta "${entry.name}" guardada` : `Cambios guardados en "${entry.name}"`,
    );
    if (!this.route.snapshot.paramMap.get('id')) {
      // Actualiza la URL para que la ruta refleje la entrada creada.
      this.router.navigate(['/labels/edit', entry.id], { replaceUrl: true });
    }
  }

  /** Iconos frecuentes para usar como viñeta de propiedades. */
  readonly iconSuggestions: readonly string[] = [
    'check_circle',
    'star',
    'bolt',
    'water_drop',
    'shield',
    'auto_awesome',
    'bubble_chart',
    'eco',
    'directions_car',
    'settings',
    'thumb_up',
    'verified',
    'diamond',
  ];

  /** Zoom de la vista previa. */
  readonly zoom = signal(1);

  /** JSON editado manualmente (null = sincronizado con el estado). */
  readonly draftJson = signal<string | null>(null);

  /** Error de parseo del JSON. */
  readonly jsonError = signal<string | null>(null);

  protected readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));

  protected readonly json = computed(
    () => this.draftJson() ?? JSON.stringify(this.label(), null, 2),
  );

  /** Actualiza campos de primer nivel. */
  patch(changes: Partial<LabelData>): void {
    this.label.update((current) => ({ ...current, ...changes }));
    this.draftJson.set(null);
  }

  /** Actualiza el tema de color. */
  patchTheme(changes: Partial<LabelTheme>): void {
    this.label.update((current) => ({ ...current, theme: { ...current.theme, ...changes } }));
    this.draftJson.set(null);
  }

  /** Actualiza la escala, si existe. */
  patchScale(changes: Partial<LabelScale>): void {
    this.label.update((current) =>
      current.scale ? { ...current, scale: { ...current.scale, ...changes } } : current,
    );
    this.draftJson.set(null);
  }

  /** Activa o desactiva la escala. */
  toggleScale(enabled: boolean): void {
    this.patch({
      scale: enabled ? (VANTA_LABEL.scale ? { ...VANTA_LABEL.scale } : null) : null,
    });
  }

  addProperty(): void {
    this.patch({
      properties: [...this.label().properties, { text: 'NUEVA PROPIEDAD' }],
    });
  }

  /** Actualiza el texto de una propiedad. */
  updatePropertyText(index: number, text: string): void {
    const properties = this.label().properties.map((property, i) => {
      if (i !== index) {
        return property;
      }
      const normalized = normalizeProperty(property);
      return { ...normalized, text };
    });
    this.patch({ properties });
  }

  /**
   * Actualiza el ícono de una propiedad. Cadena vacía → limpia el ícono
   * (usa el global). Se acepta cualquier nombre de Material Symbols.
   */
  updatePropertyIcon(index: number, icon: string): void {
    const trimmed = (icon ?? '').trim();
    const properties = this.label().properties.map((property, i) => {
      if (i !== index) {
        return property;
      }
      const normalized = normalizeProperty(property);
      if (!trimmed) {
        return { text: normalized.text };
      }
      return { text: normalized.text, icon: trimmed };
    });
    this.patch({ properties });
  }

  removeProperty(index: number): void {
    this.patch({ properties: this.label().properties.filter((_, i) => i !== index) });
  }

  addInfo(): void {
    this.patch({ info: [...this.label().info, { heading: 'NUEVO BLOQUE', body: '' }] });
  }

  updateInfo(index: number, changes: Partial<LabelInfoSection>): void {
    const info = this.label().info.map((section, i) =>
      i === index ? { ...section, ...changes } : section,
    );
    this.patch({ info });
  }

  removeInfo(index: number): void {
    this.patch({ info: this.label().info.filter((_, i) => i !== index) });
  }

  /** Mueve un bloque informativo hacia arriba (-1) o abajo (1). */
  moveInfo(index: number, offset: number): void {
    const info = [...this.label().info];
    const target = index + offset;
    if (target < 0 || target >= info.length) {
      return;
    }
    [info[index], info[target]] = [info[target], info[index]];
    this.patch({ info });
  }

  /**
   * Carga un logo desde el disco como data URL.
   * @param target Campo a actualizar: logo principal o logo del pie.
   */
  onLogoSelected(event: Event, target: 'logoUrl' | 'footerLogoUrl'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.patch({ [target]: String(reader.result) });
      // Permite volver a elegir el mismo archivo y que el evento vuelva a dispararse.
      input.value = '';
    };
    reader.onerror = () => this.jsonError.set('No se pudo leer el archivo de logo.');
    reader.readAsDataURL(file);
  }

  /** Aplica el JSON editado manualmente. */
  applyJson(): void {
    const raw = this.draftJson();
    if (raw === null) {
      this.jsonError.set(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<LabelData> & {
        properties?: Array<string | { text: string; icon?: string }>;
      };
      // Normaliza properties viejos que llegan como string[].
      const properties = (parsed.properties ?? VANTA_LABEL.properties).map((property) =>
        typeof property === 'string' ? { text: property } : { ...property },
      );
      this.label.set(cloneLabel({ ...VANTA_LABEL, ...parsed, properties }));
      this.draftJson.set(null);
      this.jsonError.set(null);
    } catch {
      this.jsonError.set('JSON inválido. Revisa la sintaxis.');
    }
  }

  /** Restablece los datos de ejemplo y desasocia de la entrada del catálogo. */
  reset(): void {
    this.label.set(cloneLabel(VANTA_LABEL));
    this.draftJson.set(null);
    this.jsonError.set(null);
    this.currentId.set(null);
    this.labelName.set('');
  }

  /** Abre el diálogo de impresión del navegador. */
  print(): void {
    window.print();
  }

  /** Referencia al contenedor de la vista previa (contiene el DOM real de la etiqueta). */
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');

  /** Servicio de exportación DOM → PNG/JPG/PDF. */
  private readonly exportService = inject(LabelExportService);

  /** True mientras corre un export (para deshabilitar botones). */
  readonly isExporting = signal(false);

  /** Último error de exportación (mostrado como alerta). */
  readonly exportError = signal<string | null>(null);

  /** Exporta la etiqueta en el formato pedido. */
  async exportAs(format: LabelExportFormat): Promise<void> {
    const stageEl = this.stage().nativeElement;
    const node = stageEl.querySelector<HTMLElement>('[data-label-export]');
    if (!node) {
      this.exportError.set('No se encontró la etiqueta para exportar.');
      return;
    }

    this.isExporting.set(true);
    this.exportError.set(null);
    const previousTransform = stageEl.style.transform;
    // Neutraliza el zoom durante la captura para no perder resolución.
    stageEl.style.transform = 'none';
    try {
      const data = this.label();
      await this.exportService.export(node, format, {
        fileName: this.sanitizeFileName(data.title),
        widthMm: data.widthMm,
        heightMm: data.heightMm,
        background: data.theme.background,
        transparent: !!data.transparentBackground,
      });
    } catch (error) {
      this.exportError.set(
        error instanceof Error ? error.message : 'No se pudo exportar la etiqueta.',
      );
    } finally {
      stageEl.style.transform = previousTransform;
      this.isExporting.set(false);
    }
  }

  /** Convierte el título en un nombre de archivo válido, con fallback. */
  private sanitizeFileName(title: string): string {
    const base = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return `${base || 'etiqueta'}_${this.timestamp()}`;
  }

  /** Timestamp compacto YYYYMMDD_HHmm para diferenciar archivos. */
  private timestamp(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `_${pad(now.getHours())}${pad(now.getMinutes())}`
    );
  }
}
