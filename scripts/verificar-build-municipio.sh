#!/bin/bash
# Build de producción con un municipio concreto. Atrapa lo que el typecheck no
# ve y comprueba que el municipio nuevo compila igual que los demás.
#
#   bash scripts/verificar-build-municipio.sh buga

MUNICIPIO="${1:-cali}"

source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1
cd "$(dirname "$0")/.."

echo "=== build como $MUNICIPIO"
NEXT_PUBLIC_MUNICIPIO="$MUNICIPIO" npx next build 2>&1 | tail -30
