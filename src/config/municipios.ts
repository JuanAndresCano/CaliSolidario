/**
 * Configuración por municipio.
 *
 * Todo lo que ataba el código a Cali vive aquí. Para desplegar el sitio en
 * otro municipio se agrega una entrada al registro y se despliega con
 * `NEXT_PUBLIC_MUNICIPIO` apuntando a su `id`. Mismo código, misma base de
 * datos, dos sitios distintos.
 *
 * Los datos van en el repo y no en variables de entorno sueltas por dos
 * razones: quedan versionados (un cambio en la lista de veredas pasa por un
 * diff) y evitan tener quince variables que configurar en cada despliegue.
 */

export type Municipio = {
  /** Identificador corto. Es el valor de NEXT_PUBLIC_MUNICIPIO. */
  id: string;
  /** Cómo se nombra la ciudad en los textos: "Cali", "Finlandia". */
  nombre: string;
  /**
   * El nombre del sitio partido en dos, porque el encabezado colorea la
   * segunda mitad: ["Cali", "Solidario"].
   */
  marca: [string, string];
  /**
   * Sufijo para las búsquedas en Google Maps. Entre más específico, menos
   * probable que mande a alguien a una calle del mismo nombre en otra ciudad.
   */
  contextoMapa: string;
  /** Vista inicial del mapa cuando todavía no hay puntos con coordenadas. */
  centroMapa: { lat: number; lng: number; zoom: number };
  /**
   * División territorial. Cali usa comunas y corregimientos; otros municipios
   * usan veredas o no usan ninguna.
   *
   * Si `opciones` queda vacío, el formulario muestra un campo de texto libre
   * en lugar de una lista. Es mejor eso que obligar a inventar una división
   * que no existe.
   */
  divisiones: {
    etiqueta: string;
    opciones: readonly string[];
  };
  /**
   * WhatsApp al que se reportan puntos nuevos. Solo dígitos, con indicativo.
   *
   * OJO: esto ya NO es la fuente de verdad. El valor vigente vive en la tabla
   * `municipio_config`, porque quien responde rota y la alcaldía tiene que
   * poder cambiarlo sin un despliegue (migración 0020). Lo de aquí es el
   * respaldo para cuando la tabla no tiene fila o la consulta falla.
   */
  whatsappReportes: string;
  /** URL pública, para metadatos y enlaces absolutos. */
  url: string;
};

const COMUNAS_CALI = [
  ...Array.from({ length: 22 }, (_, i) => `Comuna ${i + 1}`),
  'Corregimiento Golondrinas',
  'Corregimiento La Paz',
  'Corregimiento Montebello',
  'Corregimiento La Castilla',
  'Corregimiento Los Andes',
  'Corregimiento Pichindé',
  'Corregimiento La Leonera',
  'Corregimiento Felidia',
  'Corregimiento El Saladito',
  'Corregimiento La Elvira',
  'Corregimiento Villacarmelo',
  'Corregimiento La Buitrera',
  'Corregimiento Pance',
  'Corregimiento El Hormiguero',
  'Corregimiento Navarro',
] as const;

export const MUNICIPIOS: Record<string, Municipio> = {
  cali: {
    id: 'cali',
    nombre: 'Cali',
    marca: ['Cali', 'Solidario'],
    contextoMapa: 'Cali, Valle del Cauca, Colombia',
    centroMapa: { lat: 3.4516, lng: -76.532, zoom: 12 },
    divisiones: { etiqueta: 'Comuna', opciones: COMUNAS_CALI },
    whatsappReportes: '573113179404',
    url: 'https://calisolidario.triadaaliados.com',
  },

  filandia: {
    id: 'filandia',
    nombre: 'Filandia',
    marca: ['Filandia', 'Solidario'],
    contextoMapa: 'Filandia, Quindío, Colombia',
    // Centro aproximado del casco urbano. A diferencia de las coordenadas de
    // un punto de acopio —que si están mal mandan gente a la dirección
    // equivocada— esto solo decide la vista inicial del mapa. Aun así,
    // confírmalo antes de lanzar.
    centroMapa: { lat: 4.6742, lng: -75.6572, zoom: 14 },
    // PENDIENTE: la lista de veredas de Filandia. Mientras esté vacía, el
    // formulario pide la zona como texto libre, que es preferible a ofrecer
    // una división inventada.
    divisiones: { etiqueta: 'Vereda', opciones: [] },
    // Respaldo. El número que se usa de verdad se cambia desde /gestion, y
    // ahí es donde la alcaldía pone el suyo.
    whatsappReportes: '573207259924',
    url: 'https://filandiasolidario.triadaaliados.com',
  },
};

/**
 * OJO con cómo se lee la variable: la referencia a `process.env` tiene que ser
 * literal para que Next la sustituya en el paquete del navegador. Leerla con
 * acceso dinámico deja el valor indefinido en el cliente — ya nos tumbó el
 * mapa en producción una vez.
 */
const seleccionado = process.env.NEXT_PUBLIC_MUNICIPIO ?? 'cali';

export const MUNICIPIO: Municipio = MUNICIPIOS[seleccionado] ?? MUNICIPIOS.cali;

/**
 * Cómo se llama el sitio: "CaliSolidario", "FilandiaSolidario".
 *
 * Existe para que nadie lo vuelva a escribir a mano. Estaba puesto literal en
 * media aplicación —la nota de seguridad, la página de enlaces, las plantillas
 * de WhatsApp— y el sitio de Filandia se presentaba como CaliSolidario.
 */
export const SITIO = MUNICIPIO.marca.join('');
