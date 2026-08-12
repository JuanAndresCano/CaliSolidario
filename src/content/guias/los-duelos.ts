import { ANDRES_CANO } from './autores';
import type { Guide } from './tipos';

export const LOS_DUELOS: Guide = {
  slug: 'los-duelos-que-deja-un-terremoto',
  title: 'Los duelos que deja un terremoto',
  summary:
    'Por un familiar, por una mascota, por lo material. Los tres son reales y ninguno necesita permiso para doler.',
  emoji: '💔',
  readingMinutes: 4,
  author: ANDRES_CANO,
  sections: [
    {
      heading: 'Cuando se va alguien a quien amamos',
      blocks: [
        {
          type: 'p',
          text: 'Perder a un familiar de forma repentina es uno de los dolores más intensos que podemos vivir. Es normal sentir tristeza profunda, culpa, rabia, miedo y desorientación.',
        },
        {
          type: 'p',
          text: 'No hay tiempos “correctos” para el duelo: cada persona va a su propio ritmo. Hablar de quien se fue, recordar momentos importantes y permitir las lágrimas son parte del proceso de sanar.',
        },
        {
          type: 'callout',
          text: 'Si alguien en tu entorno está de duelo, ofrécele escuchar su historia sin interrumpir.',
        },
      ],
    },
    {
      heading: 'Tu dolor por tu mascota también importa',
      blocks: [
        {
          type: 'p',
          text: 'Las mascotas son familia: nos acompañan, nos dan amor y forman parte de nuestra rutina. Cuando muere una mascota, el dolor es real y legítimo.',
        },
        {
          type: 'p',
          text: 'No permitas que nadie minimice lo que sientes con frases como “era solo un animal”. Puedes hacer un pequeño ritual de despedida, guardar su collar o su juguete favorito, y agradecer por los momentos compartidos.',
        },
      ],
    },
    {
      heading: 'Perder lo construido también duele',
      blocks: [
        {
          type: 'p',
          text: 'El terremoto no solo se llevó vidas: también hogares, negocios, recuerdos y años de esfuerzo. Es normal sentir rabia, impotencia, miedo y hasta vergüenza cuando se pierde lo material.',
        },
        {
          type: 'p',
          text: 'Antes de cualquier reflexión profunda, lo urgente es asegurar alimentación, vivienda, salud y protección. A partir de ahí ayudan los pasos pequeños y realistas: organizar documentos, pedir ayuda, informarse sobre los apoyos disponibles.',
        },
        {
          type: 'callout',
          text: 'Si puedes, ayuda a alguien a dar un primer paso práctico hoy.',
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
