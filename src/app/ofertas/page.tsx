import type { Metadata } from 'next';
import { FeedList } from '@/components/FeedList';
import { FeedTabs } from '@/components/FeedTabs';
import { SafetyNote } from '@/components/SafetyNote';
import { getFeed } from '@/lib/feed';
import { MUNICIPIO } from '@/config/municipios';

/** Red de seguridad; la frescura la da el webhook. Ver el comentario en `/`. */
export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Ofertas',
  description: `Lo que la gente en ${MUNICIPIO.nombre} está ofreciendo donar o prestar.`,
};

export default async function OffersPage() {
  const posts = await getFeed('offer');

  return (
    <>
      <h1 className="mb-4 text-xl font-bold tracking-tight">
        Lo que se ofrece
      </h1>
      <FeedTabs current="/ofertas" />
      <FeedList posts={posts} />
      <SafetyNote />
    </>
  );
}
