#!/bin/bash
# Qué migraciones de `places` están aplicadas y qué filas existen ya.
#
#   bash scripts/estado-lugares.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

col() {
  local etiqueta="$1" columna="$2"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    "$URL/rest/v1/places?select=$columna&limit=1")
  if [ "$code" = "200" ]; then
    printf '  APLICADA   %s\n' "$etiqueta"
  else
    printf '  FALTA      %s   (HTTP %s)\n' "$etiqueta" "$code"
  fi
}

echo "Columnas de places:"
col "0007  tabla places"     "id"
col "0008  website"          "website"
col "0011  image_url"        "image_url"

echo
echo "Tipos en uso (si hay filas 'necesidad', la 0009 y la 0010 ya corrieron):"
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/places?select=kind" > /tmp/kinds.json
python3 - <<'PY'
import json
from collections import Counter
rows = json.load(open("/tmp/kinds.json", encoding="utf-8"))
if isinstance(rows, dict):
    print("  error:", rows.get("message"))
else:
    for k, n in Counter(r["kind"] for r in rows).items():
        print(f"  {k:10} {n}")
PY

echo
echo "Filas que cargan los seeds (¿ya están?):"
# Solo columnas que existen desde la 0007, para que este chequeo funcione
# aunque falten migraciones posteriores.
curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/places?select=name,kind,is_full,is_verified,comuna,lat,website" \
  > /tmp/rows.json
python3 - <<'PY'
import json

ESPERADAS = {
    "Acopio para El Águila, Valle — Edificio Albricias": "seed-acopio",
    "Universidad Icesi — medicamentos e insumos médicos": "seed-acopio",
    "Escuela Nacional del Deporte — punto 2 de acopio": "seed-acopio",
    "Plazoleta Jairo Varela — punto de acopio": "seed-acopio",
    "Meléndez — El Jordán": "seed-zonas",
    "Acompañamiento emocional gratuito": "seed-servicios",
    "Colegio Berchmans — portería principal": "seed-acopio-2",
    "Coliseo El Pueblo": "seed-acopio-2",
}

rows = json.load(open("/tmp/rows.json", encoding="utf-8"))
if isinstance(rows, dict):
    print("  error:", rows.get("message"))
    raise SystemExit
por_nombre = {r["name"]: r for r in rows}

for nombre, origen in ESPERADAS.items():
    r = por_nombre.get(nombre)
    if r is None:
        print(f"  FALTA    [{origen:14}] {nombre[:46]}")
    else:
        extra = []
        if r.get("is_verified"): extra.append("verificado")
        if r.get("is_full"): extra.append("LLENO")
        if r.get("comuna"): extra.append(f"comuna={r['comuna']}")
        if r.get("lat"): extra.append("con coords")
        if r.get("website"): extra.append("web")
        print(f"  existe   [{origen:14}] {nombre[:46]:48} {', '.join(extra)}")

sobrantes = set(por_nombre) - set(ESPERADAS)
if sobrantes:
    print("\n  Filas cargadas a mano (los seeds NO las tocan):")
    for s in sobrantes:
        print(f"    - {s}")
PY

rm -f /tmp/kinds.json /tmp/rows.json
