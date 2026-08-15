#!/bin/bash
cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

pedir() {
  curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/$1"
}

echo "== 1. ¿existe la columna y qué valor tiene el servicio?"
pedir "places?select=name,municipio,kind,is_active,disponible_en_todos&kind=eq.servicio"
echo

echo "== 2. la consulta EXACTA que hace el sitio de Filandia:"
pedir "places?select=name,municipio,disponible_en_todos&or=(municipio.eq.filandia,disponible_en_todos.is.true)&kind=eq.servicio&is_active=eq.true"
echo

echo "== 3. la misma para Cali:"
pedir "places?select=name,municipio&or=(municipio.eq.cali,disponible_en_todos.is.true)&kind=eq.servicio&is_active=eq.true"
echo
