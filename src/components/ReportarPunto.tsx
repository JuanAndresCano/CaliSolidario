import { Plus } from 'lucide-react';
import { SITIO } from '@/config/municipios';
import { whatsappLink } from '@/lib/site';

/**
 * Invitación a reportar un punto nuevo por WhatsApp.
 *
 * El mensaje va prellenado con las preguntas exactas que hacen falta para
 * cargarlo. Sin eso llegan mensajes de una línea ("hay un punto en Siloé") que
 * obligan a tres idas y vueltas antes de poder publicar nada.
 *
 * El nombre del sitio sale de `SITIO` y no está escrito a mano: antes decía
 * "CaliSolidario" también en el sitio de Filandia, así que a la alcaldía le
 * llegaban reportes nombrando otra ciudad.
 */
const PLANTILLAS = {
  acopio: `Hola, quiero reportar un PUNTO DE ACOPIO para ${SITIO}:

• Nombre del lugar:
• Dirección:
• Barrio o comuna:
• Qué necesitan:
• Qué ya tienen de sobra:
• Horario:
• Teléfono de contacto:`,

  necesidad: `Hola, quiero reportar una ZONA QUE NECESITA AYUDA para ${SITIO}:

• Barrio o sector:
• Dirección o punto de referencia:
• Qué necesitan:
• Cómo supiste (fuiste, te contaron, lo viste en redes):`,

  servicio: `Hola, quiero ofrecer un SERVICIO GRATUITO en ${SITIO}:

• Nombre del servicio:
• Organización o profesional:
• En qué consiste:
• Virtual o presencial:
• Cómo agenda la gente:
• Disponibilidad o cupos:
• Certificaciones:`,
} as const;

const TITULOS = {
  acopio: '¿Conoces otro punto de acopio?',
  necesidad: '¿Sabes de una zona a la que no está llegando ayuda?',
  servicio: '¿Tu organización quiere ofrecer un servicio?',
} as const;

const TEXTOS = {
  acopio:
    'Escríbenos por WhatsApp y lo publicamos. El mensaje ya va con lo que necesitamos saber.',
  necesidad:
    'Escríbenos y la publicamos para que los voluntarios sepan hacia dónde ir.',
  servicio:
    'Lo revisamos y lo publicamos. No cobramos por aparecer ni recibimos comisión.',
} as const;

export async function ReportarPunto({
  tipo,
}: {
  tipo: keyof typeof PLANTILLAS;
}) {
  const href = await whatsappLink(PLANTILLAS[tipo]);

  // Sin número configurado no se muestra nada: un botón que no lleva a
  // ninguna parte es peor que la ausencia del botón.
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-4 py-3.5 active:opacity-70"
    >
      <Plus aria-hidden className="size-6 shrink-0" />
      <span>
        <span className="block text-sm font-semibold">{TITULOS[tipo]}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">
          {TEXTOS[tipo]}
        </span>
      </span>
    </a>
  );
}
