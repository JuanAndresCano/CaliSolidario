#!/bin/bash
# Qué lugares activos no salen en el mapa, y cuáles llevan aviso de seguridad.
#
#   bash scripts/estado-sin-coordenadas.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

pedir() {
  curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/$1"
}

echo "=== ACTIVOS SIN COORDENADAS (no salen en el mapa) ==="
pedir 'places?select=name,kind,address,comuna,municipio&lat=is.null&is_active=eq.true&order=name'
echo
echo
echo "=== CON AVISO DE SEGURIDAD ==="
pedir 'places?select=id,name,safety_note&safety_note=not.is.null&order=name'
echo
