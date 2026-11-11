# Feature Spec: Modelagem 3D Avançada da Base Inferior do Notebook Lenovo LOQ

**Feature Branch**: `feat/spec-notebook-base-refinement`  
**Created**: 2026-10-29  
**Input**: PRs fechados #128 e #123, imagens de referência em `docs/notebook-3d/` e planta técnica retificada (`base-planta-retificada.jpg`).

---

## 1. Visão Geral e Problema

No PR #128 (`feat/spec-notebook-base-3d`), a face inferior do Lenovo LOQ 15IRH8 evoluiu de uma textura plana esticada para geometria 3D com fendas vazadas, tela colmeia e parafusos básicos. Porém, para uma IA modeladora (subagente de modelagem 3D / Blender script AI), faltam especificações para atingir fidelidade mecânica de injeção plástica sem estourar o orçamento de renderização WebGL.

Gargalos visuais atuais identificados nas capturas comparativas (`base-3d-foto-x-modelo.jpg` e `base-3d-rasante.jpg`):
1. **Bordas duras sem chanfro de desmoldagem**: As 88 fendas têm paredes perpendiculares perfeitas de corte booleano. Na peça real em ABS/PC há ângulo de saída (draft angle de 0,5°) e micro-arredondamento de borda (0,25 mm) que capturam brilho especular.
2. **Câmara interna sem silhueta de ventoinhas**: Atrás da tela colmeia a 1,2 mm, o fundo é um plano chapado de aletas e cobre. Falta o contorno circular das duas turbinas radiais (diâmetro 52 mm) e das tubulações de cobre (heatpipes).
3. **Poços de parafusos sem rebaixo cônico**: Os 10 parafusos Phillips estão em furos cilíndricos retos, faltando o chanfro escareado cônico de 45° e o anel de assentamento.
4. **Saídas de áudio sem aletas acústicas**: As 3 fendas em cada chanfro frontal são cortes vazios, faltando aletas direcionadas que conduzem o som para a superfície da mesa.

---

## 2. Objetivos e Não-Objetivos

### Objetivos
- Fornecer parâmetros matemáticos, tolerâncias em milímetros e regras de topologia para que uma IA gere ou refine a geometria da base no Blender 4.0+.
- Especificar chanfros cônicos nos 10 parafusos, micro-bisel nas 88 fendas e a câmara volumétrica das ventoinhas duplas.
- Preservar rigidez de performance para WebGL (Three.js): teto máximo de +3.500 triângulos e 0 draw calls adicionais.
- Manter a regra absoluta de privacidade: MO, SN, data e QR code da etiqueta estritamente sintéticos.

### Não-Objetivos
- Não modelar pás individuais de ventoinha (provocaria moiré destrutivo e excesso de polígonos; usar anel perimetral com relevo em normal map).
- Não alterar a posição dos adesivos holográficos já consolidados (`touro`, `compact_disc`).
- Não adicionar texturas 4K descompactadas (manter atlas WebP comprimido).

---

## 3. Galeria de Referência Técnica (PRs Fechados)

