import Link from 'next/link';
import { FeedList } from '@/components/FeedList';
import { FeedTabs } from '@/components/FeedTabs';
import { SafetyNote } from '@/components/SafetyNote';
import { countResolved, getFeed } from '@/lib/feed';

/**
 * Una consulta a Postgres por minuto sirve a todos los visitantes: esta página
 * se renderiza en el servidor y se cachea. Es lo que mantiene el tablero
 * dentro del plan gratuito aunque el enlace se difunda por WhatsApp.
 */
export const revalidate = 60;

export default async function HomePage() {
  const [posts, resolvedCount] = await Promise.all([getFeed(), countResolved()]);

  return (
    <>
      <h1 className="sr-only">CaliSolidario — ayuda que llega, en Cali</h1>


      {/*
        Las dos acciones posibles, gigantes y arriba de todo. La gente llega
        estresada desde un enlace de WhatsApp: primero decide, después explora.
      */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link
          href="/publicar?tipo=necesito"
          className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl bg-need px-3 py-4 text-center text-white active:opacity-80"
        >
          <span aria-hidden className="text-3xl leading-none">🙋</span>
          <span className="text-base font-bold leading-tight">
            Necesito ayuda
          </span>
          <span className="text-xs leading-tight opacity-90">
            Pide lo que te falta
          </span>
        </Link>
        <Link
          href="/publicar?tipo=ofrezco"
          className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl bg-brand px-3 py-4 text-center text-brand-ink active:opacity-80"
        >
          <span aria-hidden className="text-3xl leading-none">🤝</span>
          <span className="text-base font-bold leading-tight">
            Quiero ayudar
          </span>
          <span className="text-xs leading-tight opacity-90">
            Ofrece lo que tienes
          </span>
        </Link>
      </div>

      {resolvedCount > 0 && (
        <Link
          href="/resueltas"
          className="mb-4 flex items-center gap-2 rounded-xl bg-offer-bg px-3 py-2.5"
        >
          <span aria-hidden className="text-lg">✓</span>
          <span className="text-sm font-semibold text-offer">
            {resolvedCount === 1
              ? '1 ayuda ya se concretó'
              : `${resolvedCount} ayudas ya se concretaron`}
          </span>
          <span className="ml-auto text-sm text-offer underline underline-offset-4">
            Ver
          </span>
        </Link>
      )}

      <FeedTabs current="/" />
      <FeedList posts={posts} />
      <SafetyNote />
    </>
  );
}
