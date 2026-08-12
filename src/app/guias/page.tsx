import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/content/guias';

export const metadata: Metadata = {
  title: 'Guías',
  description:
    'Información práctica para atravesar la emergencia: primeros auxilios emocionales y más.',
};

export default function GuidesPage() {
  return (
    <div className="py-2">

      <h1 className="text-xl font-bold tracking-tight">Guías</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Información práctica, corta y verificada. Ninguna reemplaza a un
        profesional, pero sirven para saber qué hacer mientras llega.
      </p>

      <ul className="mt-4 flex flex-col gap-2.5">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guias/${guide.slug}`}
              className="block rounded-2xl border border-line bg-surface px-4 py-4 active:opacity-70"
            >
              <div className="flex items-start gap-3">
                <span aria-hidden className="text-2xl leading-none">
                  {guide.emoji}
                </span>
                <div>
                  <h2 className="text-base font-semibold leading-snug">
                    {guide.title}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-muted">
                    {guide.summary}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    {guide.readingMinutes} min de lectura
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
