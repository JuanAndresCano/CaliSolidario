import { ANDRES_CANO } from './autores';
import type { Guide } from './tipos';

export const COMUNIDAD_Y_SENTIDO: Guide = {
  slug: 'comunidad-y-sentido',
  title: 'La comunidad que sostiene',
  summary:
    'Después de un terremoto los recursos más importantes no son los materiales, sino los humanos.',
  emoji: '🤝',
  readingMinutes: 3,
  author: ANDRES_CANO,
  sections: [
    {
      heading: 'No estamos solos',
      blocks: [
        {
          type: 'p',
          text: 'Después de un terremoto, los recursos más importantes no son solo materiales, sino humanos. Hay formas concretas de sostenernos entre vecinos:',
        },
        {
          type: 'list',
          items: [
            'Organizar comidas comunitarias.',
            'Crear grupos de escucha y conversación.',
            'Compartir información sobre ayudas y trámites.',
            'Cuidar entre todos a niñas, niños y personas mayores.',
          ],
        },
        {
          type: 'p',
          text: 'La comunidad no elimina el dolor, pero lo hace más llevadero. Cada gesto de solidaridad es un mensaje: “tu vida nos importa”.',
        },
      ],
    },
    {
      heading: 'Tomar sentido del dolor',
      blocks: [
        {
          type: 'p',
          text: 'No se trata de buscarle “el lado positivo” a la tragedia, sino de encontrar un sentido personal con el tiempo. Estas preguntas pueden ayudar cuando el dolor ya no es tan intenso:',
        },
        {
          type: 'list',
          items: [
            '¿Qué aprendí sobre mí en este proceso?',
            '¿Qué cosas daba por hechas y ahora valoro más?',
            '¿Qué legado quiero construir en honor a quienes se fueron?',
          ],
        },
        {
          type: 'p',
          text: 'No hay respuestas correctas: solo tu verdad, a tu ritmo.',
        },
      ],
    },
    {
      heading: 'Lo que esta experiencia nos invita a valorar',
      blocks: [
        {
          type: 'p',
          text: 'Las pérdidas nos recuerdan que nada está garantizado y que la vida es frágil. No podemos elegir lo que sucede, pero sí cómo nos relacionamos con lo que pasa.',
        },
        {
          type: 'list',
          items: [
            'Nuestras relaciones y el tiempo con los seres queridos.',
            'Nuestra comunidad y su solidaridad.',
            'Nuestro propio cuidado físico y emocional.',
            'La importancia de pedir y de ofrecer apoyo.',
          ],
        },
        {
          type: 'callout',
          text: 'Piensa hoy: ¿qué es lo más valioso que quieres cuidar en tu vida a partir de esta experiencia?',
        },
      ],
    },
  ],
  sources: [
    {
      label:
        'Contenido escrito por Andrés Cano para Tríada Aliados, adaptado a formato web por CaliSolidario.',
    },
  ],
};
