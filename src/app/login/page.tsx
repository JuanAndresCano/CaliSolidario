import type { Metadata } from 'next';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export const metadata: Metadata = {
  title: 'Entrar',
};

/** Rutas internas permitidas como destino después de entrar. */
const ALLOWED_NEXT = [
  '/',
  '/publicar',
  '/mis-avisos',
  '/necesidades',
  '/ofertas',
  '/admin',
  '/gestion',
];

function safeNext(raw: string | undefined): string {
  if (!raw) return '/';
  // Solo rutas internas: un `next` con host arbitrario convertiría el login en
  // un redirector abierto.
  if (ALLOWED_NEXT.includes(raw)) return raw;
  if (/^\/aviso\/[0-9a-f-]{36}$/i.test(raw)) return raw;
  if (/^\/publicar\?tipo=(necesito|ofrezco)$/.test(raw)) return raw;
  return '/';
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === 'string' ? next : undefined);

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold tracking-tight">Entra para participar</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Mirar el tablero es libre. Necesitas una cuenta para publicar un aviso,
        ver los datos de contacto de alguien y marcar tus avisos como cumplidos.
      </p>

      <div className="mt-6">
        <GoogleSignInButton next={target} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Al entrar aceptas que tu nombre y el medio de contacto que publiques
        sean visibles para las demás personas registradas. Puedes borrar tus
        avisos cuando quieras.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center text-sm text-muted underline underline-offset-4"
      >
        Volver al tablero
      </Link>
    </div>
  );
}
