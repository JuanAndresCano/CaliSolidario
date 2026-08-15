#!/bin/bash
# Levanta el dev server, prueba el filtro por municipio del endpoint de
# revalidación, y apaga el server al terminar.
#
#   bash scripts/probar-revalidar-local.sh

cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1

limpiar() { pkill -f "next dev" 2>/dev/null; }
trap limpiar EXIT

limpiar
sleep 2
npx next dev -p 3000 > /tmp/dev-revalidar.log 2>&1 &
sleep 14

bash scripts/probar-revalidar.sh 3000
