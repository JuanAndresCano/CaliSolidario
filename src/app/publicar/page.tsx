import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { NewPostForm } from '@/components/NewPostForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Publicar aviso',
};

export default async function PublishPage({
  searchParams,
}: PageProps<'/publicar'>) {
  const { tipo } = await searchParams;
  const initialKind =
    tipo === 'ofrezco' ? 'offer' : tipo === 'necesito' ? 'need' : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Conservar el tipo elegido a través del login: quien tocó "Necesito
    // ayuda" no debería tener que volver a decidir después de entrar.
    const next = initialKind ? `/publicar?tipo=${tipo}` : '/publicar';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="py-2">
      <h1 className="mb-4 text-xl font-bold tracking-tight">Publicar un aviso</h1>
      <NewPostForm initialKind={initialKind} />
    </div>
  );
}
