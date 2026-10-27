# Executable Tasks: Modelagem da Base 3D do Notebook

**Feature Branch**: `feat/spec-notebook-base-3d`  
**Spec Reference**: `specs/004-notebook-3d-base/spec.md`  
**Architecture Plan**: `specs/004-notebook-3d-base/plan.md`

---

## Fase 1 - Ativos de Referência e Mapeamento de Coordenadas

- [x] **T001**: Extrair fotos de alta resolução da parte de baixo da máquina de trabalho para o repositório (`docs/notebook-3d/base-referencia-real.jpg`, `base-adesivos-detalhe.jpg`, `base-etiqueta-detalhe.jpg`, `base-planta-retificada.jpg`).
- [ ] **T002**: Medir as coordenadas milimétricas dos 10 parafusos Phillips contra `plantas/bottom.jpg` e exportar para `scripts/notebook3d/parafusos_base.json`.
- [ ] **T003**: Vetorizar/retificar os perfis das fendas térmicas hexagonais/trapezoidais de admissão de ar e as caixas delimitadoras das ventoinhas internas.
- [ ] **T004**: Recortar e isolar as artes de alta resolução da etiqueta técnica de fábrica (`LOQ 15IRH8`) e do selo `CO2 Offset Service by Lenovo`.

---

## Fase 2 - Modelagem Geométrica no Blender (`build_blend.py`)

- [ ] **T005**: Substituir a face plana única de `fundo` pela malha de chassi estruturada com divisão da faixa traseira preta e sulco de molde.
- [ ] **T006**: Implementar o recorte das grelhas de ventilação com profundidade de 1,2 mm e criar a camada interna do dissipador (`aleta_azul`, `cobre`, `furo`).
- [ ] **T007**: Implementar a função geradora das cabeças de parafuso Phillips escareadas e posicionar as 10 instâncias nos locais medidos em T002.
- [ ] **T008**: Ajustar as cavidades de alojamento e a extrusão dos pés de borracha frontais e traseiros com bisel `bev_bot` realista.

---

## Fase 3 - Pipeline de Decals, Atlas e Shaders

- [ ] **T009**: Atualizar `scripts/notebook3d/adesivos.json` com as entradas completas de `touro`, `compact_disc`, `etiqueta_loq` e `selo_co2` com `sup: "bottom"`.
- [ ] **T010**: Executar `atlas.py` para gerar o novo atlas de textura 2048² com as máscaras holográficas dos novos adesivos da base.
- [ ] **T011**: Validar em `src/lib/notebook3d/materials.ts` a aplicação do shader holográfico para planos com normal invertida (`down=True`).

---

## Fase 4 - Otimização de Assets, CI e Validação Visual

- [ ] **T012**: Executar `scripts/notebook3d/montar.sh` para gerar `public/models/notebook-loq.glb` comprimido via `gltf-transform optimize` (meshopt + WebP).
- [ ] **T013**: Verificar o orçamento de tamanho do arquivo GLB (delta <= 80 kB) e inspecionar contagem de triângulos via `scripts/notebook3d/glbinfo.py`.
- [ ] **T014**: Executar `npm test` e validar testes unitários e de materiais sem regressão.
- [ ] **T015**: Gerar captura de conferência da vista inferior via `scripts/notebook3d/shoot.cjs` e validar conformidade visual contra a foto real.
