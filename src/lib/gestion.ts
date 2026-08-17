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

  /*
   * El panel administra SIEMPRE el municipio del sitio en el que estás, nunca
   * el del perfil.
   *
   * Antes devolvía el municipio del gestor, así que alguien con
   * gestor_municipio = 'filandia' entraba a /gestion desde el sitio de Cali y
   * veía —y podía editar— los lugares de Filandia. Para administrar Cali hay
   * que ser admin o gestor de Cali; si no, esta pantalla no existe.
   */
  const puedeGestionar = esAdmin || gestorDe === municipioDespliegue;

  return {
    haySesion: true,
    puedeGestionar,
    municipio: puedeGestionar ? municipioDespliegue : null,
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

/**
 * Si quien está viendo puede confirmar entregas ajenas en este municipio.
 *
 * Es una facultad distinta a la de gestor: la alcaldía autoriza los puntos de
 * acopio pero no le da cuenta a quien trabaja en ellos, así que quien confirma
 * una entrega no suele ser quien mantiene las fichas de lugares. Ver la
 * migración 0023.
 *
 * Esto decide qué se MUESTRA. Quien decide qué se puede escribir es RLS.
 */
export async function puedeConfirmarEntregas(
  municipio: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('is_admin, confirma_entregas_municipio')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) return false;
  return (
    Boolean(data.is_admin) || data.confirma_entregas_municipio === municipio
  );
}

export type MunicipioConfig = {
  municipio: string;
  whatsapp_reportes: string | null;
  responsable: string | null;
  updated_at: string;
};

/**
 * Ajustes que la alcaldía mantiene por su cuenta. Puede no existir la fila si
 * el municipio se desplegó antes de darle de alta en `municipio_config`; el
 * panel lo muestra como pendiente en vez de fingir que está configurado.
 */
export async function configDelMunicipio(
  municipio: string,
): Promise<MunicipioConfig | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('municipio_config')
    .select('municipio, whatsapp_reportes, responsable, updated_at')
    .eq('municipio', municipio)
    .maybeSingle();

  return (data as MunicipioConfig | null) ?? null;
}

export async function lugarPorId(id: string): Promise<Place | null> {
  const supabase = await createClient();
  // Con los contactos anidados: el formulario los tiene que precargar.
  const { data } = await supabase
    .from('places')
    .select('*, contacts:place_contacts(id, method, value, label, orden)')
    .eq('id', id)
    .maybeSingle();

  return (data as Place | null) ?? null;
}
