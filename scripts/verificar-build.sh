#!/bin/bash
# Build de producción. Atrapa lo que el typecheck no ve: exportaciones
# inválidas en módulos 'use server', errores de prerenderizado, imports de
# servidor que se cuelan al paquete del navegador.
#
#   bash scripts/verificar-build.sh

source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1
cd "$(dirname "$0")/.."

npx next build 2>&1 | tail -40
