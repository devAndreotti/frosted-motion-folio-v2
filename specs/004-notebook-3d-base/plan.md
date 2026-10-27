# Technical Architecture & Implementation Plan: Modelagem da Base 3D

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Spec Document**: `specs/004-notebook-3d-base/spec.md`  
**Target Files**:
- `scripts/notebook3d/build_blend.py`: Modelagem da geometria da base, grelhas térmicas, parafusos e pés.
- `scripts/notebook3d/adesivos.json`: Inventário e bboxes dos adesivos e etiquetas da base.
- `scripts/notebook3d/atlas.py`: Inclusão dos adesivos da base no atlas de textura 2048² com máscaras holográficas.
- `src/lib/notebook3d/materials.ts`: Suporte à orientação e canal de reflexão para decals na base inferior.
- `src/lib/notebook3d/scene.ts`: Ajuste fino do enquadramento de câmera na vista "Embaixo".

---

## 1. Arquitetura da Solução Técnica

### 1.1 Decomposição Geométrica da Base (`build_blend.py`)
Atualmente, o script define `fundo` como uma única face triangulada com material `fundo` (`texturas/fundo.jpg`).
A nova implementação substitui essa malha estática por subcomponentes estruturados:

1. **Chassi Base Dividido**:
   - `base_painel_cinza`: Corpo principal em plástico fosco grafite, com chanfros perimetrais de 45° (`CH_IN = 3.5 mm`) e subida de cunha calculada por `zfundo(y)`.
   - `base_faixa_traseira`: Faixa plástica preta traseira (Y de 238 a D mm), com textura pontilhada e rebaixo de encaixe de 0,3 mm.
   - Friso de junção de molde entre o painel cinza e a faixa preta (sulco geométrico de 0,5 mm de largura).

2. **Grelha Térmica com Profundidade**:
   - Recorte em booleano (`bmesh.ops.difference` ou malha combinada de fendas hexagonais/trapezoidais) na região de admissão de ar (Y entre 140 mm e 230 mm, X entre -145 mm e +145 mm).
   - Placa de fundo de arrefecimento recuada em Z (-1,2 mm da face externa) com malha de filtro escura (`furo`) e representação de dissipadores (`aleta_azul` e `cobre`) nas posições das duas ventoinhas de 50 mm.

3. **Furação Mecânica (10 Parafusos Phillips)**:
   - Definição da lista de coordenadas milimétricas `PARAFUSOS_BASE = [(x, y, z), ...]` baseada na medição de `plantas/bottom.jpg`.
   - Criação de uma malha instanciada de cabeça de parafuso (cilindro de raio 1,4 mm escareado em 0,6 mm de profundidade com fenda cruzada Phillips em baixo relevo).
   - Junção no material `carcaca` / `furo` antes da exportação para custo zero de draw calls.

4. **Pés de Borracha Realistas**:
   - Pés frontais: Extrusão de pílula retangular arredondada (`fillet([(a, 29), (b, 29), (b, 36), (a, 36)], 3.4)`), mas agora alojados em uma cavidade de rebaixo de 0,4 mm na carcaça e projetando-se 1,8 mm além da superfície.
   - Pé traseiro: Tira contínua com rebaixo central para acompanhar o encaixe das portas traseiras, mantendo os chanfros `bev_bot = 0.6 mm` e textura de borracha de alta rugosidade (`rough = 0.9`).

5. **Portas Acústicas Frontais**:
   - 3 ranhuras paralelas chanfradas a 45° em cada extremidade frontal do chanfro lateral (Y ~ 50 mm a 70 mm), com inserção de malha interna com material `verde_agua`.

---

### 1.2 Pipeline de Texturas e Decals Holográficos (`atlas.py` e `holo_seg.py`)
1. **Cadastro dos Adesivos**:
   - Incorporar as entradas de `touro` e `compact_disc` em `scripts/notebook3d/adesivos.json` com suas respectivas máscaras e recortes de alta resolução.
   - Adicionar os metadados das etiquetas técnicas de fábrica (`etiqueta_loq_especs` e `selo_lenovo_co2`) geradas a partir das fotos retificadas de `mais da parte de baixo.jpg`.
2. **Geração do Atlas**:
   - O script `atlas.py` empacota os 4 novos elementos da base no atlas de textura 2048².
   - O canal Vermelho (R) codifica a intensidade metálica e o canal Azul (B) codifica a máscara de iridescência/holograma para o shader customizado do Three.js.
3. **Orientação dos Decals no Blender**:
   - Para elementos com `sup == 'bottom'`, criar malhas de plano com normais invertidas (`down=True`), posicionadas a `Z = zfundo(y) - 0.08 mm` para evitar z-fighting com a carcaça.

---

### 1.3 Shader e Integração WebGL (`materials.ts`)
1. Garantir que `src/lib/notebook3d/materials.ts` suporte a reflexão angular de Fresnel para decals posicionados na face inferior sem inversão de fase na luz especular.
2. A textura `fundo.jpg` na face inferior passa a ser dispensada ou simplificada para uma base limpa de cor sólida/ruído microtexturizado, transferindo os detalhes para a geometria e os decals independentes.

---

## 2. Estratégia de Build e Otimização

```
[Fotos & Planta (bottom.jpg)]
       │
       ▼
[adesivos.json + atlas.py] ──► [texturas/adesivos.png + atlas_mr.png]
       │
       ▼
[Blender 4.0 (build_blend.py)] ──► [saida/notebook.glb] (Raw com malhas fundidas)
       │
       ▼
[gltf-transform optimize] ──► [public/models/notebook-loq.glb] (Meshopt + WebP)
```

1. **Meshopt Compression**: Otimização de vértices, strips e indexação de triângulos para streaming rápido.
2. **WebP Textures**: Compressão das texturas de atlas sem perda perceptível de nitidez nos microtextos regulatórios.
3. **Culling Inteligente**: Manter a renderização sob demanda no Three.js (renderiza apenas ao interagir ou girar).

---

## 3. Estratégia de Verificação e Rollback

1. **Verificação de Build**: `npm run build` deve gerar os artefatos com sucesso e sem warnings de sintaxe.
2. **Inspeção Headless**: Execução de script Puppeteer/Playwright para renderizar captura zenital da base e comparar com `docs/notebook-3d/base-referencia-real.jpg`.
3. **Vitest Suite**: Execução de `npm test` garantindo que os testes unitários de `materials.test.ts`, `scene.test.ts` e `keymap.test.ts` permaneçam verdes.
4. **Estratégia de Rollback**: Caso o acréscimo de geometria cause queda de FPS em dispositivos móveis, a base pode alternar para malha simplificada (LOD) via flag de dispositivo em `src/lib/notebook3d/scene.ts`.
