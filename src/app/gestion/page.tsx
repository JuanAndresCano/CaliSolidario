import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { MUNICIPIO } from '@/config/municipios';
import {
  configDelMunicipio,
  lugaresDelMunicipio,
  permisosDeGestion,
  type MunicipioConfig,
} from '@/lib/gestion';
import type { Place } from '@/lib/place-utils';
import { timeAgo } from '@/lib/time';
import {
  alternarActivo,
  alternarLleno,
  confirmarVigencia,
  guardarContacto,
} from './actions';

export const metadata: Metadata = {
  title: 'Gestión de lugares',
  robots: { index: false, follow: false },
};

const ETIQUETAS: Record<Place['kind'], string> = {
  albergue: 'Albergue',
  acopio: 'Acopio',
  necesidad: 'Zona sin ayuda',
  servicio: 'Servicio',
};

export default async function GestionPage({
  searchParams,
}: PageProps<'/gestion'>) {
  const { creado, guardado, contacto } = await searchParams;

  const permisos = await permisosDeGestion(MUNICIPIO.id);

  // Sin sesión, al login. Con sesión pero sin permiso, 404: quien no es gestor
  // no tiene por qué enterarse de que esta pantalla existe. Mezclar los dos
  // casos manda al usuario a un bucle de login que nunca termina.
  if (!permisos.haySesion) redirect('/login?next=/gestion');
  if (!permisos.municipio) notFound();

  const [lugares, config] = await Promise.all([
    lugaresDelMunicipio(permisos.municipio),
    configDelMunicipio(permisos.municipio),
  ]);
  const activos = lugares.filter((l) => l.is_active);
  const retirados = lugares.filter((l) => !l.is_active);

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight">Gestión de lugares</h1>
        <span className="text-xs text-muted">{permisos.municipio}</span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        Lo que edites aquí se ve en el sitio en segundos. Confirma la vigencia
        aunque no cambie nada: la fecha le dice a la gente si puede confiar en
        el dato.
      </p>

      {(creado || guardado || contacto === '1') && (
        <p className="mt-3 rounded-xl bg-offer-bg px-3 py-2.5 text-sm font-semibold text-offer">
          ✓{' '}
          {creado
            ? 'Lugar creado.'
            : guardado
              ? 'Cambios guardados.'
              : 'Contacto actualizado.'}
        </p>
      )}

      {(contacto === 'invalido' || contacto === 'error') && (
        <p className="mt-3 rounded-xl bg-need-bg px-3 py-2.5 text-sm font-semibold text-need">
          {contacto === 'invalido'
            ? 'Ese número no parece un celular. Escríbelo con los 10 dígitos.'
            : 'No se pudo guardar el contacto. Vuelve a intentarlo.'}
        </p>
      )}

      <Link
        href="/gestion/nuevo"
        role="button"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 font-bold text-brand-ink"
      >
        ＋ Agregar un lugar
      </Link>

      {lugares.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
          Todavía no hay lugares cargados en {MUNICIPIO.nombre}.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-2.5">
          {activos.map((lugar) => (
            <Fila key={lugar.id} lugar={lugar} />
          ))}
        </ul>
      )}

      {retirados.length > 0 && (
        <>
          <h2 className="mt-8 text-base font-bold">
            Retirados ({retirados.length})
          </h2>
          <p className="mt-1 text-sm text-muted">
            No se ven en el sitio. Se pueden volver a activar.
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {retirados.map((lugar) => (
              <Fila key={lugar.id} lugar={lugar} />
            ))}
          </ul>
        </>
      )}

      <Contacto config={config} />
    </div>
  );
}

/**
 * Ajuste que no es del día a día pero que la alcaldía tiene que poder cambiar
 * sola: a qué WhatsApp llegan los reportes de puntos nuevos. Va al final,
 * después de los lugares, porque se toca cuando rota el turno y no cada día.
 */
