'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { crearLugar, editarLugar, type EstadoLugar } from '@/app/gestion/actions';
import { MUNICIPIO } from '@/config/municipios';
import { MAX_CONTACTOS, SERVICE_CATEGORIES } from '@/lib/catalog';
import { contactosDe, type Place, type PlaceContact } from '@/lib/place-utils';

const INICIAL: EstadoLugar = { error: null };

/**
 * Ranuras fijas en vez de un "＋ agregar contacto" dinámico. Tres cubre lo que
 * hay en la práctica —el caso más cargado hoy son los tres abogados de Icesi—
 * y un formulario sin estado se recupera solo si el envío falla. Cuando
 * aparezca un lugar con cinco, esto se convierte en lista.
 */
const RANURAS = Array.from({ length: MAX_CONTACTOS }, (_, i) => i + 1);

const TIPOS = [
  { value: 'acopio', label: 'Punto de acopio' },
  { value: 'albergue', label: 'Albergue' },
  { value: 'necesidad', label: 'Zona sin ayuda' },
  { value: 'servicio', label: 'Servicio gratuito' },
] as const;

type Tipo = (typeof TIPOS)[number]['value'];

/**
 * Qué se le pregunta a cada tipo, y en qué orden.
 *
 * Antes el formulario preguntaba lo mismo a todos: a un servicio por
 * videollamada le pedía dirección, comuna, "qué necesitan" y "qué les sobra",
 * y a una zona desatendida le pedía sitio web y logo. Quien carga los datos
 * termina adivinando cuáles ignorar, y la primera impresión de una alcaldía
 * con un formulario que pide cosas absurdas es difícil de recuperar.
 *
 * Lo que no está en esta lista NO desaparece: cae al desplegable del final.
 * Ocultarlo del todo borraría en silencio un dato ya cargado al cambiarle el
 * tipo a un lugar, y "no suele aplicar" no es lo mismo que "no existe".
 */
const PRINCIPALES: Record<Tipo, string[]> = {
  acopio: [
    'name', 'org_name', 'address', 'comuna', 'coords', 'schedule',
    'contactos', 'supplies_needed', 'supplies_surplus', 'description',
    'safety_note',
  ],
  albergue: [
    'name', 'org_name', 'address', 'comuna', 'coords', 'contactos',
    'description', 'supplies_needed', 'safety_note', 'schedule',
  ],
  necesidad: [
    'name', 'address', 'comuna', 'coords', 'description', 'supplies_needed',
    'safety_note', 'contactos',
  ],
  servicio: [
    'name', 'org_name', 'description', 'contactos', 'schedule', 'website',
    'image_url', 'address', 'coords',
  ],
};

/** Todos los campos, en el orden en que se muestran los del desplegable. */
const TODOS = [
  'name', 'org_name', 'description', 'contactos', 'address', 'comuna',
  'coords', 'schedule', 'supplies_needed', 'supplies_surplus', 'safety_note',
  'website', 'image_url',
];

/** Lo que cambia de nombre según el tipo. El resto se llama igual siempre. */
const ETIQUETAS: Record<string, Partial<Record<Tipo, string>>> = {
  name: {
    acopio: 'Nombre del lugar',
    albergue: 'Nombre del albergue',
    necesidad: 'Barrio o sector',
    servicio: 'Nombre del servicio',
  },
  description: {
    necesidad: 'Qué está pasando',
    servicio: 'En qué consiste',
  },
  supplies_needed: {
    acopio: 'Qué necesitan',
    albergue: 'Qué le falta al albergue',
    necesidad: 'Qué necesita la zona',
  },
  schedule: { servicio: 'Disponibilidad' },
};

function etiqueta(campo: string, tipo: Tipo, defecto: string): string {
  return ETIQUETAS[campo]?.[tipo] ?? defecto;
}

