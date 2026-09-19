import { LabelData } from '../../../shared/models/label';

/**
 * Datos de ejemplo: VANTA Tire & Rubber Cleaner.
 * Sirve como plantilla base; clonar antes de editar.
 */
export const VANTA_LABEL: LabelData = {
  title: 'VANTA',
  description:
    'VANTA Tire & Rubber Cleaner fue desarrollado para eliminar contaminantes incrustados en neumáticos y superficies de caucho mediante una combinación de agentes limpiadores de alto desempeño, solventes especializados y agentes humectantes. Su fórmula ayuda a remover la oxidación superficial conocida como «brown tire», residuos de acondicionadores envejecidos, suciedad de carretera y acumulación de grasas, restaurando la apariencia natural del caucho y mejorando el desempeño de los productos acondicionadores posteriores.',
  productEnglish: 'TIRE & RUBBER CLEANER',
  productSpanish: 'LIMPIADOR PARA NEUMÁTICOS Y CAUCHO',
  titleSize: 85,
  productSpanishSize: 100,
  subtitle: 'AGITE SUAVEMENTE ANTES DE USAR',
  properties: [
    { text: 'LIMPIEZA PROFUNDA', icon: 'water_drop' },
    { text: 'ELIMINA RESIDUOS', icon: 'auto_awesome' },
    { text: 'ESPUMA ACTIVA', icon: 'bubble_chart' },
    { text: 'ACABADO MATE', icon: 'shield' },
  ],
  propertyBullet: 'dot',
  propertyIcon: 'check_circle',
  info: [
    {
      heading: 'SUPERFICIES - ZONAS DE APLICACIÓN',
      body: 'Neumáticos, caucho exterior, tapetes de goma y molduras de caucho.',
    },
    {
      heading: 'NO APLICAR DIRECTAMENTE SOBRE',
      body: 'Pintura automotriz o motocicleta, superficies cromadas o pulidas delicadas, aluminio sin protección o superficies metálicas sensibles, cristales, espejos o pantallas, piel, textiles o superficies de tapicería, superficies calientes o expuestas directamente al sol, pintura, rines. Si ocurre contacto accidental con superficies no destinadas a la aplicación, enjuagar inmediatamente con abundante agua y no permitir que el producto se seque.',
    },
    {
      heading: 'MODO DE USO',
      body: 'MANTENIMIENTO: 1. Aplicar sobre el neumático seco. 2. Dejar actuar de 30 a 60 segundos. 3. Cepillar y enjuagar con abundante agua. 4. Repetir si es necesario. DESCONTAMINACIÓN: 1. Aplicar generosamente. 2. Dejar actuar hasta 90 segundos sin que el producto se seque. 3. Cepillar vigorosamente y enjuagar completamente. 4. Repetir si es necesario.',
    },
    {
      heading: 'RECOMENDACIONES DE MANIPULACIÓN',
      body: 'Utilizar guantes de protección durante la aplicación y manipulación prolongada, evitar respirar directamente la niebla generada por el atomizador, utilizar en áreas con buena ventilación, no mezclar con otros productos químicos, realizar una prueba previa en una zona poco visible cuando exista duda sobre la compatibilidad de la superficie, no permitir que el producto se seque sobre la superficie, enjuagar completamente después del tiempo de acción recomendado.',
    },
    {
      heading: 'PRECAUCIONES',
      body: 'Puede causar irritación ocular y cutánea. Evitar el contacto con los ojos y el contacto prolongado con la piel. En caso de contacto accidental, seguir las indicaciones de primeros auxilios. No ingerir. No utilizar sobre superficies calientes. No dejar secar el producto sobre la superficie. Mantener fuera del alcance de los niños.',
    },
    {
      heading: 'COMPOSICIÓN',
      body: 'Agua, agentes limpiadores, solvente, agentes secuestrantes.',
    },
    {
      heading: 'PRIMEROS AUXILIOS',
      body: 'OJOS: Enjuagar inmediatamente con abundante agua durante al menos 15 minutos, manteniendo los párpados abiertos. PIEL: Retirar la ropa contaminada y lavar la zona afectada con abundante agua. Si se presenta irritación persistente, solicitar atención médica. INHALACIÓN: Trasladar a la persona a un lugar con aire fresco. Si presenta malestar, dificultad respiratoria o síntomas persistentes, solicitar atención médica. INGESTIÓN: Enjuagar la boca con agua. No provocar el vómito. No administrar nada por vía oral a una persona inconsciente. Solicitar atención médica y mostrar la etiqueta del producto.',
    },
  ],
  scale: {
    label: 'ALCALINO',
    steps: 7,
    activeIndex: 6,
  },
  content: 'Contenido 500ml / 16.9 FL OZ',
  origin: 'Hecho en México.',
  company: 'ZORUX',
  companyMark: '®',
  companyTagline: 'Moto & Car Care',
  logoUrl: '/assets/imgs/logo_principal.png',
  logoSize: 85,
  footerLogoUrl: '/assets/imgs/logo_pie.png',
  footerLogoSize: 110,
  theme: {
    background: '#000000',
    accent: '#d6e021',
    text: '#ffffff',
    muted: '#e6e6e6',
    highlight: '#4b3ce0',
  },
  transparentBackground: false,
  widthMm: 200,
  heightMm: 129,
  paddingMm: 8,
  borderRadiusMm: 0,
};
