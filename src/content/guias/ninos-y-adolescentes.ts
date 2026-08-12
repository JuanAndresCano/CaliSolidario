import { ANDRES_CANO } from './autores';
import type { Guide } from './tipos';

export const NINOS_Y_ADOLESCENTES: Guide = {
  slug: 'acompanar-a-ninos-y-adolescentes',
  title: 'Acompañar a niñas, niños y adolescentes',
  summary:
    'Ellos también sufren, aunque no lo digan igual que un adulto. Cómo explicarles, escucharlos y darles seguridad.',
  emoji: '🎒',
  readingMinutes: 3,
  author: ANDRES_CANO,
  sections: [
    {
      heading: 'También sufren, y necesitan ser escuchados',
      blocks: [
        {
          type: 'p',
          text: 'Las niñas, niños y adolescentes viven la pérdida con la misma intensidad que un adulto, pero la expresan de otra manera: con juego, con silencio, con rabia o con preguntas que incomodan.',
        },
        {
          type: 'list',
          items: [
            'Explica lo ocurrido con palabras sencillas y honestas.',
            'Permite que hagan preguntas, aunque sean difíciles de responder.',
            'Valida sus emociones: el miedo, la tristeza y el enojo son legítimos.',
            'Mantén las rutinas básicas: comer y dormir a las horas de siempre les devuelve seguridad.',
            'Anímalos a dibujar o a jugar lo que sienten, cuando no encuentran las palabras.',
          ],
        },
        {
          type: 'callout',
          text: 'Regálales tiempo de calidad para que expresen su mundo interno. No hace falta que sea mucho; hace falta que sea sin prisa.',
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
