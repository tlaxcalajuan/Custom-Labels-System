import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelData, LabelInfoSection, LabelScale, LabelTheme } from '../../../shared/models/label';
import { VANTA_LABEL } from '../data/vanta-label.data';
import { LabelTemplateComponent } from '../label-template/label-template.component';

/** Clona los datos de etiqueta sin compartir referencias. */
function cloneLabel(source: LabelData): LabelData {
  return {
    ...source,
    properties: [...source.properties],
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
  imports: [FormsModule, LabelTemplateComponent],
  template: `
    <div class="editor">
      <aside class="editor__panel">
        <h2 class="editor__title">Contenido de la etiqueta</h2>

        <fieldset class="group">
          <legend>Identidad</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Properties (puntos)</legend>

          @for (property of label().properties; track $index) {
            <div class="row">
              <input
                type="text"
                [attr.aria-label]="'Propiedad ' + ($index + 1)"
                [ngModel]="property"
                (ngModelChange)="updateProperty($index, $event)"
              />
              <button type="button" class="btn btn--icon" (click)="removeProperty($index)">
                Quitar
              </button>
            </div>
          }

          <button type="button" class="btn" (click)="addProperty()">+ Agregar propiedad</button>
        </fieldset>

        <fieldset class="group">
          <legend>Info (etiqueta trasera)</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Contenido y marca</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Logo principal (centro)</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Logo del pie</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Escala (pH u otro indicador)</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Color</legend>

          <label class="field field--inline">
            <input
              type="color"
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
        </fieldset>

        <fieldset class="group">
          <legend>Medidas (mm)</legend>

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
        </fieldset>

        <fieldset class="group">
          <legend>Datos (JSON)</legend>
          <textarea rows="6" [ngModel]="json()" (ngModelChange)="draftJson.set($event)"></textarea>
          @if (jsonError()) {
            <p class="error" role="alert">{{ jsonError() }}</p>
          }
          <div class="row">
            <button type="button" class="btn" (click)="applyJson()">Aplicar JSON</button>
            <button type="button" class="btn" (click)="reset()">Restablecer ejemplo</button>
          </div>
        </fieldset>
      </aside>

      <section class="preview">
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
          <button type="button" class="btn" (click)="print()">Imprimir / PDF</button>
        </div>

        <div class="preview__scroll">
          <div class="preview__stage" [style.transform]="'scale(' + zoom() + ')'">
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

      .group {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 14px;
        margin: 0 0 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      legend {
        font-size: 13px;
        font-weight: 600;
        color: #4b5563;
        padding: 0 6px;
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
        gap: 16px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 10px 14px;
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
        .preview__toolbar {
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
  /** Estado editable de la etiqueta. */
  readonly label = signal<LabelData>(cloneLabel(VANTA_LABEL));

  /** Zoom de la vista previa. */
  readonly zoom = signal(0.75);

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
    this.patch({ properties: [...this.label().properties, 'NUEVA PROPIEDAD'] });
  }

  updateProperty(index: number, value: string): void {
    const properties = [...this.label().properties];
    properties[index] = value;
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
      const parsed = JSON.parse(raw) as LabelData;
      this.label.set(cloneLabel({ ...VANTA_LABEL, ...parsed }));
      this.draftJson.set(null);
      this.jsonError.set(null);
    } catch {
      this.jsonError.set('JSON inválido. Revisa la sintaxis.');
    }
  }

  /** Restablece los datos de ejemplo. */
  reset(): void {
    this.label.set(cloneLabel(VANTA_LABEL));
    this.draftJson.set(null);
    this.jsonError.set(null);
  }

  /** Abre el diálogo de impresión del navegador. */
  print(): void {
    window.print();
  }
}
