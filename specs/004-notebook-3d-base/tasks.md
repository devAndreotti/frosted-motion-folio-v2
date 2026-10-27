# Executable Tasks: Modelagem da Base 3D do Notebook

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Spec Reference**: `specs/004-notebook-3d-base/spec.md`  
**Architecture Plan**: `specs/004-notebook-3d-base/plan.md`

---

## Fase 1 - Referências e medidas

- [x] **T001**: Fotos de referência da base em `docs/notebook-3d/base-*.jpg`, com os dados de série da etiqueta pixelados ou trocados pelos fictícios.
- [x] **T002**: Posições dos 10 parafusos medidas na planta (`base_planta.py` → `base.json`).
- [x] **T003**: Contornos das 88 fendas da grelha vetorizados (`base_planta.py` → `base.json`).
- [x] **T004**: Etiqueta com MO, SN, data e QR fictícios (`etiqueta.py` → `texturas/fundo_publico.jpg`); o build só usa essa textura.

## Fase 2 - Geometria (`build_blend.py`)

- [x] **T005**: Junta de molde entre o painel cinza e a faixa preta.
- [x] **T006**: Grelha com bolsões de 4 mm, tela furada a 1,2 mm e dissipador (`cobre`, `aleta_azul`) ao fundo.
- [x] **T007**: 10 parafusos Phillips rebaixados (corpo e bloco traseiro).
- [x] **T008**: Apoio traseiro movido para a posição da planta (3 trechos); pé frontal do lado −X centrado no pé da foto (estava espelhado do outro).
- [x] **T009**: Saídas de som com 3 fendas compridas e tela azul em cada chanfro.
- [x] **T010**: Fundo vazado nas fendas e nos rebaixos dos parafusos (`triangle_fill` com furos).

## Fase 3 - Site

- [x] **T011**: `liftBase` em `materials.ts` (polygonOffset do `fundo`) e offset maior nos adesivos, com teste em `materials.test.ts`.
- [x] **T012**: `montar.sh` com os passos novos; GLB regerado em `public/models/notebook-loq.glb`.

## Fase 4 - Validação

- [x] **T013**: +3.283 triângulos (teto 4.000) e +32 kB no GLB (teto 80 kB).
- [x] **T014**: `npm test`, lint e `tsc` sem regressão.
- [x] **T015**: Capturas de conferência da base (`shoot.cjs`) contra a foto real; `docs/notebook-3d/base-3d-render.jpg`.

Já existiam antes desta spec e não mudaram: os adesivos holográficos da base (`touro`, `compact_disc`).
