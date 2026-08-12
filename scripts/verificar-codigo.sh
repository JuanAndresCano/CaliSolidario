#!/bin/bash
# Typecheck + lint. Corre esto antes de cada commit.
#
#   bash scripts/verificar-codigo.sh

source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1
cd "$(dirname "$0")/.."

echo "=== typegen"
npx next typegen 2>&1 | tail -3
echo "=== tsc"
npx tsc --noEmit 2>&1 | tail -30
echo "=== eslint"
npx eslint src 2>&1 | tail -30
echo "=== listo"
