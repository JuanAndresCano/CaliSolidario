import type { Metadata } from 'next';
import { FeedList } from '@/components/FeedList';
import { FeedTabs } from '@/components/FeedTabs';
import { SafetyNote } from '@/components/SafetyNote';
import { getFeed } from '@/lib/feed';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Lo que la gente en Cali está ofreciendo donar o prestar.',
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
