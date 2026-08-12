import { ANDRES_CANO } from './autores';
import type { Guide } from './tipos';

export const HERRAMIENTAS_PARA_ACOMPANAR: Guide = {
  slug: 'herramientas-para-acompanar-en-familia',
  title: 'Herramientas para acompañar en familia',
  summary:
    'Ejercicios concretos para hacer en casa: respiración, diario familiar, caja de recuerdos, rituales y autocuidado.',
  emoji: '🕯️',
  readingMinutes: 6,
  author: ANDRES_CANO,
  sections: [
    {
      heading: 'Respiración para calmar en minutos',
      blocks: [
        {
          type: 'p',
          text: 'Cuando la angustia sube, respirar de manera consciente ayuda a bajar la intensidad del miedo y la tensión.',
        },
        {
          type: 'list',
          items: [
            'Inhala lentamente por la nariz contando hasta 4.',
            'Sostén el aire contando hasta 4.',
            'Exhala despacio por la boca contando hasta 6.',
            'Repite el ciclo 5 veces.',
          ],
        },
        {
          type: 'callout',
          text: 'Hazlo acompañado: respiren juntos y cuenten en voz baja. Es una forma de decir sin palabras “estoy contigo”.',
        },
      ],
    },
    {
      heading: 'Un diario familiar para lo que cuesta decir',
      blocks: [
        {
          type: 'p',
          text: 'En una familia que ha tenido pérdidas, a veces es difícil hablar en voz alta. Un cuaderno compartido puede ayudar.',
        },
        {
          type: 'list',
          items: [
            'Elijan un cuaderno especial.',
            'Cada día, quien lo tenga escribe: “hoy me siento…”, “hoy extraño…”, “hoy necesito…”.',
            'Nadie corrige, nadie juzga; solo se comparte.',
          ],
        },
        {
          type: 'p',
          text: 'El diario se convierte en un espacio seguro para expresar y para leer lo que otros sienten.',
        },
      ],
    },
    {
      heading: 'Una caja para recordar y honrar',
      blocks: [
        {
          type: 'p',
          text: 'Una caja de recuerdos es un lugar donde guardamos objetos, fotos y notas que nos conectan con aquello que perdimos: personas, mascotas, el hogar.',
        },
        {
          type: 'list',
          items: [
            'Busquen juntos fotos, cartas y objetos significativos.',
            'Escriban pequeños mensajes o agradecimientos.',
            'Guarden todo en una caja que puedan abrir cuando lo necesiten.',
          ],
        },
        {
          type: 'p',
          text: 'Abrirla en familia y compartir historias valida el dolor, mantiene viva la memoria y nos recuerda que no estamos solos en lo que sentimos.',
        },
      ],
    },
    {
      heading: 'Rituales de despedida',
      blocks: [
        {
          type: 'p',
          text: 'Los rituales ayudan a aceptar la realidad de la pérdida y a honrar a quienes ya no están. No tienen que ser religiosos ni complejos.',
        },
        {
          type: 'list',
          items: [
            'Encender una vela y decir unas palabras.',
            'Escribir una carta de despedida y guardarla.',
            'Plantar un árbol o una planta en su memoria.',
            'Compartir en familia un recuerdo especial.',
          ],
        },
        {
          type: 'p',
          text: 'Estos actos no borran el dolor, pero lo hacen más compartido y más significativo.',
        },
      ],
    },
    {
      heading: 'Preguntas que abren el corazón',
      blocks: [
        {
          type: 'p',
          text: 'En reuniones familiares después de una pérdida, estas preguntas pueden ayudar:',
        },
        {
          type: 'list',
          items: [
            '¿Qué es lo que más recuerdas de esa persona?',
            '¿Qué enseñanza te dejó esta experiencia?',
            '¿Qué necesitas hoy para sentirte un poco mejor?',
            '¿Cómo podemos apoyarnos mejor entre nosotros?',
          ],
        },
        {
          type: 'p',
          text: 'Escucha todas las respuestas sin juzgar. No tienes que estar de acuerdo, solo entender cómo se siente cada persona.',
        },
      ],
    },
    {
      heading: 'Autocuidado en medio del duelo',
      blocks: [
        {
          type: 'p',
          text: 'Cuidarte no es egoísmo: es lo que te permite sostener a los demás.',
        },
        {
          type: 'list',
          items: [
            'Intenta mantener horarios básicos de comida y toma agua con frecuencia.',
            'Busca momentos cortos de descanso, aunque no duermas bien.',
            'Permítete llorar cuando lo necesites.',
            'Evita el consumo excesivo de alcohol y sustancias.',
            'Busca al menos una persona con quien hablar.',
            'No te aísles del todo, acepta ayuda cuando te la ofrezcan y ofrécela cuando tengas energía.',
          ],
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
