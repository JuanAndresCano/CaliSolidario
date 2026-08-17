#!/bin/bash
# Cuántos lugares activos hay por tipo y cuántos tienen coordenadas.
# Sirve para contrastar el número que sale en el botón del mapa.
#
#   bash scripts/estado-conteo-mapa.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

contar() {
  curl -s -o /dev/null -w '%{header_json}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H 'Prefer: count=exact' -H 'Range: 0-0' \
    "$URL/rest/v1/places?select=id&$1" |
    grep -o '"content-range":\["[^"]*"' | grep -o '/[0-9]*' | tr -d '/'
}

BASE='is_active=eq.true&municipio=eq.cali'

for tipo in albergue necesidad acopio; do
  total=$(contar "$BASE&kind=eq.$tipo")
  con=$(contar "$BASE&kind=eq.$tipo&lat=not.is.null")
  printf '%-10s total %-4s con coordenadas %s\n' "$tipo" "$total" "$con"
done

echo
echo "En el mapa entran albergue + necesidad + acopio con coordenadas."
echo "Eso es lo que debe decir el botón de /sitios."
