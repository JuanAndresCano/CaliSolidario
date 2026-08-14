#!/bin/bash
# Estado de las ramas: qué tiene cada una y si develop quedó atrás de main.
#
#   bash scripts/estado-ramas.sh

cd "$(dirname "$0")/.."
git fetch origin --quiet 2>/dev/null

echo "Punta de cada rama remota:"
for r in main develop; do
  linea=$(git log --oneline -1 "origin/$r" 2>/dev/null)
  printf '  %-10s %s\n' "$r" "${linea:-(no existe)}"
done

echo
echo "Divergencia:"
lectura=$(git rev-list --left-right --count origin/main...origin/develop 2>/dev/null)
solo_main=$(echo "$lectura" | cut -f1)
solo_dev=$(echo "$lectura" | cut -f2)
echo "  commits solo en main:    ${solo_main:-?}"
echo "  commits solo en develop: ${solo_dev:-?}"

if [ "${solo_main:-0}" -gt 0 ] 2>/dev/null; then
  echo
  echo "  AVISO: main va adelante de develop. La próxima rama que saques de"
  echo "  develop nace sin esos cambios. Para alinearlas:"
  echo "      git checkout develop && git merge origin/main && git push"
fi

echo
echo "Archivos clave por rama:"
for r in main develop; do
  for f in src/app/mapa/page.tsx src/app/api/revalidar/route.ts; do
    if git cat-file -e "origin/$r:$f" 2>/dev/null; then
      printf '  %-10s %-40s si\n' "$r" "$f"
    else
      printf '  %-10s %-40s NO\n' "$r" "$f"
    fi
  done
done
