#!/bin/bash
# ¿Qué migraciones están aplicadas en la base? Comprueba, con la anon key, que
# exista lo que cada una debía crear.
#
#   bash scripts/estado-migraciones.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

check() {
  local label="$1" path="$2"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/$path")
  if [ "$code" = "200" ]; then
    printf '  APLICADA   %s\n' "$label"
  elif [ "$code" = "404" ] || [ "$code" = "400" ]; then
    printf '  FALTA      %s   (HTTP %s)\n' "$label" "$code"
  else
    printf '  ?          %s   (HTTP %s)\n' "$label" "$code"
  fi
}

echo "Estado de las migraciones:"
check "0002  posts.address"        "posts?select=address&limit=1"
check "0003  post_comments"        "post_comments?select=id&limit=1"
check "0003  posts.warning_count"  "posts?select=warning_count&limit=1"
check "0007  places"               "places?select=id&limit=1"
check "0011  places.image_url"     "places?select=image_url&limit=1"
check "0012  places.safety_note"   "places?select=safety_note&limit=1"
check "0017  posts.municipio"      "posts?select=municipio&limit=1"
check "0017  places.municipio"     "places?select=municipio&limit=1"

# 0004, 0005 y 0006 no se pueden comprobar con la anon key: cambian políticas,
# triggers y una función a la que anon no tiene permiso de ejecución (por eso
# PostgREST responde 404 exista o no). Para verificarlas, en el SQL Editor:
#
#   select proname from pg_proc where proname = 'create_post_with_contact';  -- 0006
#   select polname from pg_policy where polname = 'posts_delete_own';        -- 0004 la elimina
echo "  (0004/0005/0006 no son verificables desde fuera; ver notas en este script)"

echo
echo "Lugares cargados:"
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/places?select=kind,name,is_full" 2>/dev/null \
  | head -c 400
echo
