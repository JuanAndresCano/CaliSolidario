#!/bin/bash
# Levanta el sitio con cada municipio configurado y comprueba que los textos
# cambien. Es la única forma de saber si quedó algo atado a Cali.
#
#   bash scripts/probar-municipios.sh

cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1

detener() {
  # Next 16 se niega a levantar un segundo servidor en el mismo directorio,
  # así que hay que matarlo del todo —no solo el proceso padre— y esperar a
  # que suelte el puerto.
  pkill -f "next dev" 2>/dev/null
  for _ in $(seq 1 15); do
    pgrep -f "next dev" >/dev/null || break
    sleep 1
  done
  sleep 2
}

probar() {
  local municipio="$1" puerto="$2"
  echo "== NEXT_PUBLIC_MUNICIPIO=$municipio"
  detener

  NEXT_PUBLIC_MUNICIPIO="$municipio" npx next dev -p "$puerto" \
    > "/tmp/dev-$municipio.log" 2>&1 &
  local pid=$!
  sleep 12

  curl -s -m 20 "http://localhost:$puerto/" > /tmp/home.html
  echo -n "   marca en el encabezado: "
  grep -oE 'text-brand">[^<]+</span>' /tmp/home.html | head -1 | sed 's/<[^>]*>//g'
  echo -n "   título: "
  curl -s -m 20 "http://localhost:$puerto/necesidades" \
    | grep -oE '<title>[^<]*</title>' | sed 's/<[^>]*>//g'
  echo -n "   descripción: "
  curl -s -m 20 "http://localhost:$puerto/necesidades" \
    | grep -oE 'name="description" content="[^"]*"' | cut -c27-90
  echo -n "   sitemap: "
  curl -s -m 20 "http://localhost:$puerto/sitemap.xml" \
    | grep -oE '<loc>[^<]*</loc>' | head -1 | sed 's/<[^>]*>//g'

  kill "$pid" 2>/dev/null
  wait "$pid" 2>/dev/null
  echo
}

probar cali 3100
probar filandia 3101
probar buga 3102
detener
rm -f /tmp/home.html
