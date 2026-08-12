#!/bin/bash
# Qué lugares están publicados y en qué estado.
#
#   bash scripts/listar-lugares.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/places?select=kind,name,is_full,is_verified,comuna,confirmed_at&order=kind,name" \
  > /tmp/lugares.json

python3 - <<'PY'
import json

with open("/tmp/lugares.json", encoding="utf-8") as f:
    rows = json.load(f)

if isinstance(rows, dict):
    print("error:", rows.get("message"))
    raise SystemExit(1)

print(f"lugares publicados: {len(rows)}\n")
for r in rows:
    estado = "LLENO" if r.get("is_full") else "recibiendo"
    ver = "verificado" if r.get("is_verified") else "sin verificar"
    comuna = r.get("comuna") or "-"
    print(f"  [{r['kind']:9}] {r['name'][:46]:48} {estado:11} {ver:14} {comuna}")
PY

rm -f /tmp/lugares.json
