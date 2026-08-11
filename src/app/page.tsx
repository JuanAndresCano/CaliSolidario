import { FeedList } from '@/components/FeedList';
import { FeedTabs } from '@/components/FeedTabs';
import { SafetyNote } from '@/components/SafetyNote';
import { getFeed } from '@/lib/feed';

/**
 * Una consulta a Postgres por minuto sirve a todos los visitantes: esta página
 * se renderiza en el servidor y se cachea. Es lo que mantiene el tablero
 * dentro del plan gratuito aunque el enlace se difunda por WhatsApp.
 */
export const revalidate = 60;

export default async function HomePage() {
  const posts = await getFeed();

  return (
    <>
      <h1 className="mb-1 text-xl font-bold tracking-tight">
        Ayuda que llega, en Cali
      </h1>
      <p className="mb-4 text-sm text-muted">
        Mira lo que se necesita y lo que se ofrece. Para publicar o ver un
        contacto necesitas entrar con tu cuenta de Google.
      </p>

      <FeedTabs current="/" />
      <FeedList posts={posts} />
      <SafetyNote />
    </>
  );
}
