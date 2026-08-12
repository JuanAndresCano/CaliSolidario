#!/bin/bash
# Comprueba que los sitios externos a los que enlazamos siguen en pie.
# Un enlace roto en la sección de desaparecidos es peor que no tenerlo.
#
#   bash scripts/verificar-enlaces.sh

SITIOS=(
  "colombiatebusca.com"
  "desaparecidos.co"
  "www.conectacolombia.org"
  "mapa-emergencia.artefactofilms.workers.dev"
  "aqui-hace-falta.web.app"
)

for h in "${SITIOS[@]}"; do
  code=$(curl -s -o /tmp/enlace.html -w '%{http_code}' -m 20 -L "https://$h")
  titulo=$(grep -oiE '<title>[^<]*</title>' /tmp/enlace.html 2>/dev/null \
           | head -1 | sed 's/<[^>]*>//g' | tr -d '\n' | cut -c1-55)
  printf '  %-45s HTTP %-5s %s\n' "$h" "$code" "$titulo"
done
rm -f /tmp/enlace.html
