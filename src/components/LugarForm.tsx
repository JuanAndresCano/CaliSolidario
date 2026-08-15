'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { crearLugar, editarLugar, type EstadoLugar } from '@/app/gestion/actions';
import { MUNICIPIO } from '@/config/municipios';
import { SERVICE_CATEGORIES } from '@/lib/catalog';
import type { Place } from '@/lib/place-utils';

const INICIAL: EstadoLugar = { error: null };

const TIPOS = [
  { value: 'acopio', label: 'Punto de acopio' },
  { value: 'albergue', label: 'Albergue' },
  { value: 'necesidad', label: 'Zona sin ayuda' },
  { value: 'servicio', label: 'Servicio gratuito' },
] as const;

export function LugarForm({ lugar }: { lugar?: Place }) {
  const [estado, accion] = useActionState(
    lugar ? editarLugar : crearLugar,
    INICIAL,
  );
  const [kind, setKind] = useState<string>(lugar?.kind ?? 'acopio');

  return (
    <form action={accion} className="flex flex-col gap-4">
      {lugar && <input type="hidden" name="id" value={lugar.id} />}

      <Campo label="Tipo de lugar" id="kind">
        <select
          id="kind"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-3"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Nombre" id="name">
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

      <Campo label="Organización (opcional)" id="org_name">
        <input
          id="org_name"
          name="org_name"
          maxLength={100}
          defaultValue={lugar?.org_name ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>

      <Campo
        label="Descripción"
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

      <Campo
        label="Qué necesitan"
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

      <Campo label="Dirección" id="address">
        <input
          id="address"
          name="address"
          maxLength={160}
          defaultValue={lugar?.address ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>

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

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Medio de contacto" id="contact_method">
          <select
            id="contact_method"
            name="contact_method"
            defaultValue={lugar?.contact_method ?? ''}
            className="w-full rounded-xl border border-line bg-surface px-3"
          >
            <option value="">Ninguno</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telefono">Llamada</option>
            <option value="otro">Otro</option>
          </select>
        </Campo>
        <Campo label="Número o dato" id="contact_value">
          <input
            id="contact_value"
            name="contact_value"
            maxLength={120}
            defaultValue={lugar?.contact_value ?? ''}
            className="w-full rounded-xl border border-line bg-surface px-3"
          />
        </Campo>
      </div>

      <Campo label="Horario" id="schedule">
        <input
          id="schedule"
          name="schedule"
          maxLength={120}
          defaultValue={lugar?.schedule ?? ''}
          placeholder="8:00 a. m. a 5:00 p. m."
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Campo>

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
          label="Lleno por ahora"
          ayuda="Sigue apareciendo, pero avisando que no vayan todavía."
        />
        <Casilla
          name="is_verified"
          defecto={lugar?.is_verified ?? false}
          label="Verificado"
          ayuda="Márcalo solo si alguien llamó y confirmó. El sello pierde valor si se pone por defecto."
        />
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