function Contacto({ config }: { config: MunicipioConfig | null }) {
  return (
    <section className="mt-10 rounded-2xl border border-line bg-surface px-4 py-4">
      <h2 className="text-base font-bold">Contacto para reportes</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Es el WhatsApp de los botones “¿Conoces otro punto?”. Ahí llegan las
        empresas que quieren ofrecer un servicio gratuito y quien reporta un
        acopio nuevo. Cámbialo cuando rote el turno; el sitio lo toma de
        inmediato, sin volver a desplegar.
      </p>

      {config === null ? (
        <p className="mt-3 rounded-xl bg-need-bg px-3 py-2.5 text-sm font-medium text-need">
          Este municipio todavía no está dado de alta en la configuración.
          Escríbele a quien mantiene el sitio.
        </p>
      ) : (
        <form action={guardarContacto} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">WhatsApp</span>
            <input
              // `tel` abre el teclado numérico en el celular, que es desde
              // donde se va a editar esto.
              type="tel"
              name="whatsapp_reportes"
              inputMode="tel"
              autoComplete="off"
              defaultValue={config.whatsapp_reportes ?? ''}
              placeholder="3113179404"
              className="min-h-11 rounded-xl border border-line bg-bg px-3 text-base"
            />
            <span className="text-xs text-muted">
              Con los 10 dígitos basta; el 57 se agrega solo. Déjalo vacío si
              por ahora nadie está respondiendo: el botón desaparece del sitio
              en vez de mandar mensajes a un número muerto.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Quién responde</span>
            <input
              type="text"
              name="responsable"
              maxLength={80}
              autoComplete="off"
              defaultValue={config.responsable ?? ''}
              placeholder="Nombre y cargo"
              className="min-h-11 rounded-xl border border-line bg-bg px-3 text-base"
            />
            <span className="text-xs text-muted">
              No se publica. Sirve para que quien entre al turno sepa a quién
              releva.
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-brand px-4 font-bold text-brand-ink"
            >
              Guardar contacto
            </button>
            <span className="text-xs text-muted" suppressHydrationWarning>
              Actualizado {timeAgo(config.updated_at)}
            </span>
          </div>
        </form>
      )}
    </section>
  );
}

function Fila({ lugar }: { lugar: Place }) {
  return (
    <li
      className={
        lugar.is_active
          ? 'rounded-2xl border border-line bg-surface px-4 py-3.5'
          : 'rounded-2xl border border-line bg-surface px-4 py-3.5 opacity-60'
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          {ETIQUETAS[lugar.kind]}
        </span>
        {lugar.is_full && (
          <span className="rounded-full bg-need-bg px-2 py-0.5 text-xs font-bold text-need">
            Lleno
          </span>
        )}
        {lugar.is_verified && (
          <span className="rounded-full bg-offer-bg px-2 py-0.5 text-xs font-bold text-offer">
            ✓ Verificado
          </span>
        )}
        <span className="ml-auto text-xs text-muted" suppressHydrationWarning>
          {timeAgo(lugar.confirmed_at)}
        </span>
      </div>

      <h3 className="mt-1.5 text-base font-semibold leading-snug">
        {lugar.name}
      </h3>
      {lugar.supplies_needed && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">
          Necesitan: {lugar.supplies_needed}
        </p>
      )}

      {/* Las tres acciones de todos los días, a un toque. Editar es para
          cambios de fondo; esto es para el día a día. */}
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={confirmarVigencia}>
          <input type="hidden" name="id" value={lugar.id} />
          <button
            type="submit"
            className="rounded-xl border border-line px-3 text-sm font-semibold"
          >
            Sigue vigente
          </button>
        </form>

        <form action={alternarLleno}>
          <input type="hidden" name="id" value={lugar.id} />
          <input type="hidden" name="lleno" value={String(lugar.is_full)} />
          <button
            type="submit"
            className={
              lugar.is_full
                ? 'rounded-xl bg-brand px-3 text-sm font-semibold text-brand-ink'
                : 'rounded-xl border border-need px-3 text-sm font-semibold text-need'
            }
          >
            {lugar.is_full ? 'Volvió a recibir' : 'Marcar lleno'}
          </button>
        </form>

        <Link
          href={`/gestion/${lugar.id}`}
          className="flex min-h-11 items-center rounded-xl border border-line px-3 text-sm font-semibold"
        >
          Editar
        </Link>

        <form action={alternarActivo} className="ml-auto">
          <input type="hidden" name="id" value={lugar.id} />
          <input type="hidden" name="activo" value={String(lugar.is_active)} />
          <button
            type="submit"
            className="min-h-11 text-xs text-muted underline underline-offset-4"
          >
            {lugar.is_active ? 'Retirar' : 'Reactivar'}
          </button>
        </form>
      </div>
    </li>
  );
}
