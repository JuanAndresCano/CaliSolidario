#!/bin/bash
# Radiografía del tablero: qué se está pidiendo, qué se está ofreciendo y dónde
# hay desequilibrio. Útil para decidir qué construir después.
#
#   bash scripts/estado-tablero.sh

cd "$(dirname "$0")/.."
URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | xargs)
KEY=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | xargs)

curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/posts?select=kind,category,status,created_at,comuna,barrio&order=created_at.desc&limit=500" \
  | python3 -c "
import sys, json
from collections import Counter
rows = json.load(sys.stdin)
print(f'TOTAL visible para anonimos: {len(rows)}')
print()
print('Por estado:', dict(Counter(r[\"status\"] for r in rows)))
print('Por tipo:  ', dict(Counter(r[\"kind\"] for r in rows)))
print()
print('Por categoria:')
for c in sorted({r['category'] for r in rows}):
    n = sum(1 for r in rows if r['category']==c and r['kind']=='need')
    o = sum(1 for r in rows if r['category']==c and r['kind']=='offer')
    print(f'  {c:20} necesitan {n:3}   ofrecen {o:3}')
"
