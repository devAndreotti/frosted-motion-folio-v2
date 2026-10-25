#!/bin/bash
# fila_agy.sh: gera as artes que faltam quando a cota do Gemini volta (servidor ~04:45 UTC, emerald ~05:58 UTC)
cd /mnt/volume-50gb/notebook-3d
FALTAM="tentaculo_2 tentaculo_4 stackoverflow js css3 gnu_linux arduino codecademy touro compact_disc"
espera_ate() { local alvo=$(date -u -d "$1" +%s); while [ "$(date -u +%s)" -lt "$alvo" ]; do sleep 60; done; }
roda() {  # $1 = id, $2 = host (vazio = servidor); devolve 3 se a cota acabou
  ./venv/bin/python scripts/agy_clean.py "$1" ${2:+--host $2} > "trabalho/$1_fila.log" 2>&1 && return 0
  grep -q 'RESOURCE_EXHAUSTED\|QUOTA_EXHAUSTED\|429' "trabalho/$1_agy.jsonl" && return 3
  ./venv/bin/python scripts/agy_clean.py "$1" ${2:+--host $2} >> "trabalho/$1_fila.log" 2>&1
}
espera_ate "04:50"
pendentes=""
for id in $FALTAM; do
  [ -f "arte/$id.png" ] && continue
  roda "$id" ""; r=$?
  echo "$(date -u +%H:%M) servidor $id -> $r"
  [ $r -ne 0 ] && pendentes="$pendentes $id"
done
if [ -n "$pendentes" ]; then
  espera_ate "06:05"
  for id in $pendentes; do
    [ -f "arte/$id.png" ] && continue
    roda "$id" emerald; echo "$(date -u +%H:%M) emerald $id -> $?"
  done
fi
echo "fim: $(ls arte/*.png | wc -l) artes"
