# Plan: Refinamento Arquitetural e Modelagem da Base 3D

**Feature Branch**: `feat/spec-notebook-base-refinement`  
**Date**: 2026-10-29  
**Spec**: `/specs/005-notebook-3d-base-refinement/spec.md`  
**Decisions**: `/specs/005-notebook-3d-base-refinement/decisions.md`

---

## 1. Sumário Executivo

Este plano orienta a implementação autônoma por IA para o refinamento da face inferior do Lenovo LOQ 15IRH8 no repositório `frosted-motion-folio-v2`. A arquitetura foca na transição de recortes booleanos puros para uma estrutura mecânica fidedigna de injeção termoplástica com chanfros de 0,25 mm, câmara interna volumétrica com aros de ventoinhas de 52 mm, escareados cônicos nos 10 parafusos M2 e aletas acústicas nas saídas de som.

---

## 2. Contexto Técnico e Módulos do Repositório

- **Pipeline de Modelagem 3D**: `scripts/notebook3d/`
  - `build_blend.py`: Script Python executado em Blender 4.0 headless que gera os sólidos, malhas, materiais e hierarquia.
  - `base_planta.py`: Vetoriza as fendas e centros de parafusos a partir da planta retificada (`plantas/bottom.jpg`).
  - `base.json`: Metadados vetoriais (88 fendas, 10 parafusos, limites da grelha).
  - `etiqueta.py`: Sanitiza e substitui campos de dados de série por valores fictícios determinísticos.
  - `montar.sh`: Pipeline mestre que orquestra a geração, exportação e compressão GLB.
- **Frontend & Visualizador 3D**: `src/lib/notebook3d/`
  - `scene.ts`: Orquestrador Three.js, iluminação direcional, órbita e controles de câmera.
  - `materials.ts`: Configura materiais PBR (`MeshStandardMaterial`), shaders, `polygonOffset` e offsets de adesivos holográficos.
  - `types.ts`: Tipagens do modelo e nós de cena.

---

## 3. Abordagem de Implementação por Etapas

### Etapa 1: Enriquecimento Paramétrico de Dados (`base.json` e `base_planta.py`)
1. Adicionar ao `base.json` as coordenadas centrais e raios dos dois aros de exaustão/admissão das ventoinhas:
   - Ventoinha Esquerda (CPU): `center: [-82.5, 172.0] mm`, `radius: 26.0 mm`.
   - Ventoinha Direita (GPU): `center: [+82.5, 172.0] mm`, `radius: 26.0 mm`.
2. Adicionar especificação de escareado cônico de 45° com profundidade de 0,35 mm para cada um dos 10 parafusos.
3. Parametrizar as 3 fendas acústicas de cada chanfro lateral (Y 25 a 57,4 mm) com ângulo de louver voltado 30° para baixo.

### Etapa 2: Escultura e Operações Geométricas (`build_blend.py`)
1. **Micro-Chanfros nas Fendas**: Modificar a rotina `recortar()` em `build_blend.py` para introduzir chanfro de 1 segmento (0,25 mm) nas bordas superiores das 88 fendas.
2. **Cavidades de Ventoinhas**:
   - Inserir dois anéis toroidais baixos (`torus` ou cilindros com furo) em Z = 1,4 mm sob a tela colmeia para simular as carcaças plásticas das turbinas.
   - Atribuir material `furo` (preto acetinado) aos anéis.
3. **Tubos de Dissipação (Heatpipes)**:
   - Gerar duas hastes cilíndricas achatadas de 6 mm em material `cobre` interligando a área das ventoinhas ao centro em aletas azuis (`aleta_azul`).
4. **Parafusos com Assento Cônico**:
   - Ajustar o cortador cilíndrico dos parafusos para incluir um cone de entrada de 45° antes do alojamento do parafuso Phillips.
5. **Aletas dos Alto-Falantes**:
   - Substituir os furos retos dos alto-falantes por 3 ranhuras com defletores angulares a 30°.

### Etapa 3: Tratamento de Materiais e Buffer WebGL (`materials.ts`)
1. Manter `liftBase` com `polygonOffset` no material `fundo` para evitar Z-fighting com o corpo do notebook.
2. Garantir que as geometrias novas sejam fundidas nos grupos estáticos consolidados (`grupo_notebook_corpo`, `grupo_notebook_cobre`, `grupo_notebook_aleta_azul`, `grupo_notebook_parafuso`).

---

## 4. Contrato de Dados (`base.json` atualizado)

```json
{
  "versao": "2.0",
  "dimensoes_base_mm": { "largura": 359.6, "profundidade": 264.8 },
  "fendas": {
    "total": 88,
    "profundidade_bolsao_mm": 4.0,
    "altura_tela_colmeia_mm": 1.2,
    "chanfro_entrada_mm": 0.25
  },
  "ventoinhas": [
    { "id": "fan_cpu", "cx_mm": -82.5, "cy_mm": 172.0, "raio_mm": 26.0, "espessura_aro_mm": 1.5 },
    { "id": "fan_gpu", "cx_mm": 82.5, "cy_mm": 172.0, "raio_mm": 26.0, "espessura_aro_mm": 1.5 }
  ],
  "parafusos": {
    "total": 10,
    "raio_cabeca_mm": 1.6,
    "raio_furo_mm": 2.1,
    "rebaixo_cilindrico_mm": 0.7,
    "chanfro_escareado_mm": 0.35,
    "angulo_escareado_graus": 45.0
  }
}
```

---

## 5. Segurança, Privacidade e Qualidade

- **Sanitização Obrigatória**: A textura `texturas/fundo_publico.jpg` gerada por `etiqueta.py` é a única permitida. O script `montar.sh` aborta com código de erro 1 se `fundo.jpg` original não estiver higienizado.
- **Teto de Linhas**: Nenhuma alteração nos arquivos TypeScript/Markdown deve violar a regra de 300 linhas do `.quality-gate/policy.json`.

---

## 6. Estratégia de Teste e Verificação

| Cenário de Aceite | Validação Automatizada / Manual | Arquivo de Teste |
| :--- | :--- | :--- |
| **Micro-chanfros e brilho especular** | Captura headless `shoot.cjs` na vista rasante (polar 150°, az 20°) | `scripts/notebook3d/shoot.cjs` |
| **Aros de ventoinhas e dissipador** | Inspeção visual contra `base-3d-foto-x-modelo.jpg` | `docs/notebook-3d/` |
| **Orçamento de triângulos** | `python3 scripts/notebook3d/glbinfo.py` verificando teto <= 28.500 | Pipeline CI / `montar.sh` |
| **Estabilidade WebGL / Regressão** | `npm run test` e `npm run test:visual` | `tests/visual/pages.spec.ts` |

---

## 7. Riscos e Mitigações

1. **Risco**: Aumento de draw calls decorrente dos novos sólidos das ventoinhas.  
   *Mitigação*: Agrupamento obrigatório de malhas (`bpy.ops.object.join`) por material antes da exportação glTF.
2. **Risco**: Z-fighting na tela colmeia com o aro da ventoinha em dispositivos com GPU de 16-bit depth buffer.  
   *Mitigação*: Manter folga vertical de 0,2 mm entre o aro superior da carcaça e a malha colmeia.
