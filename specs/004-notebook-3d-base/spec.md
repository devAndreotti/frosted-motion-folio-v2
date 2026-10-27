# Feature Specification: Modelagem 3D Fiel da Base Inferior do Notebook LOQ 15IRH8

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Created**: 2026-10-27  
**Status**: Implementada  
**Input**: PR #123 (`feat/notebook-3d`), planta retificada da base (`plantas/bottom.jpg`, 5 px/mm, fora do repositório; cópia em `docs/notebook-3d/base-planta-retificada.jpg`), fotos de referência.

---

## 1. Visão Geral e Contexto

No PR #123 a tampa, o deck, as portas traseiras e as laterais ganharam relevo geométrico, mas a **face inferior** ficou como um polígono plano (`fundo` em `build_blend.py`) com a foto retificada esticada por cima: a grelha de admissão, os parafusos e a junta de molde eram só textura.

Já existiam e **ficam como estão**:
- os adesivos da base (`touro`, `compact_disc` em `adesivos.json` → `bottom`, `brilho: holo`), colados como planos virados para baixo e com o mesmo `holoMaterial` dos adesivos da tampa e do apoio;
- os pés frontais em pílula (28 × 7 mm), que vão da mesa (Z = 0) até o fundo.

### Privacidade da etiqueta

A etiqueta de fábrica tem dados de série (MO, SN, data de fabricação e um QR code que os codifica). A foto da base vira textura pública no site, então **nenhum desses dados reais pode aparecer** no GLB, nas imagens de `docs/` ou nesta especificação. O modelo, o MTM e o número Anatel são públicos (catálogo da Lenovo) e ficam.

### Referências Visuais no Repositório
- `docs/notebook-3d/base-referencia-real.jpg`: foto zenital da base real (dados de série pixelados).
- `docs/notebook-3d/base-adesivos-detalhe.jpg`: close-up dos adesivos holográficos.
- `docs/notebook-3d/base-etiqueta-detalhe.jpg`: close-up da etiqueta (dados de série pixelados), parafuso e saída de som.
- `docs/notebook-3d/base-planta-retificada.jpg`: planta retificada (5 px/mm), já com a etiqueta fictícia.
- `docs/notebook-3d/base-modelo-atual-render.jpg` e `base-comparativo-atual.jpg`: a base antes desta mudança.
- `docs/notebook-3d/base-3d-render.jpg`: a base depois desta mudança, na vista "base" do site.

---

## 2. User Scenarios & Testing

### User Story 1 - Grelha de admissão com profundidade (Priority: P1)
Na vista de baixo, as 88 fendas trapezoidais da grelha são vãos de verdade: atrás delas aparece a tela furada e, mais ao fundo, o dissipador.

**Independent Test**: captura do visualizador (`shoot.cjs`) em ângulo rasante; as fendas mostram paredes e profundidade, sem faces vazando.

**Acceptance Scenarios**:
1. **Given** a câmera na base, **When** ela gira, **Then** as fendas (medidas na planta: X ≈ −157 a +153 mm, Y ≈ 128 a 205 mm) mostram paredes escuras e profundidade.
2. **Given** o interior da grelha, **When** visto pelas fendas, **Then** há uma tela furada em colmeia a 1,2 mm da face e, a 4 mm, o dissipador: cobre embaixo das ventoinhas (|X| > 60 mm) e aletas azuis no meio.
3. **Given** a divisa entre o painel cinza e a faixa preta de trás, **Then** há uma junta de molde escura de 0,5 mm em Y = 240 mm.

---

### User Story 2 - Parafusos, apoio traseiro e saídas de som (Priority: P2)
Os 10 parafusos Phillips aparecem rebaixados, a borracha de trás fica onde está na peça real e as saídas de som mostram a tela azul.

**Independent Test**: `base_planta.py` gera as posições a partir da planta; a captura do visualizador confere com a foto.

**Acceptance Scenarios**:
1. **Given** a base, **Then** há 10 parafusos (2 na faixa preta, 2 nos cantos de trás do painel cinza, 2 nas laterais, 4 na borda da frente), cada um num rebaixo de 0,7 mm com a cabeça a 0,35 mm da face e a cruz em baixo-relevo.
2. **Given** os pés frontais, **Then** cada um fica centrado sobre o pé da foto (a planta não é simétrica: X +140 / Y 32,5 e X −150,2 / Y 36,6 mm); o do lado −X estava espelhado e deixava o contorno da foto aparecendo em volta.
3. **Given** o apoio de borracha traseiro, **Then** é uma barra reta em 3 trechos logo à frente da faixa preta (Y ≈ 232,4 a 239 mm, X ≈ −152,6 a +152,6 mm), como na planta, e não mais uma tira sob a faixa preta acompanhando o recuo das portas.
4. **Given** as saídas de som nos chanfros laterais (Y ≈ 25 a 57 mm), **Then** são 3 fendas compridas por lado, com moldura escura e tela **azul** (`aleta_azul`), como na foto.

---

### User Story 3 - Etiqueta sem dados reais (Priority: P1)
A etiqueta de fábrica continua reconhecível, mas com MO, SN, data e QR fictícios.

**Independent Test**: recorte da textura `fundo_publico.jpg` e do GLB; nenhum valor real legível.

**Acceptance Scenarios**:
1. **Given** a textura da base, **When** gerada por `etiqueta.py`, **Then** MO, SN e data são trocados por valores sorteados (fixos no script) e o QR vira um padrão aleatório que não decodifica.
2. **Given** `build_blend.py`, **Then** ele só usa `texturas/fundo_publico.jpg`; sem ela o build falha em vez de cair na foto original.
3. **Given** as imagens de `docs/notebook-3d/`, **Then** os dados de série estão pixelados ou trocados pelos fictícios.

---

## 3. Requisitos Não-Funcionais

- **Geometria**: no máximo 4.000 triângulos a mais. Medido: 21.763 → 25.046 (+3.283).
- **Payload (GLB meshopt + WebP)**: no máximo 80 kB a mais. Medido: 1.324.564 → 1.356.696 bytes (+32 kB).
- **Draw calls**: peças novas juntadas por material (`grupo_notebook_<material>`); só entram 4 primitivas novas (`cobre` e `aleta_azul` no corpo, a tela `malha` e o grupo `parafuso`).
- **Profundidade**: o `fundo` fica 0,02 mm sob a face do corpo; o site aplica `polygonOffset` nele (`liftBase` em `materials.ts`) para não brigar com o corpo em buffers de 16 bits, e os adesivos continuam por cima.
- **Qualidade de código**: o teto de 300 linhas por arquivo do quality gate vale para `src/`; os scripts do Blender em `scripts/notebook3d/` ficam fora dessa medida.
