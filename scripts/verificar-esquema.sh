#!/bin/bash
# Comprueba contra la API pública de Supabase que el esquema quedó aplicado y
# que RLS está bloqueando lo que debe. Usa solo la anon key: lo que pasa este
# script es exactamente lo que puede hacer un visitante cualquiera.
#
#   bash scripts/verificar-esquema.sh

set -u
cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "FALTA .env.local — cópialo de .env.local.example y llénalo."
  exit 1
fi

URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)

if [ -z "$URL" ] || [ -z "$KEY" ] || [[ "$URL" == *"TU-REF"* ]]; then
  echo "FALTA llenar NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  exit 1
fi

fails=0

status() {
  curl -s -o /tmp/verif-body.txt -w '%{http_code}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$@"
}

check_table() {
  local table="$1"
  local code
  code=$(status "$URL/rest/v1/$table?select=*&limit=1")
  if [ "$code" = "200" ]; then
    echo "  OK    tabla '$table' existe y es consultable"
  elif [ "$code" = "404" ]; then
    echo "  FALLA tabla '$table' NO existe (404)"
    fails=$((fails + 1))
  else
    echo "  ?     tabla '$table' respondió $code: $(head -c 200 /tmp/verif-body.txt)"
    fails=$((fails + 1))
  fi
}

echo "== 1. Tablas"
check_table profiles
check_table posts
check_table post_contacts

echo
echo "== 2. RLS bloquea escritura anónima"
code=$(status -X POST "$URL/rest/v1/posts" \
  -H 'Content-Type: application/json' \
  -d '{"author_id":"00000000-0000-0000-0000-000000000000","kind":"need","category":"agua","title":"prueba de rls","description":"esto no deberia insertarse nunca","comuna":"Comuna 1"}')
if [ "$code" = "401" ] || [ "$code" = "403" ]; then
  echo "  OK    un anónimo no puede publicar (HTTP $code)"
elif [ "$code" = "201" ]; then
  echo "  FALLA ¡un anónimo SÍ pudo insertar un aviso! Revisa las políticas de 'posts'."
  fails=$((fails + 1))
else
  echo "  ?     respondió $code: $(head -c 200 /tmp/verif-body.txt)"
  fails=$((fails + 1))
fi

echo
echo "== 2b. RLS esconde datos sensibles a anónimos"
check_empty() {
  local table="$1" label="$2"
  local code
  code=$(status "$URL/rest/v1/$table?select=*&limit=5")
  if [ "$code" = "200" ] && [ "$(cat /tmp/verif-body.txt)" = "[]" ]; then
    echo "  OK    $label"
  elif [ "$code" = "200" ]; then
    echo "  FALLA un anónimo SÍ puede leer '$table': $(head -c 150 /tmp/verif-body.txt)"
    fails=$((fails + 1))
  else
    echo "  ?     '$table' respondió $code"
  fi
}
check_empty post_contacts "contactos invisibles sin sesión"
check_empty post_comments "comentarios/alertas invisibles sin sesión"
check_empty profiles "perfiles invisibles sin sesión"

echo
echo "== 2c. Un anónimo no puede modificar avisos"
# `Prefer: return=representation` hace que PostgREST devuelva las filas que el
# UPDATE realmente tocó: un 200 con [] significa que RLS filtró todo (bien).
code=$(status -X PATCH "$URL/rest/v1/posts?status=eq.open" \
  -H 'Content-Type: application/json' -H 'Prefer: return=representation' \
  -d '{"status":"removed"}')
if [ "$code" = "401" ] || [ "$code" = "403" ]; then
  echo "  OK    update anónimo rechazado (HTTP $code)"
elif { [ "$code" = "200" ] || [ "$code" = "204" ]; } && [ "$(cat /tmp/verif-body.txt)" = "[]" ]; then
  echo "  OK    update anónimo no afectó ninguna fila (RLS filtró todo)"
elif [ "$code" = "200" ] || [ "$code" = "204" ]; then
  echo "  FALLA ¡un anónimo modificó filas!: $(head -c 200 /tmp/verif-body.txt)"
  fails=$((fails + 1))
else
  echo "  ?     respondió $code: $(head -c 150 /tmp/verif-body.txt)"
fi

echo
echo "== 3. RPC disponibles"
# PostgREST devuelve 404 cuando la firma no coincide, así que hay que llamar
# cada función con sus argumentos reales o el chequeo da un falso negativo.
code=$(status -X POST "$URL/rest/v1/rpc/mark_fulfilled" \
  -H 'Content-Type: application/json' \
  -d '{"p_post_id":"00000000-0000-0000-0000-000000000000"}')
if [ "$code" = "404" ]; then
  echo "  FALLA la función 'mark_fulfilled' no existe o cambió de firma"
  fails=$((fails + 1))
else
  echo "  OK    la función 'mark_fulfilled' existe (HTTP $code)"
fi

code=$(status -X POST "$URL/rest/v1/rpc/expire_old_posts" \
  -H 'Content-Type: application/json' -d '{}')
if [ "$code" = "404" ]; then
  echo "  OK    'expire_old_posts' no está expuesta a anónimos"
elif [ "$code" = "204" ] || [ "$code" = "200" ]; then
  echo "  AVISO 'expire_old_posts' la puede invocar cualquier anónimo."
  echo "        RLS impide que modifique nada, pero conviene revocarla:"
  echo "        revoke execute on function expire_old_posts() from anon;"
else
  echo "  ?     'expire_old_posts' respondió $code"
fi

echo
echo "== 4. Enums aceptados"
code=$(status "$URL/rest/v1/posts?select=id&category=eq.cobijas_colchones")
if [ "$code" = "200" ]; then
  echo "  OK    el enum post_category tiene los valores esperados"
else
  echo "  FALLA filtrar por categoría dio $code: $(head -c 200 /tmp/verif-body.txt)"
  fails=$((fails + 1))
fi

rm -f /tmp/verif-body.txt

echo
if [ "$fails" -eq 0 ]; then
  echo "TODO BIEN — el esquema quedó aplicado y RLS responde como debe."
else
  echo "$fails comprobación(es) fallaron. Revisa arriba."
  exit 1
fi
