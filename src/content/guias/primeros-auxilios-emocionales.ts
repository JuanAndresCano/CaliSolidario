import { ANDRES_CANO } from './autores';
import type { Guide } from './tipos';

export const PRIMEROS_AUXILIOS_EMOCIONALES: Guide = {
  slug: 'primeros-auxilios-emocionales',
  title: 'Primeros auxilios emocionales',
  summary:
    'Qué decir y qué callar cuando alguien está en el dolor. No hay que ser psicólogo para acompañar bien.',
  emoji: '💬',
  readingMinutes: 5,
  author: ANDRES_CANO,
  sections: [
    {
      heading: '¿Qué son los primeros auxilios emocionales?',
      blocks: [
        {
          type: 'p',
          text: 'Son herramientas sencillas y prácticas para acompañar el dolor y el impacto emocional después de una crisis, como el terremoto del 10 de agosto de 2026.',
        },
        {
          type: 'p',
          text: 'No reemplazan la atención profesional, pero ayudan a contener, escuchar y apoyar a las personas en los primeros días y semanas después del evento. Todos podemos aprenderlos y aplicarlos en familia y en comunidad.',
        },
      ],
    },
    {
      heading: 'Sentirte mal en una situación anormal… es normal',
      blocks: [
        {
          type: 'p',
          text: 'Después de un terremoto es normal sentir tristeza, miedo, rabia, culpa, confusión y agotamiento. No estás exagerando: tu cuerpo y tu mente están respondiendo a algo muy fuerte.',
        },
        {
          type: 'p',
          text: 'Validar lo que sentimos es el primer paso para comenzar a sanar. Si conoces a alguien que se siente así, no lo juzgues. Pregúntale “¿cómo estás hoy?” y escucha.',
        },
      ],
    },
    {
      heading: 'Frases que ayudan',
      blocks: [
        {
          type: 'list',
          items: [
            '“Es normal que te sientas así.”',
            '“Lo que estás viviendo es muy difícil.”',
            '“No tienes que enfrentar esto solo.”',
            '“Estoy aquí para escucharte.”',
          ],
        },
      ],
    },
    {
      heading: 'Frases que hieren',
      blocks: [
        {
          type: 'dont',
          items: [
            '“Tienes que ser fuerte.”',
            '“El tiempo lo cura todo.”',
            '“Al menos no fue peor.”',
            '“Ya deberías estar mejor.”',
            '“Ya pasó, tienes que seguir adelante.”',
            '“Dios sabe lo que hace.”',
            '“Cambia de casa y se te pasa.”',
          ],
        },
        {
          type: 'p',
          text: 'Cambiar nuestras palabras es una forma concreta de cuidar a los demás. Piensa antes de hablar: ¿esto alivia o agrega más dolor?',
        },
      ],
    },
    {
      heading: 'La herramienta más poderosa: estar presente',
      blocks: [
        {
          type: 'p',
          text: 'Muchas veces no sabemos qué decir ante el dolor de otra persona. En esos momentos, la presencia vale más que las respuestas perfectas.',
        },
        {
          type: 'list',
          items: [
            'Siéntate cerca, sin presionar conversación.',
            'Si la persona habla, escucha sin interrumpir ni juzgar.',
            'Si hay silencio, puedes decir suavemente: “estoy aquí para ti”.',
          ],
        },
        {
          type: 'callout',
          text: 'Cinco minutos de presencia consciente pueden marcar la diferencia. Ofréceselos hoy a alguien que lo necesite.',
        },
      ],
    },
    {
      heading: 'Cuándo buscar ayuda profesional',
      blocks: [
        {
          type: 'p',
          text: 'Los primeros auxilios emocionales son un apoyo inicial. En algunos casos hay que buscar ayuda especializada, y estas son las señales de alerta:',
        },
        {
          type: 'list',
          items: [
            'Pensamientos de no querer vivir o de hacerse daño.',
            'No poder cuidar de las necesidades básicas durante varias semanas.',
            'Aislamiento total de la familia y los amigos.',
            'Uso de alcohol o drogas para “no sentir nada”.',
          ],
        },
        {
          type: 'p',
          text: 'Si esto está pasando, pedir ayuda no es una debilidad, es un acto de valentía. Acércate a tu centro de salud, a una línea de apoyo emocional o a un profesional de psicología de confianza.',
        },
        {
          type: 'callout',
          text: 'En una emergencia con riesgo para la vida, marca 123. En el panel de Servicios encuentras el acompañamiento emocional gratuito que hay disponible ahora mismo.',
        },
      ],
    },
  ],
  sources: [
    {
      label:
        'Contenido escrito por Andrés Cano para Tríada Aliados, adaptado a formato web por CaliSolidario.',
    },
    {
      label:
        'Esta guía es orientación general y no reemplaza la valoración de un profesional de salud mental.',
    },
  ],
};
