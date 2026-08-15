import { createClient } from './supabase/server';
import type { Place } from './place-utils';

export type Permisos = {
  /**
   * Si hay alguien autenticado. Va aparte de los permisos a propósito: sin
   * sesión hay que mandar al login, y con sesión pero sin permiso hay que
   * responder 404. Confundir las dos cosas manda al usuario a un bucle de
   * inicio de sesión que nunca termina.
   */
  haySesion: boolean;
  puedeGestionar: boolean;
  /** Municipio que administra. Los admins administran el del despliegue. */
  municipio: string | null;
  esAdmin: boolean;
};

/**
 * Quién puede administrar lugares y de qué municipio.
 *
 * Esto decide qué se MUESTRA. Quien decide qué se puede escribir es RLS: si
 * alguien saltara esta comprobación, Postgres seguiría rechazando la fila.
 */
export async function permisosDeGestion(
  municipioDespliegue: string,
): Promise<Permisos> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      haySesion: false,
      puedeGestionar: false,
      municipio: null,
      esAdmin: false,
    };
  }

  const { data } = await supabase
    .from('profiles')
    .select('is_admin, gestor_municipio')
    .eq('id', user.id)
    .maybeSingle();

  const esAdmin = Boolean(data?.is_admin);
  const gestorDe = (data?.gestor_municipio as string | null) ?? null;

  return {
    haySesion: true,
    puedeGestionar: esAdmin || gestorDe !== null,
    municipio: esAdmin ? municipioDespliegue : gestorDe,
    esAdmin,
  };
}

/** Todos los lugares del municipio, incluidos los inactivos. */
export async function lugaresDelMunicipio(
  municipio: string,
): Promise<Place[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('municipio', municipio)
    .order('is_active', { ascending: false })
    .order('kind', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('[gestion] no se pudieron cargar los lugares:', error.message);
    return [];
  }

  return (data ?? []) as Place[];
}

export async function lugarPorId(id: string): Promise<Place | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return (data as Place | null) ?? null;
}
