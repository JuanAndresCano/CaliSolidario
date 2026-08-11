'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_LABELS, COMUNAS } from '@/lib/catalog';
import { matchesQuery } from '@/lib/search';
import type { FeedPost } from '@/lib/types';
import { PostCard } from './PostCard';

/**
 * Los filtros corren en el cliente sobre la lista ya cargada. Es a propósito:
 * filtrar por `searchParams` volvería la página dinámica y cada visitante
 * dispararía su propia consulta a Supabase.
 */
export function FeedList({ posts }: { posts: FeedPost[] }) {
  const [category, setCategory] = useState<string>('');
  const [comuna, setComuna] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  const visible = useMemo(
    () =>
      posts.filter(
        (p) =>
          (!category || p.category === category) &&
          (!comuna || p.comuna === comuna) &&
          matchesQuery(query, [
            p.title,
            p.description,
            p.quantity_text,
            p.address,
            p.barrio,
            p.comuna,
            CATEGORY_LABELS[p.category],
          ]),
      ),
    [posts, category, comuna, query],
  );

  const hasFilters = Boolean(category || comuna || query);

  const usedCategories = useMemo(() => {
    const present = new Set(posts.map((p) => p.category));
    return CATEGORIES.filter((c) => present.has(c.value));
  }, [posts]);

  const usedComunas = useMemo(() => {
    const present = new Set(posts.map((p) => p.comuna));
    return COMUNAS.filter((c) => present.has(c));
  }, [posts]);

  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
        Todavía no hay avisos publicados aquí.
      </p>
    );
  }

  return (
    <div>
      <label className="mb-3 block">
        <span className="sr-only">Buscar en los avisos</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: agua, pañales, Siloé…"
          enterKeyHint="search"
          className="w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>

      {usedCategories.length > 1 && (
        <div className="-mx-4 mb-3 overflow-x-auto px-4">
          <div className="flex w-max gap-2 pb-1">
            <Chip
              active={category === ''}
              onClick={() => setCategory('')}
              label="Todo"
            />
            {usedCategories.map((c) => (
              <Chip
                key={c.value}
                active={category === c.value}
                onClick={() => setCategory(c.value)}
                label={`${c.emoji} ${c.label}`}
              />
            ))}
          </div>
        </div>
      )}

      {usedComunas.length > 1 && (
        <label className="mb-3 block">
          <span className="sr-only">Filtrar por comuna</span>
          <select
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2"
          >
            <option value="">Toda la ciudad</option>
            {usedComunas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className="mb-2 text-xs text-muted">
        {visible.length} {visible.length === 1 ? 'aviso' : 'avisos'}
        {hasFilters ? ` de ${posts.length}` : ''}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center">
          <p className="text-sm text-muted">
            Ningún aviso coincide con esa búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('');
              setComuna('');
            }}
            className="mt-2 text-sm font-semibold text-brand underline underline-offset-4"
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'whitespace-nowrap rounded-full bg-brand px-3.5 text-sm font-semibold text-brand-ink'
          : 'whitespace-nowrap rounded-full border border-line bg-surface px-3.5 text-sm'
      }
    >
      {label}
    </button>
  );
}
