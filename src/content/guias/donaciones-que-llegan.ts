import type { Guide } from './tipos';

export const DONACIONES_QUE_LLEGAN: Guide = {
  slug: 'que-tu-donacion-llegue',
  title: 'Que tu donación llegue a quien la necesita',
  summary:
    'Ya hay gente revendiendo lo donado. Cómo marcar lo que entregas y cómo decidir a quién darle plata.',
  emoji: '📦',
  readingMinutes: 4,
  author: null,
  sections: [
    {
      heading: 'Está pasando',
      blocks: [
        {
          type: 'p',
          text: 'Se están reportando casos de personas revendiendo donaciones. Es una minoría, y no debería hacerte dejar de ayudar: la inmensa mayoría de lo que se entrega llega a donde tiene que llegar. Pero hay cosas sencillas que reducen mucho el incentivo.',
        },
      ],
    },
    {
      heading: 'Marca lo que donas',
      blocks: [
        {
          type: 'p',
          text: 'Un producto que no se puede revender deja de ser negocio. Antes de entregarlo:',
        },
        {
          type: 'list',
          items: [
            'Escribe "DONACIÓN — NO SE VENDE" con marcador permanente, grande y sobre el empaque, no en una etiqueta que se despegue.',
            'Tacha el código de barras. Sin él, un producto no pasa por una caja registradora.',
            'En ropa, marca por dentro, en la etiqueta o en la costura.',
            'Si son varios artículos, marca cada uno y no solo la caja.',
          ],
        },
        {
          type: 'p',
          text: 'Nada de esto afecta a quien de verdad va a usar lo que le das. Un mercado marcado alimenta igual y una cobija marcada abriga igual.',
        },
      ],
    },
    {
      heading: 'Entrega en puntos, no en manos sueltas',
      blocks: [
        {
          type: 'p',
          text: 'Cuando entregas en un punto de acopio organizado queda registro de lo que llegó, hay más de una persona viéndolo y existe alguien a quien reclamarle. Cuando entregas a un particular que dice que va a llevarlo, todo eso depende de su palabra.',
        },
        {
          type: 'p',
          text: 'No se trata de desconfiar de todo el mundo. Se trata de que la buena fe no debería ser el único control.',
        },
      ],
    },
    {
      heading: 'Y con el dinero, más cuidado todavía',
      blocks: [
        {
          type: 'p',
          text: 'Hay muchas personas honestas recogiendo plata para comprar lo que hace falta, y varias lo están haciendo muy bien. El problema no es su intención: es que no hay forma de que quien dona verifique en qué se gastó.',
        },
        {
          type: 'list',
          items: [
            'Prefiere llevar las cosas directamente a un punto de acopio. Lo que entregas es exactamente lo que llega.',
            'Si vas a dar dinero, que sea a una institución regulada, que rinde cuentas y responde legalmente por esos fondos.',
            'Desconfía de cuentas personales, aunque las comparta alguien conocido: quien reenvía el mensaje casi nunca verificó nada.',
          ],
        },
        {
          type: 'callout',
          text: 'En CaliSolidario nadie debería pedirte dinero. Si un aviso te lo pide, repórtalo con el botón de alerta del propio aviso.',
        },
      ],
    },
    {
      heading: 'Si vas a recibir donaciones',
      blocks: [
        {
          type: 'list',
          items: [
            'Anota lo que entra y lo que sale, aunque sea en un cuaderno. Te protege a ti tanto como a quien dona.',
            'Que nunca haya una sola persona sola con las donaciones.',
            'Publica qué recibiste y a dónde fue. La transparencia es lo que hace que la gente vuelva a donar.',
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        'Recomendaciones prácticas recogidas por el equipo de CaliSolidario a partir de reportes de la comunidad durante la emergencia.',
    },
  ],
};
