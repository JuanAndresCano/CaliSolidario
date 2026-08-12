import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const SITE_URL = 'https://calisolidario.triadaaliados.com';

export const metadata: Metadata = {
  // Necesario para que la imagen de previsualización salga con URL absoluta:
  // WhatsApp y Facebook descartan las relativas.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CaliSolidario — ayuda que llega',
    template: '%s · CaliSolidario',
  },
  description:
    'Tablero abierto para conectar a quien necesita ayuda en Cali con quien puede darla. Publica lo que necesitas o lo que ofreces.',
  openGraph: {
    title: 'CaliSolidario — ayuda que llega',
    description:
      'Quien necesita ayuda y quien puede darla, en el mismo lugar. Mira el tablero, pide lo que te falta u ofrece lo que tienes.',
    url: SITE_URL,
    siteName: 'CaliSolidario',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CaliSolidario — ayuda que llega',
    description:
      'Quien necesita ayuda y quien puede darla, en el mismo lugar.',
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

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-36 pt-4">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
