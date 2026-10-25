#!/bin/sh
# Blender 4.0.2 do sistema com o Python do sistema + numpy do venv (o PATH aponta para o Python do uv)
export PYTHONHOME=/usr
export PYTHONPATH=/mnt/volume-50gb/notebook-3d/venv/lib/python3.12/site-packages
exec /usr/bin/blender -b --factory-startup --python-exit-code 1 "$@"
