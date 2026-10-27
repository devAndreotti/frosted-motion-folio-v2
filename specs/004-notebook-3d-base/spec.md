# Feature Specification: Modelagem 3D Fiel da Base Inferior do Notebook LOQ 15IRH8

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Created**: 2026-10-27  
**Status**: Ready for Implementation  
**Input**: PR #123 (`feat/notebook-3d`), fotos reais de alta resolução (`/mnt/volume-50gb/notebook-3d/fotos/`), planta retificada (`plantas/bottom.jpg`), dados mecânicos do Lenovo LOQ 15IRH8 (PSREF 83EU).

---

## 1. Visão Geral e Contexto

No PR #123, o portfólio introduziu o modelo 3D do notebook Lenovo LOQ 15IRH8 na galeria de experimentos. No entanto, enquanto a tampa superior, o deck do teclado, as portas traseiras e as laterais foram modeladas com relevo geométrico, chanfros e booleans precisos, a **face inferior (base / fundo)** permaneceu como um polígono plano único com textura 2D esticada (`fundo_poly` em `build_blend.py`), sem profundidade real nas grelhas térmicas, sem cavidades escareadas de parafusos e sem shaders holográficos dedicados para os adesivos da base.

Esta especificação define os requisitos de modelagem, materiais e shaders para elevar a fidelidade da base ao mesmo padrão do chassi superior.

### Referências Visuais no Repositório
- `docs/notebook-3d/base-referencia-real.jpg`: Foto zenital de alta resolução da carcaça inferior real.
- `docs/notebook-3d/base-adesivos-detalhe.jpg`: Close-up dos adesivos da base sob iluminação com difração óptica.
- `docs/notebook-3d/base-etiqueta-detalhe.jpg`: Close-up da etiqueta técnica, Anatel, QR code e parafusos Phillips.
- `docs/notebook-3d/base-planta-retificada.jpg`: Planta retificada em escala métrica (5 px/mm).
- `docs/notebook-3d/base-modelo-atual-render.jpg`: Render da vista inferior atual (limitação 2D).
- `docs/notebook-3d/base-comparativo-atual.jpg`: Comparativo do PR #123.

---

## 2. User Scenarios & Testing

### User Story 1 - Geometria das Grelhas de Arrefecimento e Profundidade Interna (Priority: P1)
Ao inspecionar a vista inferior do notebook (modo de rotação livre 360° ou atalho "Embaixo"), o usuário observa fendas de exaustão e admissão com profundidade geométrica tridimensional, revelando o filtro interno escuro e aletas de dissipação de cobre/azul sob iluminação angular.

**Why this priority**: É a maior área visual da base inferior e a principal diferença entre um plano texturizado 2D e um chassi de alta fidelidade.
**Independent Test**: Rotação do modelo em ângulo rasante (60°–80° de incidência de luz) no visualizador Three.js (`shoot-live.cjs` ou visualizador interativo), confirmando sombras de oclusão e profundidade nas aletas sem vazamento de faces.

**Acceptance Scenarios**:
1. **Given** a câmera apontada para a base inferior, **When** a luz direcional incide lateralmente, **Then** as fendas trapezoidais/hexagonais projetam sombras internas na malha de proteção em vez de exibirem textura estática.
2. **Given** a camada interna de arrefecimento, **When** visualizada através das grelhas, **Then** são identificáveis as aletas de dissipação (`aleta_azul` e `cobre`) a 1,2 mm de recuo da face externa.
3. **Given** a transição de materiais na base, **When** a seção traseira preta texturizada encontra a placa cinza grafite, **Then** há um friso físico de junta de molde (profundidade 0,3 mm, largura 0,5 mm).

---

### User Story 2 - Parafusos Phillips Escareados, Pés de Apoio e Portas Acústicas (Priority: P2)
O usuário visualiza os elementos mecânicos funcionais da base: 10 pontos de fixação com cabeças de parafuso Phillips escareadas, pés de borracha com altura realista e saídas de som laterais com tela protetora acústica.

