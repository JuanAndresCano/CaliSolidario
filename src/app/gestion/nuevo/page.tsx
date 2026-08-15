import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { LugarForm } from '@/components/LugarForm';
import { MUNICIPIO } from '@/config/municipios';
import { permisosDeGestion } from '@/lib/gestion';

export const metadata: Metadata = {
  title: 'Agregar un lugar',
  robots: { index: false, follow: false },
};

export default async function NuevoLugarPage() {
  const permisos = await permisosDeGestion(MUNICIPIO.id);

  if (!permisos.haySesion) redirect('/login?next=/gestion');
  if (!permisos.puedeGestionar) notFound();

  return (
    <div className="py-2">
      <Link
        href="/gestion"
        className="text-sm text-muted underline underline-offset-4"
      >
        ← Volver a la lista
      </Link>

      <h1 className="mt-3 text-xl font-bold tracking-tight">
        Agregar un lugar en {MUNICIPIO.nombre}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Solo el nombre y el tipo son obligatorios. Lo demás se puede completar
        después: es mejor publicarlo incompleto que no publicarlo.
      </p>

      <div className="mt-5">
        <LugarForm />
      </div>
    </div>
  );
}
