# Technical Architecture & Implementation Plan: Modelagem da Base 3D

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Spec Document**: `specs/004-notebook-3d-base/spec.md`  
**Arquivos**:
- `scripts/notebook3d/base_planta.py` (novo): mede na planta as fendas da grelha e os parafusos e grava `base.json`.
- `scripts/notebook3d/base.json` (novo, gerado): 88 fendas e 10 parafusos, em mm no sistema do modelo.
- `scripts/notebook3d/etiqueta.py` (novo): troca MO, SN, data e QR da etiqueta por valores fictícios → `texturas/fundo_publico.jpg`.
- `scripts/notebook3d/build_blend.py`: grelha, parafusos, junta de molde, fundo vazado, apoio traseiro e saídas de som.
- `scripts/notebook3d/montar.sh`: roda `base_planta.py` e `etiqueta.py` antes do Blender; recebe o worktree do site como argumento.
- `src/lib/notebook3d/materials.ts`: `liftBase` (polygonOffset do `fundo`) e offset maior nos adesivos.
- `public/models/notebook-loq.glb`: modelo regerado.

---

## 1. Solução

### 1.1 Medidas a partir da planta (`base_planta.py`)
- Planta da base: 5 px/mm, vista por baixo com a traseira em cima. Conversão para o modelo: `x = W/2 − x_planta`, `y = D − y_planta`.
- **Fendas**: limiar escuro na área da grelha, fechamento morfológico (a tela furada vira um bloco), `findContours` + `approxPolyDP` → 88 polígonos de 4 a 6 vértices, orientados anti-horário.
- **Parafusos**: posição marcada à mão (10 pontos) e centro refinado por `HoughCircles` numa janela de ±4 mm.

### 1.2 Geometria (`build_blend.py`)
1. **Grelha**: um cortador prismático por fenda, de `zfundo − 1` até `zfundo + 4 mm`, subtraído do `corpo` com o boolean `recortar()` (solver EXACT, material transferido). As paredes ficam `furo`; a tampa de cima do cortador vira o fundo do bolsão (`cobre` se |X| > 60 mm, senão `aleta_azul`).
2. **Tela furada**: um único quad a `zfundo + 1,2 mm` cobrindo a grelha, material `malha` (CLIP) com um ladrilho 64×64 de furos em colmeia gerado no próprio script (passo 1,3 mm). Fica escondido dentro do corpo, só aparece pelas fendas.
3. **Parafusos**: cilindro de 2,1 mm de raio cortado 0,7 mm no corpo (ou no bloco traseiro, os dois da faixa preta), cabeça `parafuso` de 1,6 mm a 0,35 mm da face, cruz em dois quads `furo`.
4. **Fundo vazado**: o contorno do fundo e os laços das 88 fendas e dos 10 rebaixos vão para `bmesh.ops.triangle_fill`, que preenche com os furos abertos; depois os vértices sobem para `zfundo(y) − 0,02` e as faces são viradas para baixo.
5. **Junta de molde**: quad `furo` de 0,5 mm em Y = 240 mm.
6. **Apoio traseiro**: três prismas de borracha em Y 232,4–239 mm, substituindo a tira que acompanhava o recuo das portas.
7. **Saídas de som**: 3 fendas compridas por lado no chanfro (Y 25–57,4 mm), moldura `furo` e tela `aleta_azul`, no lugar das 16 fendinhas.

### 1.3 Etiqueta (`etiqueta.py`)
- Caixas em mm na planta para MO, SN e data; os traços escuros de cada caixa saem por inpainting (o prateado da etiqueta continua), e o valor fictício é escrito em DejaVu Sans Condensed Bold, desenhado em 4× e reduzido.
- QR: o quadrado é limpo e recebe uma matriz 21×21 com os três marcadores de canto e o miolo aleatório (semente fixa), que não decodifica.
- O build só conhece `fundo_publico.jpg`.

### 1.4 Site (`materials.ts`)
- `prepareModel` chama `liftBase` no material `fundo`: `polygonOffset` (fator −1, unidades −2). Sem isso, num buffer de profundidade de 16 bits (SwiftShader nas capturas headless) o fundo some atrás da face do corpo.
- Os adesivos ganham `polygonOffsetUnits: −4`, para continuar na frente do fundo.

---

## 2. Build

```
[plantas/bottom.jpg] ──► base_planta.py ──► base.json
[texturas/fundo.jpg] ──► etiqueta.py ──► texturas/fundo_publico.jpg
[adesivos.json + atlas.py] ──► texturas/adesivos.png + adesivos_mr.png
            │
            ▼
[Blender 4.0.2 (build_blend.py)] ──► saida/notebook.glb
            │
            ▼
[gltf-transform optimize (meshopt + WebP)] ──► public/models/notebook-loq.glb
```

`montar.sh <worktree do site>` faz tudo na VPS (`/mnt/volume-50gb/notebook-3d`).

---

## 3. Verificação

1. `montar.sh`: o Blender termina com `OK ... 135 malhas`.
2. Contagem de triângulos e tamanho do GLB contra o anterior (ver spec, seção 3).
3. Capturas do visualizador (`shoot.cjs`) na vista "base" do site (az 20°, polar 150°), de baixo pela frente e por trás (polar 172°, o limite da órbita) e rasante.
4. `npm test`, `npm run lint`, `tsc` sem regressão.
