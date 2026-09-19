import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LabelData } from '../../../shared/models/label';

/** Normaliza un porcentaje de ajuste dentro de un rango, con 100 como fallback. */
function clampPercent(value: number, min: number, max: number): number {
  const percent = Number.isFinite(value) ? value : 100;
  return Math.min(max, Math.max(min, percent));
}

/**
 * Ancho reservado (en `em` de la etiqueta) para la columna 2 (marca/título).
 * Es una constante: independiente del texto y del `titleSize`, para que ni
 * cambiar el texto ni mover el slider de tamaño afecte al resto de columnas.
 */
const TITLE_COLUMN_EM = 11;

/** Line-height visual del título (mismo valor que en CSS: 0.82). */
const TITLE_LINE_HEIGHT = 0.82;

/**
 * Template de etiqueta de producto (frente + trasera en un solo desarrollo plano).
 * Es puramente presentacional: todo el contenido llega por el input `data`.
 */
@Component({
  selector: 'app-label-template',
  standalone: true,
  template: `
    <div class="label" data-label-export [style]="cssVars()" [style.padding]="paddingValue()">
      <!-- Lateral: descripción vertical + línea de propiedades + escala -->
      <div class="label__side">
        <!-- Ambos textos verticales comparten el mismo arranque inferior -->
        <div class="label__side-texts">
          <p class="v-text label__description">{{ data().description }}</p>
          @if (propertiesLine()) {
            <p class="v-text label__props-line">{{ propertiesLine() }}</p>
          }
        </div>
        @if (data().scale; as scale) {
          <div class="label__scale">
            <span class="label__scale-label">{{ scale.label }}</span>
            <div class="label__scale-dots" role="img" [attr.aria-label]="scaleAriaLabel()">
              @for (dot of scaleDots(); track $index) {
                <span class="label__scale-dot" [class.is-active]="dot"></span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Marca -->
      <div class="label__brand">
        <h1 class="v-text label__title">{{ data().title }}</h1>
        @if (data().productEnglish) {
          <p class="v-text label__product-en">{{ data().productEnglish }}</p>
        }
      </div>

      <!-- Centro: logo principal + propiedades -->
      <div class="label__center">
        <div class="label__logo">
          <div
            class="label__logo-box"
            [style.width.%]="data().logoSize"
            [style.height.%]="data().logoSize"
          >
            @if (data().logoUrl) {
              <img class="label__logo-img" [src]="data().logoUrl" [alt]="data().company" />
            } @else {
              <span class="label__logo-slot">LOGO</span>
            }
          </div>
        </div>
        <ul class="label__properties">
          @for (property of data().properties; track $index) {
            <li>
              @switch (data().propertyBullet) {
                @case ('dot') {
                  <span class="label__bullet label__bullet--dot" aria-hidden="true"></span>
                }
                @case ('icon') {
                  <span
                    class="label__bullet label__bullet--icon material-symbols-rounded"
                    aria-hidden="true"
                    >{{ property.icon || data().propertyIcon }}</span
                  >
                }
              }
              <span class="label__bullet-text">{{ property.text }}</span>
            </li>
          }
        </ul>
      </div>

      <!-- Etiqueta trasera: bloques informativos -->
      <div class="label__info">
        @for (section of data().info; track $index) {
          <section class="label__info-block">
            <h2 class="label__info-heading">{{ section.heading }}</h2>
            <p class="label__info-body">{{ section.body }}</p>
          </section>
        }
      </div>

      <!-- Franja de producto: el subtítulo arranca en la misma columna que Info -->
      <div class="label__strip">
        <span class="label__product-es" [style.font-size.em]="productSpanishFontSize()">{{
          data().productSpanish
        }}</span>
        <span class="label__subtitle">{{ data().subtitle }}</span>
      </div>

      <div class="label__rule"></div>

      <!-- Pie -->
      <div class="label__footer">
        <div class="label__footer-brand">
          <span class="label__footer-mark" [style.height.em]="footerMarkHeight()">
            @if (data().footerLogoUrl) {
              <img class="label__logo-img" [src]="data().footerLogoUrl" [alt]="data().company" />
            } @else {
              <span class="label__logo-slot label__logo-slot--sm">LOGO</span>
            }
          </span>
          <span class="label__footer-tagline">{{ data().companyTagline }}</span>
        </div>
        <span class="label__content">{{ data().content }}</span>
        <span class="label__origin">{{ data().origin }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .label {
        width: var(--label-w);
        height: var(--label-h);
        /* Toda la tipografía es relativa a la altura: la etiqueta escala completa. */
        font-size: calc(var(--label-h) * 0.0145);
        /* Base: sans humanista con caja alta (LIMPIA como Leelawadee UI). */
        font-family: 'Leelawadee UI', 'Segoe UI', 'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif;
        background: var(--label-bg);
        color: var(--label-text);
        /* Al imprimir/exportar a PDF nativo, forzar impresión del fondo. */
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        /* Grilla estable: la columna 2 (marca/título) tiene un ancho fijo
           calculado con el título al 100%, para que al mover el slider de
           tamaño del título NO se muevan las columnas 3 (centro) ni 4 (info). */
        display: grid;
        grid-template-columns: auto var(--label-title-col) minmax(0, 1fr) minmax(0, 0.9fr);
        grid-template-rows: minmax(0, 1fr) auto auto auto;
        row-gap: 0.9em;
        column-gap: 1.4em;
        /* El margen interior llega como binding de estilo (padding en mm). */
        overflow: hidden;
        line-height: 1.25;
        /* Radio configurable desde el editor (0 = esquinas rectas). */
        border-radius: var(--label-radius);
      }

      /* Texto vertical (de abajo hacia arriba) */
      .v-text {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        margin: 0;
        white-space: pre-line;
      }

      /* --- Lateral --- */
      .label__side {
        grid-row: 1;
        grid-column: 1;
        /* Separación extra con la columna del título. Va aquí (y no en el
           título) para que la columna se ensanche y la franja siga alineada. */
        margin-right: 1.8em;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1em;
        min-height: 0;
        overflow: hidden;
      }

      .label__side-texts {
        display: flex;
        align-items: stretch;
        gap: 1.4em;
        flex: 1 1 auto;
        min-height: 0;
      }

      .label__description {
        /* Ancho fijo en em para el bloque de texto vertical: evita que flex
           colapse su intrinsic width del writing-mode vertical-rl. */
        flex: 0 0 auto;
        width: 8em;
        height: 100%;
        min-height: 0;
        font-size: 0.88em;
        line-height: 1.45;
        color: var(--label-muted);
        text-align: justify;
      }

      .label__scale {
        margin-top: .5rem;
        display: flex;
        flex-direction: column;
        gap: 0.45em;
      }

      .label__scale-label {
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-size: 1.35em;
        font-weight: 400;
        letter-spacing: 0.04em;
        text-align: center;
      }

      .label__scale-dots {
        display: flex;
        align-items: center;
        gap: 0.22em;
      }

      .label__scale-dot {
        width: 1.5em;
        height: 1.5em;
        border-radius: 50%;
        background: var(--label-text);
      }

      .label__scale-dot.is-active {
        background: var(--label-highlight);
      }

      .label__props-line {
        flex: 0 0 auto;
        width: 1.4em;
        height: 100%;
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-size: 1em;
        font-weight: 400;
        letter-spacing: 0.08em;
        color: var(--label-accent);
      }

      /* --- Marca --- */
      .label__brand {
        grid-row: 1;
        grid-column: 2;
        /* El bloque se ajusta al alto del título y queda centrado: al cambiar
           el tamaño, el espacio se reparte arriba y abajo. */
        align-self: center;
        max-height: 100%;
        /* Acerca la columna del logo sin mover el título de su columna. */
        margin-right: -0.9em;
        display: flex;
        align-items: flex-end;
        gap: 0.1em;
        min-height: 0;
        /* Visible: si el usuario sube el título por encima del 100% el texto
           puede extenderse visualmente sin ser recortado por el contenedor. */
        overflow: visible;
      }

      .label__title {
        /* Se ajusta según la cantidad de caracteres para llenar la altura. */
        font-size: var(--label-title-size);
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 0.82;
        color: var(--label-accent);
        text-transform: uppercase;
      }

      .label__product-en {
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-size: 1.35em;
        font-weight: 400;
        letter-spacing: 0.16em;
        color: var(--label-text);
        text-transform: uppercase;
      }

      /* --- Centro --- */
      .label__center {
        grid-row: 1;
        grid-column: 3;
        /* Angosta la columna del logo y deja más aire antes de Info. */
        margin-right: 2.4em;
        /* Flujo vertical simple: logo arriba, propiedades justo debajo.
           El logo es flex: 0 0 auto y va primero, así agregar puntos
           extiende la lista hacia abajo sin mover el logo. */
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        min-height: 0;
      }

      .label__logo {
        flex: 0 0 auto;
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 1rem;
      }

      .label__logo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        min-height: 0;
      }

      .label__logo-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .label__logo-slot {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border: 0.12em dashed color-mix(in srgb, var(--label-text) 55%, transparent);
        border-radius: 0.4em;
        font-size: 0.85em;
        font-weight: 700;
        letter-spacing: 0.2em;
        color: color-mix(in srgb, var(--label-text) 65%, transparent);
      }

      .label__logo-slot--sm {
        width: auto;
        max-width: none;
        height: 100%;
        aspect-ratio: 3 / 2;
        font-size: 0.55em;
        letter-spacing: 0.1em;
        border-width: 0.1em;
      }

      .label__company {
        margin: 0.1em 0 1em;
        font-size: 4.2em;
        line-height: 1;
        font-weight: 800;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .label__properties {
        /* Fluye debajo del logo. El margin-left llega por binding y usa
           el ancho de .label__center como referencia (mismo que el logo). */
        flex: 0 0 auto;
        width: 100%;
        margin: 0.4em 0 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        margin-left: 4rem;
      }

      .label__properties li {
        display: flex;
        align-items: baseline;
        gap: 0.55em;
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-size: 1.4em;
        font-weight: 400;
        letter-spacing: 0.02em;
        color: var(--label-text);
        text-transform: uppercase;
      }

      .label__bullet {
        flex: 0 0 auto;
        color: var(--label-accent);
      }

      .label__bullet--dot {
        align-self: center;
        width: 0.55em;
        height: 0.55em;
        border-radius: 50%;
        background: var(--label-accent);
      }

      .label__bullet--icon {
        /* Ligeramente más grande que el texto, alineado a la altura de x. */
        font-size: 1.1em;
        line-height: 1;
        transform: translateY(0.15em);
      }

      .label__bullet-text {
        flex: 1 1 auto;
      }

      /* --- Etiqueta trasera --- */
      .label__info {
        grid-row: 1;
        grid-column: 4;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 0.8em;
        font-size: 0.78em;
        line-height: 1.32;
      }

      .label__info-heading {
        margin: 0 0 0.25em;
        font-size: 1.05em;
        font-weight: 800;
        font-style: italic;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .label__info-body {
        margin: 0;
        color: var(--label-muted);
        text-align: justify;
        white-space: pre-line;
      }

      /* --- Franja producto --- */
      .label__strip {
        grid-row: 2;
        grid-column: 1 / -1;
        /* Hereda las columnas de la etiqueta: el subtítulo cae justo bajo Info. */
        display: grid;
        grid-template-columns: subgrid;
        /* Centrado: al crecer o encoger el texto, la franja reparte el espacio. */
        align-items: center;
      }

      .label__strip > .label__product-es {
        /* Arranca en la columna de la marca: alineado con el título. */
        grid-column: 2 / 4;
      }

      .label__strip > .label__subtitle {
        grid-column: 4;
      }

      .label__product-es {
        /* El tamaño llega como binding (base 1.9em × ajuste). */
        font-family: 'Fugaz One', 'Impact', 'Arial Narrow', sans-serif;
        font-weight: 400;
        letter-spacing: 0.01em;
        color: var(--label-text);
        text-transform: uppercase;
      }

      .label__subtitle {
        font-size: 1.75em;
        font-weight: 400;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        /* Una sola línea: la columna de Info ahora es más angosta. */
        white-space: nowrap;
      }

      .label__rule {
        grid-row: 3;
        grid-column: 1 / -1;
        height: 1em;
        background: var(--label-accent);
      }

      /* --- Pie --- */
      .label__footer {
        grid-row: 4;
        grid-column: 1 / -1;
        /* Mismas columnas de la etiqueta: marca, tagline y origen bajo Info. */
        display: grid;
        grid-template-columns: subgrid;
        grid-template-rows: auto auto;
        align-items: end;
        row-gap: 0.8em;
      }

      .label__footer-brand {
        grid-row: 1;
        grid-column: 4;
        display: flex;
        align-items: center;
        gap: 0.5em;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
      }

      .label__footer-mark {
        display: flex;
        align-items: center;
        flex: 0 0 auto;
      }

      .label__footer-mark .label__logo-img {
        height: 100%;
        width: auto;
        max-width: 22em;
        max-height: none;
        object-fit: contain;
      }

      .label__footer-company {
        font-size: 3.2em;
        font-weight: 800;
        letter-spacing: 0.01em;
        text-transform: uppercase;
      }

      .label__footer-company sup {
        font-size: 0.42em;
        vertical-align: super;
      }

      .label__footer-tagline {
        font-size: 2.4em;
        font-weight: 400;
      }

      .label__content {
        grid-row: 2;
        grid-column: 1 / 4;
        font-size: 1.7em;
        color: var(--label-accent);
      }

      .label__origin {
        grid-row: 2;
        grid-column: 4;
        font-size: 1.5em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelTemplateComponent {
  /** Contenido y estilo de la etiqueta. */
  readonly data = input.required<LabelData>();

  /** Variables CSS derivadas del tema y las medidas. */
  protected readonly cssVars = computed<Record<string, string>>(() => {
    const { theme, widthMm, heightMm, transparentBackground, borderRadiusMm } = this.data();
    return {
      '--label-w': `${widthMm}mm`,
      '--label-h': `${heightMm}mm`,

      // Si el fondo es transparente, se ignora el color del tema.
      '--label-bg': transparentBackground ? 'transparent' : theme.background,
      '--label-accent': theme.accent,
      '--label-text': theme.text,
      '--label-muted': theme.muted,
      '--label-highlight': theme.highlight,
      '--label-title-size': this.titleFontSize(),
      '--label-title-col': this.titleColumnWidth(),
      '--label-radius': `${Number.isFinite(borderRadiusMm) ? Math.max(0, borderRadiusMm) : 0}mm`,
    };
  });

  /** Margen interior de la etiqueta, en milímetros. */
  protected readonly paddingValue = computed(() => {
    const padding = this.data().paddingMm;
    return `${Number.isFinite(padding) ? padding : 0}mm`;
  });

  /**
   * Tamaño BASE del título en `em` (al 100% del slider): fija el `font-size`
   * de modo que la palabra ocupe la altura disponible SIN sobrepasar el
   * ancho reservado para la columna 2. Con ambos límites, ni el texto ni el
   * slider alteran el layout del resto de columnas.
   */
  private readonly titleBaseEm = computed(() => {
    const { title, heightMm, paddingMm } = this.data();
    const chars = Math.max(title.trim().length, 1);
    const unitMm = heightMm * 0.0145; // 1em expresado en mm
    const reservedEm = 9.6; // franja + línea + pie + separaciones
    const availableEm = (heightMm - paddingMm * 2) / unitMm - reservedEm;
    const perCharEm = 0.74; // avance medio por carácter en mayúsculas
    // Límite por altura disponible (varía con la cantidad de caracteres).
    const heightBasedEm = (availableEm / (chars * perCharEm)) * 0.97;
    // Límite por ancho de la columna 2 (constante): así títulos con pocos
    // caracteres no se hacen más anchos que la columna reservada.
    const columnBasedEm = TITLE_COLUMN_EM / TITLE_LINE_HEIGHT;
    const em = Math.min(heightBasedEm, columnBasedEm);
    return Math.min(24, Math.max(1.5, em));
  });

  /**
   * Tamaño real del título aplicando el slider del usuario (30%–200%).
   * Al superar el 100%, el texto puede excederse visualmente de la columna
   * sin recortarse (ver `overflow: visible` en `.label__brand`).
   */
  protected readonly titleFontSize = computed(() => {
    const scale = clampPercent(this.data().titleSize, 30, 200) / 100;
    return `${(this.titleBaseEm() * scale).toFixed(2)}em`;
  });

  /**
   * Ancho de la columna 2 (marca/título). Constante en `em`, así ni el texto
   * del título ni su tamaño afectan a las columnas 3 (centro) o 4 (info).
   */
  protected readonly titleColumnWidth = computed(() => `${TITLE_COLUMN_EM}em`);

  /** Tamaño del nombre en español, en `em`, según su porcentaje de ajuste. */
  protected readonly productSpanishFontSize = computed(
    () => (1.9 * clampPercent(this.data().productSpanishSize, 50, 250)) / 100,
  );

  /**
   * Sangría (en % de la columna central) del borde izquierdo del logo principal.
   * Mantiene las propiedades alineadas con el contenedor del logo, que va centrado.
   */
  protected readonly logoInset = computed(() => {
    const size = this.data().logoSize;
    const clamped = Math.min(100, Math.max(0, Number.isFinite(size) ? size : 100));
    return (100 - clamped) / 2;
  });

  /**
   * Margen izquierdo de la lista de propiedades: parte del `logoInset` (para
   * alinearse con el borde del logo) y añade un pequeño extra en `em` para
   * quedar visualmente pegado al contenido real del logo (que suele tener aire
   * dentro de su caja por `object-fit: contain`).
   */
  protected readonly propertiesInset = computed(() => `calc(${this.logoInset()}% + 1.1em)`);

  /** Alto del logo del pie en `em`, según su porcentaje de tamaño. */
  protected readonly footerMarkHeight = computed(() => {
    const size = this.data().footerLogoSize || 100;
    return (3.2 * size) / 100;
  });

  /** Propiedades unidas con bullet para la línea vertical del lateral. */
  protected readonly propertiesLine = computed(() =>
    this.data()
      .properties.map((property) => property.text)
      .filter((text) => text.trim().length > 0)
      .join(' • '),
  );

  /** Puntos de la escala: `true` en el punto activo. */
  protected readonly scaleDots = computed<boolean[]>(() => {
    const scale = this.data().scale;
    if (!scale) {
      return [];
    }
    const steps = Math.max(0, Math.floor(scale.steps));
    return Array.from({ length: steps }, (_, index) => index === scale.activeIndex);
  });

  /** Descripción accesible de la escala. */
  protected readonly scaleAriaLabel = computed(() => {
    const scale = this.data().scale;
    if (!scale) {
      return '';
    }
    return `${scale.label}: nivel ${scale.activeIndex + 1} de ${scale.steps}`;
  });
}
