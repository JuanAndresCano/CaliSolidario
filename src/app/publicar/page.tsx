import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NewPostForm } from '@/components/NewPostForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Publicar aviso',
};

export default async function PublishPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/publicar');

  return (
    <div className="py-2">
      <h1 className="mb-4 text-xl font-bold tracking-tight">Publicar un aviso</h1>
      <NewPostForm />
    </div>
  );
}
