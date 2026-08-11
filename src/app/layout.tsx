import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CaliSolidario — ayuda que llega',
    template: '%s · CaliSolidario',
  },
  description:
    'Tablero abierto para conectar a quien necesita ayuda en Cali con quien puede darla. Publica lo que necesitas o lo que ofreces.',
  openGraph: {
    title: 'CaliSolidario',
    description:
      'Conecta a quien necesita ayuda en Cali con quien puede darla.',
    locale: 'es_CO',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f5' },
    { media: '(prefers-color-scheme: dark)', color: '#101113' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-CO" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-2">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Cali<span className="text-brand">Solidario</span>
            </Link>
            <Link
              href="/mis-avisos"
              className="flex items-center rounded-full px-3 text-sm font-medium text-muted underline-offset-4 hover:underline"
            >
              Mis avisos
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">
          {children}
        </main>

        <nav
          aria-label="Navegación principal"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto flex w-full max-w-2xl items-stretch gap-2 px-4 py-2">
            <Link
              href="/necesidades"
              className="flex flex-1 items-center justify-center rounded-xl px-2 text-center text-sm font-medium"
            >
              Necesidades
            </Link>
            <Link
              href="/ofertas"
              className="flex flex-1 items-center justify-center rounded-xl px-2 text-center text-sm font-medium"
            >
              Ofertas
            </Link>
            <Link
              href="/publicar"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand px-2 text-center text-sm font-bold text-brand-ink"
            >
              Publicar
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
