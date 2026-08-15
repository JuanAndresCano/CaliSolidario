#!/bin/bash
# Comprueba que el endpoint de revalidación filtre por municipio.
# Necesita el dev server corriendo y REVALIDATE_SECRET en .env.local.
#
#   bash scripts/probar-revalidar.sh [puerto]

PUERTO="${1:-3000}"
cd "$(dirname "$0")/.."
SECRETO=$(grep -E '^REVALIDATE_SECRET=' .env.local | cut -d= -f2- | xargs)

if [ -z "$SECRETO" ]; then
  echo "FALTA REVALIDATE_SECRET en .env.local"
  exit 1
fi

llamar() {
  local etiqueta="$1" cuerpo="$2"
  echo "== $etiqueta"
  curl -s -m 20 -X POST "http://localhost:$PUERTO/api/revalidar" \
    -H "Content-Type: application/json" \
    -H "x-revalidate-secret: $SECRETO" \
    -d "$cuerpo" | head -c 220
  echo
  echo
}

llamar "cambio de cali (debe revalidar)" \
  '{"type":"UPDATE","table":"places","record":{"municipio":"cali"}}'

llamar "cambio de filandia (debe omitir)" \
  '{"type":"UPDATE","table":"places","record":{"municipio":"filandia"}}'

llamar "sin municipio (revalida por si acaso)" \
  '{"type":"UPDATE","table":"places"}'

echo "== sin secreto (debe dar 401)"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" -m 20 \
  -X POST "http://localhost:$PUERTO/api/revalidar"