| Vista / Componente | Imagem de Referência | Arquivo no Repositório |
| :--- | :---: | :--- |
| **Foto Real Zenital** | ![Foto Real](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-referencia-real.jpg) | `docs/notebook-3d/base-referencia-real.jpg` |
| **Foto Real × Modelo 3D** | ![Foto x Modelo](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-3d-foto-x-modelo.jpg) | `docs/notebook-3d/base-3d-foto-x-modelo.jpg` |
| **Grelha em Ângulo Rasante** | ![Rasante](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-3d-rasante.jpg) | `docs/notebook-3d/base-3d-rasante.jpg` |
| **Planta Técnica Retificada** | ![Planta](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-planta-retificada.jpg) | `docs/notebook-3d/base-planta-retificada.jpg` |
| **Pés Frontais em Pílula** | ![Pés](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-3d-pes.jpg) | `docs/notebook-3d/base-3d-pes.jpg` |
| **Etiqueta Sanitizada** | ![Etiqueta](https://raw.githubusercontent.com/devAndreotti/frosted-motion-folio-v2/main/docs/notebook-3d/base-3d-etiqueta.jpg) | `docs/notebook-3d/base-3d-etiqueta.jpg` |

---

## 4. User Stories e Critérios de Aceite

### P1 — Geometria Mecânica de Injeção Plástica (Grelha e Fendas)
Como usuário navegando no visualizador 3D do portfólio, quero que a grelha inferior do notebook reflita a luz com bordas chanfradas e profundidade real de injeção termoplástica ao girar a câmera.

**Cenários de Aceite:**
1. **Given** a câmera em órbita na face inferior, **When** a iluminação direcional atinge a grelha, **Then** as bordas das 88 fendas exibem realce especular derivado de micro-chanfro (0,25 mm / draft angle de 0,5°).
2. **Given** o interior da câmara de ar através das fendas (|X| > 60 mm), **When** visualizado de ângulo rasante, **Then** revela o aro perimetral da carcaça da ventoinha (raio R=26 mm, espessura 1,5 mm) em preto acetinado (`#141517`) sob a tela colmeia.
3. **Given** a zona central do dissipador (|X| <= 60 mm), **When** visualizada através da tela colmeia, **Then** exibe as tubulações de cobre sinterizado (diâmetro 6 mm) interligadas ao bloco de aletas azuis anodizadas.

### P2 — Escareado dos Parafusos e Saídas Acústicas
Como avaliador técnico examinando o modelo em 360°, quero que os parafusos de fixação pareçam assentados em cavidades industriais e os alto-falantes tenham grelhas funcionais.

**Cenários de Aceite:**
1. **Given** os 10 parafusos M2 de fixação da base, **Then** cada cavidade possui entrada cônica de 45° com profundidade de 0,35 mm antes do rebaixo cilíndrico de 0,7 mm.
2. **Given** as 3 saídas de som nos chanfros laterais inferiores (Y ≈ 25 a 57 mm), **Then** cada abertura é chanfrada com ângulo voltado para baixo a 30°, com grade acústica interna azul cobalto.
3. **Given** a barra emborrachada de apoio traseiro, **Then** mantém seus 3 segmentos contínuos elevados a 1,8 mm da base, bloqueando visualmente o vão sob a faixa preta.

### P3 — Conformidade com Privacidade e Higienização de Dados
Como visitante acessando o portfólio público, vejo a etiqueta regulatória da Lenovo com aspecto industrial autêntico, sem expor nenhum dado privado real do proprietário.

**Cenários de Aceite:**
1. **Given** o mapa de textura da base `fundo_publico.jpg`, **Then** os campos `MO`, `SN`, `Date` e `QR Code` contêm dados estritamente sintéticos (`MO: PF9XB26`, `SN: PF9XXXXX`, `Date: 23/10/24`).
2. **Given** o build do modelo no script `montar.sh`, **Then** a compilação é interrompida se qualquer arquivo de imagem original contendo números de série reais for detectado.

---

## 5. Requisitos Técnicos e Não-Funcionais

### Requisitos Funcionais
- **FR-001**: O script Blender (`build_blend.py`) deve parametrizar a curvatura de entrada das fendas e o aro das ventoinhas via matriz de coordenadas de `base.json`.
- **FR-002**: O mapa de normais da base (`base_normal.png`) deve assentar o chanfro de 0,25 mm das 88 fendas sem adicionar geometria de subdivisão desnecessária.
- **FR-003**: Os 10 parafusos devem ser fundidos no grupo de malha estática `grupo_notebook_parafuso` para unificação de draw calls.

### Requisitos Não-Funcionais
- **NFR-001 (Orçamento Geométrico)**: Incremento de triângulos restrito a no máximo +3.500 polígonos (total do modelo GLB <= 28.500 triângulos).
- **NFR-002 (Tamanho de Payload)**: O arquivo `public/models/notebook-loq.glb` comprimido via `meshopt` e `WebP` deve crescer no máximo +45 kB (teto <= 1,40 MB).
- **NFR-003 (Draw Calls)**: 0 novas primitivas independentes no WebGL; todos os nós novos devem pertencer aos materiais existentes (`fundo`, `corpo`, `cobre`, `aleta_azul`, `borracha`).
- **NFR-004 (Limitação de Linhas)**: Todos os documentos desta especificação devem respeitar o limite estrito de 300 linhas do `.quality-gate/policy.json`.

---

## 6. Critérios de Sucesso e Verificação

- **SC-001**: `npm run test` passando com 100% de sucesso (766+ testes verdes).
- **SC-002**: Captura com o script headless `shoot.cjs` gerando comparação milimétrica contra `docs/notebook-3d/base-3d-foto-x-modelo.jpg`.
- **SC-003**: Lighthouse Performance Mobile mantido em >= 90 pós-carregamento.