**Why this priority**: Garante fidelidade tátil e visual ao hardware real Lenovo LOQ 15IRH8, eliminando a sensação de "objeto suspenso flutuante".
**Independent Test**: Verificação das posições X/Y/Z dos 10 parafusos contra `plantas/bottom.jpg` e teste de colisão do plano da mesa com a base dos pés de borracha em Z = 0.

**Acceptance Scenarios**:
1. **Given** a borda inferior e perímetro da base, **When** renderizados em 3D, **Then** existem 10 cavidades circulares escareadas com parafusos de cabeça Phillips preta posicionados conforme a planta:
   - 3 na faixa superior traseira escura;
   - 2 nos cantos superiores da placa cinza;
   - 2 nas bordas laterais médias;
   - 3 a 4 distribuídos na borda chanfrada frontal.
2. **Given** os pés de borracha frontais, **When** medidos no modelo, **Then** possuem formato de pílula arredondada (comprimento ~28 mm, largura 7 mm, elevação física de 1,8 mm sobre o chanfro inclinado Z0).
3. **Given** o pé de borracha traseiro contínuo, **When** renderizado, **Then** estende-se de X = -158 mm a +158 mm com recesso central de 4,5 mm para acompanhar a geometria das portas I/O.
4. **Given** as saídas acústicas frontais dos alto-falantes nos chanfros laterais, **When** inspecionadas, **Then** apresentam 3 ranhuras paralelas chanfradas a 45° com tela interna turquesa (`verde_agua`).

---

### User Story 3 - Decals Nítidos com Shaders Holográficos e Etiquetas Vetorizadas (Priority: P3)
Os adesivos personalizados da base ("Touro Vermelho" e "Compact Disc Digital Audio") e as etiquetas industriais de homologação exibem alta definição textual e reflexos especulares/holográficos idênticos aos adesivos da tampa e do apoio de pulso.

**Why this priority**: Os adesivos na base são marcas reais do notebook do autor e precisam do mesmo tratamento óptico (arco-íris holográfico dinâmico com a rotação da câmera) já implementado no PR #123.
**Independent Test**: Inspeção da reflexão especular com rotação orbital em `src/lib/notebook3d/materials.ts`, validando a máscara holográfica do canal R/B do atlas.

**Acceptance Scenarios**:
1. **Given** o adesivo do "Touro Vermelho" (bbox na planta: [206.7, 172.7, 298.6, 239.8]), **When** a câmera orbita ao redor da base, **Then** reflete difração holográfica vinílica (iridescência degradê vermelho/magenta/ciano).
2. **Given** o adesivo "Compact Disc Digital Audio" (bbox na planta: [275.8, 145.1, 337.0, 185.9]), **When** iluminado, **Then** reflete padrão holográfico prismático facetado (*broken glass effect*).
3. **Given** a etiqueta de fábrica Lenovo LOQ 15IRH8, **When** aproximada a câmera, **Then** exibe texto legível nítido (`MTM: 83EU0001BR`, `SN: PEOCH5HA`, Anatel `14751-21-04076`, QR code) em vez de borrão de baixa resolução.
4. **Given** o selo ecológico "CO2 Offset Service by Lenovo", **When** renderizado, **Then** apresenta formato de pílula verde com borda bem definida e alinhamento milimétrico logo abaixo da etiqueta principal.

---

## 3. Requisitos Não-Funcionais

- **Orçamento de Geometria**: O acréscimo de vértices na base não deve ultrapassar 4.000 triângulos adicionais.
- **Tamanho de Payload (GLB)**: O arquivo final comprimido (`notebook-loq.glb` via meshopt + WebP) não deve crescer mais do que 80 kB (baseline atual: ~1,36 MB; teto: <= 1,44 MB).
- **Taxa de Quadros**: 60fps sustentados em desktop e 30fps+ em mobile durante a rotação da vista inferior.
- **Draw Calls**: Manter os novos elementos agrupados por material estático (`grupo_carcaca`, `grupo_furo`, `grupo_borracha`, `grupo_adesivos`) antes da exportação para não gerar novas draw calls avulsas no Three.js.
- **Qualidade de Código**: Conformidade com a política do repositório (`.quality-gate/policy.json` com teto de 300 linhas por arquivo).
