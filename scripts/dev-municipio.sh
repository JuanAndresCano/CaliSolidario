#!/bin/bash
# Levanta el sitio como si fuera el municipio que le digas.
#
#   bash scripts/dev-municipio.sh filandia
#   bash scripts/dev-municipio.sh buga 3002
#
# Reemplaza al viejo dev-filandia.sh: con tres municipios ya no tiene sentido
# un script por cada uno.
#
# Comparte la base con los demás, así que solo verás lo que tenga ese
# `municipio`. Un tablero vacío en un municipio nuevo es el resultado correcto.
#
# OJO con el puerto: la URL tiene que estar en las Redirect URLs de Supabase
# (con /** al final) o el login te va a mandar al sitio de producción.

MUNICIPIO="$1"
PUERTO="${2:-3001}"

if [ -z "$MUNICIPIO" ]; then
  echo "Falta el municipio. Los que hay configurados:"
  # Por el campo `id` y no por la clave del objeto: `divisiones` está anidado
  # con la misma sangría y se colaba en la lista.
  grep -oE "^    id: '[a-z_]+'" "$(dirname "$0")/../src/config/municipios.ts" |
    sed "s/.*'\(.*\)'/  - \1/"
  exit 1
fi

cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh 2>/dev/null
nvm use 22 >/dev/null 2>&1

echo "$MUNICIPIO en http://localhost:$PUERTO"
echo "(Next 16 no admite dos servidores de desarrollo en el mismo directorio:"
echo " si ya tienes uno corriendo, deténlo antes)"
echo

NEXT_PUBLIC_MUNICIPIO="$MUNICIPIO" npx next dev -p "$PUERTO"
