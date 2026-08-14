import type { Guide } from './tipos';

export const CUIDARTE_EN_LA_ZONA: Guide = {
  slug: 'cuidarte-si-vas-a-la-zona',
  title: 'Cuidarte si vas a la zona afectada',
  summary:
    'Qué protege de verdad, qué es un mito que está circulando, y por qué a veces la mejor ayuda es no ir.',
  emoji: '😷',
  readingMinutes: 4,
  author: null,
  sections: [
    {
      heading: 'A veces la mejor ayuda es no ir',
      blocks: [
        {
          type: 'p',
          text: 'En los primeros días sobró gente en algunos puntos: no dejaban entrar a ayudar porque ya había demasiadas manos. Y hay zonas donde los edificios vecinos siguen inestables y el riesgo de otro derrumbe es real.',
        },
        {
          type: 'p',
          text: 'Donde hay rescatistas trabajando, el público general estorba más de lo que suma. Ellos necesitan espacio, silencio para escuchar, y paso libre para las máquinas. Antes de salir, mira en el tablero si el punto pide manos o pide equipos, y llama al contacto.',
        },
      ],
    },
    {
      heading: 'Lo que sí protege: contra el polvo',
      blocks: [
        {
          type: 'p',
          text: 'El riesgo respiratorio real después de un terremoto es el polvo. El concreto pulverizado puede contener sílice, y en construcciones viejas puede haber asbesto. Eso se respira y hace daño.',
        },
        {
          type: 'list',
          items: [
            'Usa tapabocas de filtrado alto (N95 o FFP2). Un tapabocas quirúrgico de tela no filtra polvo fino.',
            'Gafas de protección: el polvo en los ojos es de lo que más molesta trabajando.',
            'Guantes gruesos, no de látex. Hay vidrio, varilla y concreto con filo.',
            'Zapato cerrado y de suela dura. Nada de tenis de tela.',
            'Hidrátate más de lo que crees que necesitas.',
          ],
        },
      ],
    },
    {
      heading: 'El olor: real, angustiante, no contagioso',
      blocks: [
        {
          type: 'p',
          text: 'A las 72 horas el olor en algunas zonas es fuerte y difícil de sobrellevar. Un poco de vaselina o de ungüento mentolado bajo la nariz ayuda a tolerarlo, y llevar el tapabocas puesto también.',
        },
        {
          type: 'p',
          text: 'Es un golpe emocional además de físico. Si te afecta, retírate un rato: no es debilidad, y un voluntario descompuesto es un problema más para el equipo.',
        },
      ],
    },
    {
      heading: 'Un mensaje que está circulando y conviene aclarar',
      blocks: [
        {
          type: 'p',
          text: 'Se está compartiendo un texto que dice que la descomposición de las personas fallecidas va a provocar infecciones respiratorias y que hay esporas viajando en el aire. Eso no es así.',
        },
        {
          type: 'p',
          text: 'Los organismos de salud pública lo tienen documentado desde hace décadas: los cuerpos de personas que mueren en un desastre natural no causan epidemias. Murieron por trauma, no por una enfermedad infecciosa, así que no hay nada que se propague. El riesgo existe solo para quien manipula restos de forma directa y sin protección, que es trabajo de personal especializado.',
        },
        {
          type: 'dont',
          items: [
            'No reenvíes ese mensaje. El mito empuja a entierros masivos apresurados sin identificar los cuerpos, y eso les quita a muchas familias la posibilidad de encontrar a los suyos.',
          ],
        },
        {
          type: 'p',
          text: 'Dicho eso, la recomendación de que las personas inmunosuprimidas usen tapabocas es sensata, solo que por otro motivo: el polvo y las aglomeraciones, no las esporas.',
        },
      ],
    },
    {
      heading: 'Antes de salir',
      blocks: [
        {
          type: 'list',
          items: [
            'Avísale a alguien a dónde vas y a qué hora piensas volver.',
            'Lleva tu propia agua y algo de comer: no consumas los recursos del punto al que vas a ayudar.',
            'Ve acompañado y en grupo, sobre todo si el aviso tiene alerta de seguridad.',
            'Carga el celular antes. Un celular con batería es de las cosas más útiles que puedes llevar.',
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        'La aclaración sobre cuerpos y epidemias sigue la posición de la Organización Panamericana de la Salud y la OMS, sostenida en su documentación sobre manejo de cadáveres en desastres naturales.',
    },
    {
      label:
        'Esta guía es orientación general y no reemplaza las indicaciones de los organismos de socorro en el terreno.',
    },
  ],
};
