# Tasks: Refinamento da Base 3D do Notebook Lenovo LOQ

**Spec**: `/specs/005-notebook-3d-base-refinement/spec.md`  
**Decisions**: `/specs/005-notebook-3d-base-refinement/decisions.md`  
**Plan**: `/specs/005-notebook-3d-base-refinement/plan.md`

---

## P1 — Geometria Mecânica de Injeção Plástica (Grelha e Fendas)

### Cenário de Aceite 1: Micro-chanfros e reflexo especular nas 88 fendas
- [ ] [Impl] Parametrizar chanfro de desmoldagem de 0,25 mm em `scripts/notebook3d/base_planta.py` e atualizar `base.json` com vetores de chanfro.
- [ ] [Impl] Ajustar rotina `recortar()` em `scripts/notebook3d/build_blend.py` para aplicar bisel de 1 segmento nas bordas superiores das fendas.
- [ ] [Verify] Rodar captura em ângulo rasante com `shoot.cjs` e verificar reflexo especular contínuo nas bordas sem artefatos escuros de interpolação.

### Cenário de Aceite 2: Câmara volumétrica e carcaças das ventoinhas radiais
- [ ] [Impl] Adicionar geometria cilíndrica oca (aros de R=26 mm, espessura 1,5 mm) em `build_blend.py` nas posições centrais X = ±82,5 mm, Y = 172 mm.
- [ ] [Impl] Associar carcaças ao material `furo` (preto acetinado) posicionado a Z = 1,4 mm (0,2 mm abaixo da tela colmeia).
- [ ] [Verify] Inspecionar visualmente através das fendas da grelha na visualização 3D, conferindo contorno circular das turbinas contra `base-3d-foto-x-modelo.jpg`.

### Cenário de Aceite 3: Tubulações de cobre (Heatpipes) interligadas ao dissipador
- [ ] [Impl] Modelar duas hastes convexas de 6 mm em `build_blend.py` com material `cobre` conectando o bloco central à área das ventoinhas.
- [ ] [Verify] Confirmar visibilidade dos tubos metálicos de cobre pelas aberturas centrais da grelha em render de conferência.

---

## P2 — Escareado dos Parafusos e Saídas Acústicas

### Cenário de Aceite 1: Poços de parafusos com conicidade de 45°
- [ ] [Impl] Atualizar os cortadores dos 10 parafusos em `build_blend.py` para introduzir o cone de entrada de 45° (profundidade 0,35 mm) antes do rebaixo de 0,7 mm.
- [ ] [Verify] Verificar formação de anel cônico e sombra em crescente nas cavidades dos parafusos sob iluminação direcional.

### Cenário de Aceite 2: Aletas direcionais nas saídas de som dos chanfros
- [ ] [Impl] Substituir os cortes cilíndricos das saídas de som em `build_blend.py` por 3 fendas anguladas a 30° direcionadas para baixo em cada chanfro lateral.
- [ ] [Verify] Conferir o alinhamento e acabamento azul cobalto das saídas acústicas em relação à foto real de referência (`base-etiqueta-detalhe.jpg`).

### Cenário de Aceite 3: Barra de apoio traseiro emborrachada
- [ ] [Impl] Validar as coordenadas dos 3 trechos do apoio traseiro em `build_blend.py`, assegurando espessura de 1,8 mm e vedação do vão inferior.
- [ ] [Verify] Testar rotação do notebook na vista de trás para certificar ausência de vãos visuais sob o apoio de borracha.

---

## P3 — Conformidade com Privacidade e Higienização de Dados

### Cenário de Aceite 1: Geração de dados de identificação sintéticos
- [ ] [Impl] Validar `scripts/notebook3d/etiqueta.py` para garantir substituição de MO, SN, Date e QR por valores fixos fictícios (`MO: PF9XB26`, `SN: PF9XXXXX`).
- [ ] [Verify] Executar verificação automatizada com script de OCR/regex nos arquivos de imagem gerados para assegurar zero vazamento de seriais reais.

### Cenário de Aceite 2: Trava de compilação em `montar.sh`
- [ ] [Impl] Inserir asserção de segurança em `scripts/notebook3d/montar.sh` impedindo a geração do modelo se `fundo_publico.jpg` não for a única textura referenciada.
- [ ] [Verify] Rodar `./montar.sh` de teste e certificar interrupção caso arquivo privado seja injetado.

---

## Final Verification

- [ ] Validar orçamento geométrico: acréscimo de triângulos <= +3.500 (total <= 28.500 triângulos) com `glbinfo.py`.
- [ ] Validar tamanho do arquivo GLB otimizado com `gltf-transform optimize`: acréscimo <= +45 kB (total <= 1,40 MB).
- [ ] Executar bateria completa de testes locais: `npm run test` (100% verde).
- [ ] Executar auditoria de linter: `npm run lint` com 0 novos erros.
- [ ] Conferir estrita conformidade com o teto de 300 linhas em todos os arquivos de especificação (`spec.md`, `decisions.md`, `plan.md`, `tasks.md`).
- [ ] Verificar todos os cenários de aceite com o visualizador headless `shoot.cjs`.
