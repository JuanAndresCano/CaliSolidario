import Link from 'next/link';

const TABS = [
  { href: '/', label: 'Todo' },
  { href: '/necesidades', label: 'Necesidades' },
  { href: '/ofertas', label: 'Ofertas' },
] as const;

export function FeedTabs({ current }: { current: '/' | '/necesidades' | '/ofertas' }) {
  return (
    <div className="mb-3 flex gap-1 rounded-xl border border-line bg-surface p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === current ? 'page' : undefined}
          className={
            tab.href === current
              ? 'flex flex-1 items-center justify-center rounded-lg bg-brand py-2 text-sm font-semibold text-brand-ink'
              : 'flex flex-1 items-center justify-center rounded-lg py-2 text-sm text-muted'
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
