'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CATEGORIES, COMUNAS, CONTACT_METHODS, KINDS } from '@/lib/catalog';
import { createPost, type CreatePostState } from '@/app/publicar/actions';

const INITIAL: CreatePostState = { error: null };

export function NewPostForm() {
  const [state, action] = useActionState(createPost, INITIAL);
  const [kind, setKind] = useState<string>('need');
  const [method, setMethod] = useState<string>('whatsapp');

  const isPhone = method === 'whatsapp' || method === 'telefono';

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">
          ¿Qué vas a publicar?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className={
                kind === k.value
                  ? 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-3 font-semibold text-brand-ink'
                  : 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-3'
              }
            >
              <input
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
                className="sr-only"
              />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Categoría" htmlFor="category">
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full rounded-xl border border-line bg-surface px-3"
        >
          <option value="" disabled>
            Elige una…
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Título"
        htmlFor="title"
        hint={kind === 'need' ? 'Ej: Necesito agua para 4 personas' : 'Ej: Tengo 20 colchonetas'}
      >
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={5}
          maxLength={90}
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Field>

      <Field
        label="Descripción"
        htmlFor="description"
        hint="Cuenta lo esencial: qué, para cuántas personas y hasta cuándo."
      >
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </Field>

      <Field label="Cantidad (opcional)" htmlFor="quantity_text">
        <input
          id="quantity_text"
          name="quantity_text"
          type="text"
          maxLength={60}
          placeholder="Ej: 10 mercados, 3 cajas"
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Field>

      <Field
        label="Dirección"
        htmlFor="address"
        hint="Es pública: cualquiera que abra el tablero la va a ver. Es lo que permite que las brigadas lleguen al sitio."
      >
        <input
          id="address"
          name="address"
          type="text"
          maxLength={160}
          autoComplete="street-address"
          placeholder="Ej: Calle 44 # 12-30, casa de reja verde"
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Field>

      <Field label="Barrio" htmlFor="barrio">
        <input
          id="barrio"
          name="barrio"
          type="text"
          maxLength={60}
          placeholder="Ej: El Poblado"
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </Field>

      <Field
        label="Comuna (si la sabes)"
        htmlFor="comuna"
        hint="Sirve para que la gente filtre por zona. Si no la tienes clara, déjala en blanco."
      >
        <select
          id="comuna"
          name="comuna"
          defaultValue=""
          className="w-full rounded-xl border border-line bg-surface px-3"
        >
          <option value="">No la sé</option>
          {COMUNAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">
          ¿Cómo te contactan?
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {CONTACT_METHODS.map((m) => (
            <label
              key={m.value}
              className={
                method === m.value
                  ? 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-2 text-sm font-semibold text-brand-ink'
                  : 'flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-2 text-sm'
              }
            >
              <input
                type="radio"
                name="contact_method"
                value={m.value}
                checked={method === m.value}
                onChange={() => setMethod(m.value)}
                className="sr-only"
              />
              {m.label}
            </label>
          ))}
        </div>
        <input
          name="contact_value"
          type={isPhone ? 'tel' : 'text'}
          inputMode={isPhone ? 'tel' : 'text'}
          required
          maxLength={120}
          placeholder={isPhone ? '3001234567' : 'Ej: @mi_usuario en Instagram'}
          aria-label="Dato de contacto"
          className="mt-2 w-full rounded-xl border border-line bg-surface px-3"
        />
        <p className="mt-1.5 text-xs text-muted">
          Solo lo ven personas que hayan entrado con su cuenta, nunca los
          visitantes anónimos.
        </p>
      </fieldset>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-need-bg px-3 py-2.5 text-sm text-need"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-xs leading-relaxed text-muted">
        Tu aviso se archiva solo a los 7 días. Puedes tener 3 avisos abiertos a
        la vez.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand px-4 font-bold text-brand-ink disabled:opacity-60"
    >
      {pending ? 'Publicando…' : 'Publicar aviso'}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
