# Notebook 3D: como o modelo foi feito

O `public/models/notebook-loq.glb` é o Lenovo LOQ 15IRH8 (tipo 83EU) de verdade, com os adesivos no lugar. Estes
scripts refazem o GLB a partir das fotos. As fotos (~90 MB) não ficam no repositório: rodam numa pasta de trabalho
(`/mnt/volume-50gb/notebook-3d` no VPS), com `fotos/` e um venv com `opencv-python-headless`, `numpy` e `pillow`.

## Passos

1. **Medidas** (`rectify.py`, `aspect.py`): as medidas do PSREF (359,6 × 264,8 mm; touchpad 75 × 120 mm) e a
   perspectiva das fotos viram plantas retificadas em mm (`plantas/lid.jpg`, `deck.jpg`, `bottom.jpg`, 5 px/mm).
   A tampa mede 238 mm; o bloco traseiro, ~27 mm. `frames.py` refaz o apoio no referencial do touchpad (`deck2.jpg`)
   e converte as caixas para coordenadas do modelo.
2. **Recortes** (`register.py`): cada foto de perto é registrada na planta (SIFT + RANSAC) e cada adesivo sai de
   frente, a 12 px/mm, da foto com mais resolução naquele ponto. O inventário com as caixas está em `adesivos.json`.
3. **Arte**:
   - `agy_clean.py <id> [--host emerald]`: o Gemini (subagente `image-generator` do `agy`) limpa a foto do adesivo
     (sem reflexo nem arco-íris), em fundo chroma, e o script tira o fundo. A cota de imagem é por conta Google;
     `fila_agy.sh` espera o reset e gera os que faltarem.
   - `foto_arte.py <id>`: plaquetas de fábrica, Intel/RTX, Senna e a tabela de atalhos saem do próprio recorte
     retificado (bordas pelo gradiente); o LOQ gravado vira só as letras.
   - `formas.py`: os recortes holográficos lisos saem direto da planta (fundo local por mediana).
4. **Teclado** (`teclado.py`): layout ABNT2 medido tecla a tecla (`teclado.json`) e as texturas de cor, de luz
   (legendas, para a retroiluminação) e do halo entre as teclas.
5. **Modelo** (`build_blend.py`, Blender 4.0 headless via `blender.sh`): corpo, bloco traseiro com portas, grades,
   pés, dobradiças, teclas, touchpad, tampa com a saliência da webcam, tela (`tela`, trocada no site por um canvas)
   e um decal por adesivo (`sticker_<id>`). `atlas.py` encaixa as artes num atlas 2048² e grava a máscara do filme
   holográfico (canais R e B da textura metal/rugosidade).
6. **GLB** (`montar.sh`): atlas → Blender → `gltf-transform optimize` (meshopt + WebP) → ~1,1 MB.

`index.html` + `entry.ts` + `shoot.cjs` são o visualizador de conferência: o mesmo `src/lib/notebook3d/scene.ts` do
site, com câmera fixa pela URL (`az`, `polar`, `dist`, `lid`, `light`, `color`), capturado pelo Chrome headless.
