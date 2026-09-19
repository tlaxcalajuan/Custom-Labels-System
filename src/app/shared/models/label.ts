/**
 * Modelo de datos para el template de etiqueta de producto.
 * Todo el contenido textual y de color es configurable.
 */

/** Item de la lista de propiedades: texto e icono opcional por-propiedad. */
export interface LabelProperty {
  /** Texto visible, ej. "LIMPIEZA PROFUNDA". */
  text: string;
  /**
   * Icono de Material Symbols específico para esta propiedad. Si se omite,
   * usa `propertyIcon` global.
   */
  icon?: string;
}

/** Bloque de texto de la etiqueta trasera (encabezado + cuerpo). */
export interface LabelInfoSection {
  /** Encabezado del bloque, ej. "MODO DE USO". */
  heading: string;
  /** Cuerpo del bloque. Admite saltos de línea. */
  body: string;
}

/** Escala/indicador con puntos, ej. nivel de pH (ALCALINO). */
export interface LabelScale {
  /** Etiqueta de la escala, ej. "ALCALINO". */
  label: string;
  /** Cantidad total de puntos. */
  steps: number;
  /** Índice (base 0) del punto activo. */
  activeIndex: number;
}

/** Paleta de color de la etiqueta. */
export interface LabelTheme {
  /** Color de fondo de la etiqueta. */
  background: string;
  /** Color de acento (títulos, viñetas, línea divisoria). */
  accent: string;
  /** Color del texto principal. */
  text: string;
  /** Color del texto secundario / legal. */
  muted: string;
  /** Color del punto activo de la escala. */
  highlight: string;
}

/** Datos completos de una etiqueta. */
export interface LabelData {
  /** Nombre del producto en grande, ej. "VANTA". */
  title: string;
  /** Descripción técnica larga (lateral vertical). */
  description: string;
  /** Nombre del producto en inglés, ej. "TIRE & RUBBER CLEANER". */
  productEnglish: string;
  /** Nombre del producto en español, ej. "LIMPIADOR PARA NEUMÁTICOS Y CAUCHO". */
  productSpanish: string;
  /** Ajuste de tamaño del título, en % sobre el cálculo automático (30–200). */
  titleSize: number;
  /** Ajuste de tamaño del nombre en español, en % (50–250). */
  productSpanishSize: number;
  /** Subtítulo / indicación destacada, ej. "AGITE SUAVEMENTE ANTES DE USAR". */
  subtitle: string;
  /** Propiedades o beneficios (puntos / viñetas). */
  properties: LabelProperty[];
  /** Estilo de viñeta para las propiedades. */
  propertyBullet: 'dot' | 'icon' | 'none';
  /** Ícono de Material Symbols por defecto (se usa si la propiedad no define uno). */
  propertyIcon: string;
  /** Bloques informativos de la etiqueta trasera. */
  info: LabelInfoSection[];
  /** Escala opcional (pH u otro indicador). */
  scale: LabelScale | null;
  /** Contenido neto, ej. "Contenido 500ml / 16.9 FL OZ". */
  content: string;
  /** Origen o leyenda legal, ej. "Hecho en México.". */
  origin: string;
  /** Marca de la empresa, ej. "ZORUX". */
  company: string;
  /** Símbolo junto a la marca, ej. "®". Vacío para omitirlo. */
  companyMark: string;
  /** Bajada de marca, ej. "Moto & Car Care". */
  companyTagline: string;
  /** URL o data URL del logo principal (centro). `null` deja el espacio reservado. */
  logoUrl: string | null;
  /** Tamaño del logo principal, en % del área disponible (10–100). */
  logoSize: number;
  /**
   * Tinte opcional para el logo principal. Cuando está definido, la silueta
   * del PNG (canal alfa) se rellena con este color mediante un filtro SVG.
   * `null` deja el logo con sus propios colores.
   */
  logoTint?: string | null;
  /** URL o data URL del logo del pie. `null` deja el espacio reservado. */
  footerLogoUrl: string | null;
  /** Tamaño del logo del pie, en % respecto de su alto base (30–300). */
  footerLogoSize: number;
  /** Tinte opcional para el logo del pie (mismo mecanismo que `logoTint`). */
  footerLogoTint?: string | null;
  /** Paleta de color. */
  theme: LabelTheme;
  /**
   * Cuando es `true`, la etiqueta se renderiza y exporta con fondo transparente,
   * ignorando `theme.background`. Útil para PNG/PDF sin recuadro de color.
   * JPG no soporta transparencia: en ese caso el exportador sustituye por blanco.
   */
  transparentBackground?: boolean;
  /** Ancho de impresión en milímetros. */
  widthMm: number;
  /** Alto de impresión en milímetros. */
  heightMm: number;
  /** Margen interior de la etiqueta en milímetros. */
  paddingMm: number;
  /** Radio de las esquinas de la etiqueta, en milímetros (0 = esquinas rectas). */
  borderRadiusMm: number;
}
