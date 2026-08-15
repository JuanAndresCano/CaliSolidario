import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { LugarForm } from '@/components/LugarForm';
import { MUNICIPIO } from '@/config/municipios';
import { lugarPorId, permisosDeGestion } from '@/lib/gestion';

export const metadata: Metadata = {
  title: 'Editar lugar',
  robots: { index: false, follow: false },
};

export default async function EditarLugarPage({
  params,
}: PageProps<'/gestion/[id]'>) {
  const { id } = await params;
  const permisos = await permisosDeGestion(MUNICIPIO.id);

  if (!permisos.haySesion) redirect('/login?next=/gestion');
  if (!permisos.municipio) notFound();

  const lugar = await lugarPorId(id);

  // Aunque RLS ya impediría guardar los cambios, no tiene sentido mostrar el
  // formulario de un lugar de otro municipio.
  if (!lugar || lugar.municipio !== permisos.municipio) notFound();

  return (
    <div className="py-2">
      <Link
        href="/gestion"
        className="text-sm text-muted underline underline-offset-4"
      >
        ← Volver a la lista
      </Link>

      <h1 className="mt-3 text-xl font-bold leading-snug tracking-tight">
        {lugar.name}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Editando en {MUNICIPIO.nombre}. Guardar actualiza también la fecha de
        confirmación.
      </p>

      <div className="mt-5">
        <LugarForm lugar={lugar} />
      </div>
    </div>
  );
}