export function LugarForm({ lugar }: { lugar?: Place }) {
  const [estado, accion] = useActionState(
    lugar ? editarLugar : crearLugar,
    INICIAL,
  );
  const [kind, setKind] = useState<Tipo>((lugar?.kind as Tipo) ?? 'acopio');
  const contactos = lugar ? contactosDe(lugar) : [];

  const campos: Record<string, React.ReactNode> = {
    name: (
      <Campo label={etiqueta('name', kind, 'Nombre')} id="name">
        <input
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={100}
          defaultValue={lugar?.name}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),

    org_name: (
      <Campo label="Organización (opcional)" id="org_name">
        <input
          id="org_name"
          name="org_name"
          maxLength={100}
          defaultValue={lugar?.org_name ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),

    description: (
      <Campo
        label={etiqueta('description', kind, 'Descripción')}
        id="description"
        ayuda="Lo que alguien necesita saber antes de ir. Los saltos de línea se respetan."
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={800}
          defaultValue={lugar?.description ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </Campo>
    ),

    contactos: (
      <fieldset className="rounded-xl border border-line px-3 py-3">
        <legend className="px-1 text-sm font-semibold">Contactos</legend>
        <p className="text-xs leading-relaxed text-muted">
          El primero es el principal: es el del botón grande en la tarjeta. Los
          demás salen debajo. Deja vacío el número para quitar un contacto.
        </p>

        {RANURAS.map((i) => (
          <RanuraContacto key={i} indice={i} contacto={contactos[i - 1]} />
        ))}
      </fieldset>
    ),

    address: (
      <Campo
        label="Dirección"
        id="address"
        ayuda={
          kind === 'servicio'
            ? 'Solo si atienden presencialmente en algún sitio.'
            : undefined
        }
      >
        <input
          id="address"
          name="address"
          maxLength={160}
          defaultValue={lugar?.address ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),

    comuna: (
      <Campo label={MUNICIPIO.divisiones.etiqueta} id="comuna">
        {MUNICIPIO.divisiones.opciones.length > 0 ? (
          <select
            id="comuna"
            name="comuna"
            defaultValue={lugar?.comuna ?? ''}
            className="w-full rounded-xl border border-line bg-surface px-3"
          >
            <option value="">Sin especificar</option>
            {MUNICIPIO.divisiones.opciones.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="comuna"
            name="comuna"
            maxLength={60}
            defaultValue={lugar?.comuna ?? ''}
            className="w-full rounded-xl border border-line bg-surface px-3"
          />
        )}
      </Campo>
    ),

    coords: (
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Latitud" id="lat" ayuda="Clic derecho en Maps">
          <input
            id="lat"
            name="lat"
            inputMode="decimal"
            defaultValue={lugar?.lat ?? ''}
            placeholder="3.4516"
            className="w-full rounded-xl border border-line bg-surface px-3"
          />
        </Campo>
        <Campo label="Longitud" id="lng" ayuda="El segundo número">
          <input
            id="lng"
            name="lng"
            inputMode="decimal"
            defaultValue={lugar?.lng ?? ''}
            placeholder="-76.532"
            className="w-full rounded-xl border border-line bg-surface px-3"
          />
        </Campo>
      </div>
    ),

    schedule: (
      <Campo label={etiqueta('schedule', kind, 'Horario')} id="schedule">
        <input
          id="schedule"
          name="schedule"
          maxLength={120}
          defaultValue={lugar?.schedule ?? ''}
          placeholder={
            kind === 'servicio'
              ? 'Lunes a viernes, con cita previa'
              : '8:00 a. m. a 5:00 p. m.'
          }
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),

    supplies_needed: (
      <Campo
        label={etiqueta('supplies_needed', kind, 'Qué necesitan')}
        id="supplies_needed"
        ayuda="Sale en rojo en la tarjeta. Para listas largas, agrúpalas con títulos en mayúscula y saltos de línea."
      >
        <textarea
          id="supplies_needed"
          name="supplies_needed"
          rows={4}
          maxLength={2000}
          defaultValue={lugar?.supplies_needed ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </Campo>
    ),

    supplies_surplus: (
      <Campo
        label="Qué les sobra"
        id="supplies_surplus"
        ayuda="Igual de importante: evita que sigan llegando cosas que ya tienen de más."
      >
        <textarea
          id="supplies_surplus"
          name="supplies_surplus"
          rows={2}
          maxLength={2000}
          defaultValue={lugar?.supplies_surplus ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </Campo>
    ),

    safety_note: (
      <Campo
        label="Aviso de seguridad"
        id="safety_note"
        ayuda="Sale destacado arriba de todo. Describe la situación, no al barrio."
      >
        <textarea
          id="safety_note"
          name="safety_note"
          rows={3}
          maxLength={400}
          defaultValue={lugar?.safety_note ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </Campo>
    ),

    website: (
      <Campo label="Sitio web (https)" id="website">
        <input
          id="website"
          name="website"
          type="url"
          maxLength={200}
          defaultValue={lugar?.website ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),

    image_url: (
      <Campo
        label="Imagen (https)"
        id="image_url"
        ayuda="Miniatura de la organización. Suele ser su og:image."
      >
        <input
          id="image_url"
          name="image_url"
          type="url"
          maxLength={300}
          defaultValue={lugar?.image_url ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>
    ),
  };

  const principales = PRINCIPALES[kind];
  const secundarios = TODOS.filter((c) => !principales.includes(c));

  return (
    <form action={accion} className="flex flex-col gap-4">
      {lugar && <input type="hidden" name="id" value={lugar.id} />}

      <Campo label="Tipo de lugar" id="kind">
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as Tipo)}
          className="w-full rounded-xl border border-line bg-surface px-3"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Campo>

      {kind === 'servicio' && (
        <Campo label="Categoría del servicio" id="service_category">
          <select
            id="service_category"
            name="service_category"
            defaultValue={lugar?.service_category ?? 'salud_mental'}
            className="w-full rounded-xl border border-line bg-surface px-3"
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </Campo>
      )}

      {principales.map((campo) => (
        <div key={campo}>{campos[campo]}</div>
      ))}

      {secundarios.length > 0 && (
        <details className="rounded-xl border border-dashed border-line px-3 py-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Otros campos ({secundarios.length})
          </summary>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            No suelen aplicar a este tipo de lugar, pero si ya tienen algo
            cargado sigue guardado.
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {secundarios.map((campo) => (
              <div key={campo}>{campos[campo]}</div>
            ))}
          </div>
        </details>
      )}

      <fieldset className="rounded-xl border border-line px-3 py-3">
        <legend className="px-1 text-sm font-semibold">Estado</legend>
        <Casilla
          name="is_active"
          defecto={lugar ? lugar.is_active : true}
          label="Visible en el sitio"
          ayuda="Desmárcalo para retirarlo sin borrarlo."
        />
        <Casilla
          name="is_full"
          defecto={lugar?.is_full ?? false}
          label={kind === 'albergue' ? 'Sin cupo por ahora' : 'Lleno por ahora'}
          ayuda="Sigue apareciendo, pero avisando que no vayan todavía."
        />
        <Casilla
          name="is_verified"
          defecto={lugar?.is_verified ?? false}
          label="Verificado"
          ayuda="Márcalo solo si alguien llamó y confirmó. El sello pierde valor si se pone por defecto."
        />
        {/* Solo tiene sentido en servicios: un acopio tiene dirección física y
            mostrarlo en otro municipio mandaría gente a cruzar el país. */}
        {kind === 'servicio' && (
          <Casilla
            name="disponible_en_todos"
            defecto={lugar?.disponible_en_todos ?? false}
            label="Se atiende desde cualquier municipio"
            ayuda="Para servicios virtuales. Aparece en todos los sitios, no solo en este, pero lo sigues administrando tú."
          />
        )}
      </fieldset>

      {estado.error && (
        <p role="alert" className="rounded-xl bg-need-bg px-3 py-2.5 text-sm text-need">
          {estado.error}
        </p>
      )}

      <Guardar nuevo={!lugar} />
    </form>
  );
}

function Guardar({ nuevo }: { nuevo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand px-4 font-bold text-brand-ink disabled:opacity-60"
    >
      {pending ? 'Guardando…' : nuevo ? 'Crear lugar' : 'Guardar cambios'}
    </button>
  );
}

function RanuraContacto({
  indice,
  contacto,
}: {
  indice: number;
  contacto?: PlaceContact;
}) {
  return (
    <div className="mt-3 border-t border-line pt-3 first:mt-2 first:border-0 first:pt-0">
      <div className="grid grid-cols-[7rem_1fr] gap-2">
        <select
          name={`contact_method_${indice}`}
          aria-label={`Medio del contacto ${indice}`}
          defaultValue={contacto?.method ?? 'whatsapp'}
          className="rounded-xl border border-line bg-surface px-2 text-sm"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="telefono">Llamada</option>
          <option value="otro">Otro</option>
        </select>
        <input
          name={`contact_value_${indice}`}
          inputMode="tel"
          maxLength={120}
          aria-label={`Número del contacto ${indice}`}
          defaultValue={contacto?.value ?? ''}
          placeholder={indice === 1 ? 'Número o dato' : 'Otro número (opcional)'}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </div>
      <input
        name={`contact_label_${indice}`}
        maxLength={60}
        aria-label={`Quién contesta en el contacto ${indice}`}
        defaultValue={contacto?.label ?? ''}
        placeholder="Quién contesta (opcional)"
        className="mt-2 w-full rounded-xl border border-line bg-surface px-3 text-sm"
      />
    </div>
  );
}

function Campo({
  label,
  id,
  ayuda,
  children,
}: {
  label: string;
  id: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {ayuda && <p className="mt-1.5 text-xs text-muted">{ayuda}</p>}
    </div>
  );
}

function Casilla({
  name,
  defecto,
  label,
  ayuda,
}: {
  name: string;
  defecto: boolean;
  label: string;
  ayuda: string;
}) {
  return (
    <label className="mt-2 flex items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defecto}
        className="mt-0.5 size-5 min-h-0"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs leading-snug text-muted">{ayuda}</span>
      </span>
    </label>
  );
}
