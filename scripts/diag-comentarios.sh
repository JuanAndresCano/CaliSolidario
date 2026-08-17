#!/bin/bash
# Por qué no se guarda ni un comentario. Prueba pieza por pieza con la clave
# anónima y reporta el código HTTP y el cuerpo de cada respuesta.
#
#   bash scripts/diag-comentarios.sh
#
# Cómo leer los códigos:
#   200 = la tabla o columna existe (aunque RLS devuelva lista vacía)
#   404 = NO EXISTE. Esa es la respuesta que buscamos.
#   401/403 = existe y RLS lo bloquea, que es lo correcto para anónimo

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

probar() {
  local etiqueta="$1"
  local ruta="$2"
  local code
  code=$(curl -s -o /tmp/diag.json -w '%{http_code}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    "$URL/rest/v1/$ruta")
  printf '%-38s %s  %s\n' "$etiqueta" "$code" "$(head -c 150 /tmp/diag.json)"
}

echo "=== ¿EXISTEN LAS PIEZAS? ==="
probar 'tabla post_comments'        'post_comments?select=id&limit=1'
probar 'tabla comment_votes'        'comment_votes?select=comment_id&limit=1'
probar 'posts.warning_count'        'posts?select=id,warning_count&limit=1'
probar 'post_comments.kind'         'post_comments?select=kind&limit=1'
probar 'post_comments.hidden_at'    'post_comments?select=hidden_at&limit=1'
probar 'post_comments.author_id'    'post_comments?select=author_id&limit=1'

echo
echo "=== EL EMBED QUE USA LA APP ==="
echo "getComments pide post_comments -> profiles(display_name)."
probar 'embed profiles(display_name)' 'post_comments?select=*,profiles(display_name)&limit=1'

echo
echo "=== EL EMBED ARREGLADO (llave foránea nombrada) ==="
probar 'embed author_id_fkey' 'post_comments?select=*,profiles!post_comments_author_id_fkey(display_name)&limit=1'
probar 'el de /admin'         'post_comments?select=*,profiles!post_comments_author_id_fkey(display_name),posts!inner(id,title,status,author_id,municipio)&limit=1'

echo
echo "=== INSERTAR COMO ANÓNIMO (debe fallar con 401 o 403) ==="
code=$(curl -s -o /tmp/diag.json -w '%{http_code}' \
  -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"00000000-0000-0000-0000-000000000000","author_id":"00000000-0000-0000-0000-000000000000","kind":"comment","body":"prueba de diagnostico"}' \
  "$URL/rest/v1/post_comments")
echo "insert anónimo: $code  $(head -c 300 /tmp/diag.json)"
echo
echo "Un 404 aquí significa que la tabla no existe: la migración 0003 no se aplicó."
