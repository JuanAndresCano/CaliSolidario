#!/bin/bash
# ¿Está vivo el endpoint que purga la caché, y responde lo que debe?
#
#   bash scripts/probar-webhook.sh

U=https://calisolidario.triadaaliados.com

echo "== POST /api/revalidar sin secreto"
code=$(curl -s -o /tmp/rev.txt -w '%{http_code}' -m 25 -X POST "$U/api/revalidar")
echo "   HTTP $code"
echo "   cuerpo: $(head -c 200 /tmp/rev.txt)"
echo

case "$code" in
  401) echo "   OK    desplegado y con REVALIDATE_SECRET configurado." ;;
  503) echo "   FALTA la variable REVALIDATE_SECRET en Vercel." ;;
  404) echo "   FALTA desplegar: la ruta /api/revalidar todavía no existe." ;;
  *)   echo "   ?     respuesta inesperada." ;;
esac

echo
echo "== estado de la caché de /sitios"
curl -sI -m 25 "$U/sitios" | grep -iE '^(age|x-vercel-cache):' | sed 's/^/   /'

rm -f /tmp/rev.txt
