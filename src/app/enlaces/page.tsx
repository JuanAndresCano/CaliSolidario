import type { Metadata } from 'next';
import { MUNICIPIO, SITIO } from '@/config/municipios';

export const metadata: Metadata = {
  title: 'Otros recursos',
  description:
    `Plataformas y canales oficiales para desaparecidos, mapas de emergencia y reportes de afectación en ${MUNICIPIO.nombre}.`,
};

type Recurso = {
  nombre: string;
  descripcion: string;
  url?: string;
  contacto?: string;
};

/**
 * Enlaces a plataformas de terceros.
 *
 * Aquí no competimos. Un voluntario hoy tiene que revisar cuatro sitios para
 * saber a dónde ir, y esa fragmentación es el problema. Mandar a la gente al
 * sitio que hace mejor una cosa vale más que hacerla nosotros a medias — muy
 * especialmente en desaparecidos, donde información sin verificar hace daño.
 */
const DESAPARECIDOS: Recurso[] = [
  {
    nombre: 'Colombia te busca',
    descripcion:
      'Registro ciudadano de personas desaparecidas, con categoría específica del terremoto.',
    url: 'https://colombiatebusca.com',
  },
  {
    nombre: 'desaparecidos.co',
    descripcion:
      'Plataforma para reencontrar personas tras el sismo, con miles de registros.',
    url: 'https://desaparecidos.co',
  },
  {
    nombre: 'Cruz Roja Colombiana',
    descripcion:
      'Restablecimiento del contacto familiar, el canal formal en desastres.',
    contacto: 'rcf@cruzrojacolombiana.org',
  },
];

const MAPAS: Recurso[] = [
  {
    nombre: 'Mapa de emergencia',
    descripcion:
      'Mapa de puntos de ayuda que funciona sin señal y se sincroniza al volver la conexión.',
    url: 'https://mapa-emergencia.artefactofilms.workers.dev',
  },
  {
    nombre: 'Aquí Hace Falta',
    descripcion: 'Mapa en tiempo real de necesidades por tipo de insumo.',
    url: 'https://aqui-hace-falta.web.app',
  },
  {
    nombre: 'ConectaColombia 7.4',
    descripcion:
      `Red nacional de iniciativas ciudadanas, más allá de ${MUNICIPIO.nombre}.`,
    url: 'https://www.conectacolombia.org',
  },
];

export default function EnlacesPage() {
  return (
    <div className="py-2">
      <h1 className="text-xl font-bold tracking-tight">Otros recursos</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {SITIO} no hace todo. Estas plataformas cubren cosas que nosotros
        deliberadamente no cubrimos, y las hacen mejor.
      </p>

      <Seccion
        titulo="¿Buscas a alguien?"
        nota="No manejamos reportes de personas desaparecidas. Duplicar esa información dispersa las búsquedas y genera falsas esperanzas. Usa estas plataformas, que ya tienen volumen real de registros."
        recursos={DESAPARECIDOS}
        destacada
      />

      <Seccion
        titulo="Mapas y otras iniciativas"
        recursos={MAPAS}
      />

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Estos sitios son de terceros: no controlamos su contenido ni verificamos
        lo que publican. Si alguno deja de funcionar o cambia, escríbenos para
        actualizarlo.
      </p>
    </div>
  );
}

function Seccion({
  titulo,
  nota,
  recursos,
  destacada = false,
}: {
  titulo: string;
  nota?: string;
  recursos: Recurso[];
  destacada?: boolean;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-base font-bold">{titulo}</h2>

      {nota && (
        <p
          className={
            destacada
              ? 'mt-2 rounded-xl bg-need-bg px-3 py-2.5 text-sm leading-relaxed text-need'
              : 'mt-2 text-sm leading-relaxed text-muted'
          }
        >
          {nota}
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-2.5">
        {recursos.map((r) => (
          <li
            key={r.nombre}
            className="rounded-2xl border border-line bg-surface px-4 py-3.5"
          >
            <h3 className="text-base font-semibold">{r.nombre}</h3>
            <p className="mt-1 text-sm leading-snug text-muted">
              {r.descripcion}
            </p>

            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                role="button"
                className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-ink"
              >
                Abrir
              </a>
            )}

            {r.contacto && (
              <p className="mt-2 text-sm font-semibold">{r.contacto}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
