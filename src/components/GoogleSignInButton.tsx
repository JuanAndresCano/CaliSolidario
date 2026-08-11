'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

export function GoogleSignInButton({ next = '/' }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setError('No se pudo abrir el ingreso con Google. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-brand-ink disabled:opacity-60"
      >
        {loading ? 'Abriendo Google…' : 'Entrar con Google'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-need">
          {error}
        </p>
      )}
    </div>
  );
}
