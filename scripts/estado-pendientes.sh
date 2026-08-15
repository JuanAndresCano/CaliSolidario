#!/bin/bash
# Comprueba los cambios que no se ven con una simple consulta de columna.
#
#   bash scripts/estado-pendientes.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

pedir() {
  curl -s -o /tmp/chk.json -w '%{http_code}' \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" "$URL/rest/v1/$1"
}

echo "0013  categoría de servicio 'rescate':"
code=$(pedir "places?select=id&service_category=eq.rescate")
if [ "$code" = "200" ]; then
  echo "  APLICADA (el valor del enum existe)"
else
  echo "  FALTA    (HTTP $code) $(head -c 120 /tmp/chk.json)"
fi

echo
echo "0016  tipo de lugar 'albergue':"
code=$(pedir "places?select=id&kind=eq.albergue")
if [ "$code" = "200" ]; then
  echo "  APLICADA — $(python3 -c "import json;print(len(json.load(open('/tmp/chk.json'))))" 2>/dev/null) albergues cargados"
else
  echo "  FALTA    (HTTP $code)"
fi

echo
echo "0014  listas de más de 500 caracteres:"
pedir "places?select=name,supplies_needed&kind=eq.acopio" >/dev/null
python3 - <<'PY'
import json
try:
    filas = json.load(open('/tmp/chk.json'))
except Exception:
    print("  ? no se pudo leer"); raise SystemExit
largo = max((len(f.get('supplies_needed') or '') for f in filas), default=0)
print(f"  la lista más larga tiene {largo} caracteres",
      "(pasa de 500 → la 0014 está aplicada)" if largo > 500
      else "(no concluyente)")
PY

echo
echo "Servicios publicados:"
pedir "places?select=name,service_category&kind=eq.servicio" >/dev/null
head -c 300 /tmp/chk.json
echo
rm -f /tmp/chk.json
