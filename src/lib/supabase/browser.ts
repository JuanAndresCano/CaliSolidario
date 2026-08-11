'use client';

import { createBrowserClient } from '@supabase/ssr';

/** Solo para disparar el login con Google y el logout desde el navegador. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
