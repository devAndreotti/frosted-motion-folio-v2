#!/bin/bash
# montar.sh [worktree do site]: atlas -> base -> Blender -> GLB otimizado (meshopt + WebP) -> site e visualizador
set -e
SITE=${1:-/mnt/volume-50gb/worktrees/folio-notebook3d}
cd /mnt/volume-50gb/notebook-3d
./venv/bin/python scripts/atlas.py | tail -1
./venv/bin/python scripts/base_planta.py plantas/bottom.jpg base.json
./venv/bin/python scripts/etiqueta.py texturas/fundo.jpg texturas/fundo_publico.jpg
scripts/blender.sh -P scripts/build_blend.py -- saida/notebook.glb 2>&1 | grep "^OK"
viewer/node_modules/.bin/gltf-transform optimize saida/notebook.glb saida/notebook-loq.glb --compress meshopt --texture-compress webp \
  --texture-size 2048 --simplify false --join false --instance false --flatten false --palette false 2>&1 | tail -1
cp saida/notebook-loq.glb viewer/notebook.glb
cp saida/notebook-loq.glb "$SITE/public/models/notebook-loq.glb"
ls -la saida/notebook-loq.glb
