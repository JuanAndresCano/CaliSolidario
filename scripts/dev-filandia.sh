#!/bin/bash
# Levanta el sitio como si fuera Filandia, en el puerto 3001.
#
#   bash scripts/dev-filandia.sh
#
# Comparte la base con Cali, así que solo verás lo que tenga municipio
# 'filandia' — que hoy es nada. El tablero vacío es el resultado correcto.

cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1

echo "Filandia en http://localhost:3001"
echo "(si Cali está corriendo en 3000, deténlo antes: Next 16 no admite dos"
echo " servidores de desarrollo en el mismo directorio)"
echo

NEXT_PUBLIC_MUNICIPIO=filandia npx next dev -p 3001
