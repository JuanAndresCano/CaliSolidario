import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommentSection } from '@/components/CommentSection';
import { ConflictBadge } from '@/components/ConflictBadge';
import { SafetyNote } from '@/components/SafetyNote';
import { getComments } from '@/lib/comments';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/catalog';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/time';
import type { Post, PostContact } from '@/lib/types';

export async function generateMetadata({
  params,
}: PageProps<'/aviso/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('title')
    .eq('id', id)
    .maybeSingle();

  return {
    title: data?.title ?? 'Aviso',
    // Un aviso caduca a los 7 días; su copia en la caché de un buscador, no.
    // Ver src/app/robots.ts para el razonamiento completo.
    robots: { index: false, follow: true },
  };
}

export default async function PostPage({ params }: PageProps<'/aviso/[id]'>) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: auth }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!post) notFound();

  const typedPost = post as Post;
  const user = auth.user;

  // RLS devuelve estas filas solo si hay sesión: no hace falta comprobarlo aquí.
  const [{ data: contact }, comments] = await Promise.all([
    supabase.from('post_contacts').select('*').eq('post_id', id).maybeSingle(),
    user ? getComments(supabase, id, user.id) : Promise.resolve([]),
  ]);

  const isNeed = typedPost.kind === 'need';
  const isClosed = typedPost.status !== 'open';

  return (
    <article className="py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            isNeed
              ? 'rounded-full bg-need-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-need'
              : 'rounded-full bg-offer-bg px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-offer'
          }
        >
          {isNeed ? 'Necesita' : 'Ofrece'}
        </span>
        <span className="text-xs text-muted">
          {CATEGORY_EMOJIS[typedPost.category]}{' '}
          {CATEGORY_LABELS[typedPost.category]}
        </span>
        <span className="text-xs text-muted" suppressHydrationWarning>
          · {timeAgo(typedPost.created_at)}
        </span>
      </div>

      <h1 className="mt-2 text-xl font-bold leading-snug tracking-tight">
        {typedPost.title}
      </h1>

      {typedPost.warning_count > 0 && (
        <div className="mt-3">
          <ConflictBadge count={typedPost.warning_count} size="large" />
        </div>
      )}

      {isClosed && (
        <p className="mt-3 rounded-xl bg-offer-bg px-3 py-2.5 text-sm font-semibold text-offer">
          {typedPost.status === 'fulfilled'
            ? '✓ Este aviso ya fue resuelto.'
            : 'Este aviso venció y ya no está activo.'}
        </p>
      )}

      <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed">
        {typedPost.description}
      </p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        {typedPost.address && (
          <>
            <dt className="text-muted">Dirección</dt>
            <dd>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${typedPost.address}, Cali, Colombia`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {typedPost.address}
              </a>
            </dd>
          </>
        )}
        {(typedPost.barrio || typedPost.comuna) && (
          <>
            <dt className="text-muted">Zona</dt>
            <dd>
              {[typedPost.barrio, typedPost.comuna].filter(Boolean).join(' · ')}
            </dd>
          </>
        )}
        {typedPost.quantity_text && (
          <>
            <dt className="text-muted">Cantidad</dt>
            <dd>{typedPost.quantity_text}</dd>
          </>
        )}
      </dl>

      <div className="mt-5">
        {user ? (
          <ContactBlock contact={contact as PostContact | null} closed={isClosed} />
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-sm font-semibold">Datos de contacto ocultos</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Entra con tu cuenta para verlos. Los mantenemos cerrados para que
              no queden expuestos a cualquiera que pase por internet.
            </p>
            <Link
              href={`/login?next=/aviso/${typedPost.id}`}
              role="button"
              className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-ink"
            >
              Entrar con Google
            </Link>
          </div>
        )}
      </div>

      <CommentSection
        postId={typedPost.id}
        comments={comments}
        canWrite={Boolean(user)}
      />

      <SafetyNote />

      <Link
        href="/"
        className="mt-6 inline-flex items-center text-sm text-muted underline underline-offset-4"
      >
        Volver al tablero
      </Link>
    </article>
  );
}

function ContactBlock({
  contact,
  closed,
}: {
  contact: PostContact | null;
  closed: boolean;
}) {
  if (!contact) {
    return (
      <p className="rounded-2xl border border-line bg-surface px-4 py-4 text-sm text-muted">
        Este aviso no tiene datos de contacto.
      </p>
    );
  }

  const digits = contact.value.replace(/\D/g, '');
  // Colombia: si vienen 10 dígitos es un celular local, le anteponemos el 57.
  const intl = digits.length === 10 ? `57${digits}` : digits;

  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-4">
      <p className="text-sm font-semibold">Contacto</p>
      <p className="mt-1 text-lg font-bold tracking-tight">{contact.value}</p>
      {contact.notes && (
        <p className="mt-1 text-sm text-muted">{contact.notes}</p>
      )}

      {!closed && contact.method === 'whatsapp' && (
        <a
          href={`https://wa.me/${intl}`}
          target="_blank"
          rel="noopener noreferrer"
          role="button"
          className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-ink"
        >
          Escribir por WhatsApp
        </a>
      )}

      {!closed && contact.method === 'telefono' && (
        <a
          href={`tel:+${intl}`}
          role="button"
          className="mt-3 flex items-center justify-center rounded-xl bg-brand px-4 font-semibold text-brand-ink"
        >
          Llamar
        </a>
      )}
    </div>
  );
}
