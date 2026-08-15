#!/bin/bash
cd "$(dirname "$0")/.."
git fetch origin --quiet 2>/dev/null

echo "== FEED_LIMIT en origin/main (lo que ya está en producción):"
git show origin/main:src/lib/feed.ts 2>/dev/null | grep -n "FEED_LIMIT" | sed 's/^/   /'

echo
echo "== FEED_LIMIT en tu copia de trabajo (lo de hoy):"
grep -n "FEED_LIMIT" src/lib/feed.ts | sed 's/^/   /'

echo
echo "== otras diferencias de feed.ts frente a main:"
git diff origin/main -- src/lib/feed.ts | head -40
