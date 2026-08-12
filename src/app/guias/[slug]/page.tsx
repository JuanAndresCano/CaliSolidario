import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, getGuide, type GuideBlock } from '@/content/guias';

/** Las guías son contenido fijo del repo: se prerrenderizan todas. */
export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/guias/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) return { title: 'Guía' };

  return {
    title: guide.title,
    description: guide.summary,
    openGraph: { title: guide.title, description: guide.summary },
  };
}

export default async function GuidePage({ params }: PageProps<'/guias/[slug]'>) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) notFound();

  return (
    <article className="py-2">
      <Link
        href="/guias"
        className="text-sm text-muted underline underline-offset-4"
      >
        ← Guías
      </Link>

      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
        <span aria-hidden className="mr-2">
          {guide.emoji}
        </span>
        {guide.title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{guide.summary}</p>

      {guide.author && (
        <div className="mt-3 rounded-xl border border-line bg-surface px-3 py-2.5">
          <p className="text-sm font-semibold">
            Escrita por {guide.author.name}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {guide.author.credentials}
            {guide.author.org && (
              <>
                {' · '}
                {guide.author.orgUrl ? (
                  <a
                    href={guide.author.orgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    {guide.author.org}
                  </a>
                ) : (
                  guide.author.org
                )}
              </>
            )}
          </p>
        </div>
      )}

      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-7">
          <h2 className="text-base font-bold leading-snug">
            {section.heading}
          </h2>
          <div className="mt-2 flex flex-col gap-3">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-8 border-t border-line pt-4">
        {guide.sources.map((source) => (
          <p
            key={source.label}
            className="mt-1.5 text-xs leading-relaxed text-muted"
          >
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {source.label}
              </a>
            ) : (
              source.label
            )}
          </p>
        ))}
      </footer>
    </article>
  );
}

function Block({ block }: { block: GuideBlock }) {
  if (block.type === 'p') {
    return <p className="text-[0.95rem] leading-relaxed">{block.text}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul className="flex flex-col gap-2 pl-1">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2 text-[0.95rem] leading-relaxed">
            <span aria-hidden className="text-brand">
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'dont') {
    return (
      <ul className="flex flex-col gap-2">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex gap-2 rounded-xl bg-need-bg px-3 py-2 text-sm leading-relaxed text-need"
          >
            <span aria-hidden>✕</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="rounded-xl bg-offer-bg px-3 py-2.5 text-sm font-semibold leading-relaxed text-offer">
      {block.text}
    </p>
  );
}
