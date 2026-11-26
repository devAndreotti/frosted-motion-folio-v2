# Decisions: Refinamento Mecânico e Visual da Base 3D

**Feature Branch**: `feat/spec-notebook-base-refinement`  
**Created**: 2026-10-29

---

## ADR-001: Geometria Otimizada com Micro-Chanfro e Bake de Normais vs Subdivisão Bruta

**Status**: Accepted  
**Date**: 2026-10-29

### Contexto

A face inferior do notebook possui 88 fendas de admissão de ar, 10 cavidades de parafusos M2 e 6 saídas de alto-falantes nos chanfros laterais. Em peças reais fabricadas por injeção de termoplástico (ABS/PC), as arestas nunca são vivas (cortes a 90° puros); elas apresentam raio de arredondamento de ~0,25 mm e conicidade de desmoldagem de ~0,5°.

Em Three.js sob iluminação PBR com luz direcional, cortes vivos sem chanfro causam:
1. Arestas aliadas e serrilhadas com artefatos escuros de interpolação de normais.
2. Perda total de realce de specular nas bordas quando vistas de ângulos rasantes.
3. Aspecto de corte booleano sintético em vez de carcaça industrial real.

A IA modeladora precisa de uma diretriz arquitetural clara sobre como representar essas transições sem comprometer a performance no browser móvel.

---

### Opções Consideradas

1. **Subdivisão Poligonal Bruta (Modificador Bevel de 2 ou 3 segmentos em todas as arestas no Blender)**:
   - *Vantagens*: Silhueta geométrica perfeita mesmo em zoom extremo.
   - *Desvantagens*: Cada fenda ganha ~500 triângulos. Com 88 fendas, o acréscimo ultrapassaria 44.000 triângulos, elevando o GLB para mais de 3,5 MB e derrubando a taxa de quadros no mobile abaixo dos 60 FPS exigidos pelo Quality Gate.

2. **Geometria Low-Poly com Micro-Chanfro de 1 Segmento + Normal Map de Tangente Assado (Bake High-to-Low)**:
   - *Vantagens*: O chanfro de 1 segmento adiciona apenas 2 triângulos por vértice de fenda (~2.600 triângulos no total), enquanto o mapa de normais fornece a curvatura suave e o gradiente de luz especular. Custo computacional insignificante no fragment shader e 100% compatível com a arquitetura `tap-to-3d` do mobile.
   - *Desvantagens*: Requer que o pipeline de build gere o mapa de normais durante a execução do script headless.

3. **Textura Plana Albedo com Iluminação Falsa (Bake de Sombras em 2D)**:
   - *Vantagens*: Zero acréscimo de triângulos.
   - *Desvantagens*: Não reage à movimentação da luz ou rotação da câmera, falhando no teste visual de profundidade em ângulo rasante.

---

### Decisão

Adotamos a **Opção 2 (Geometria Low-Poly com Micro-Chanfro de 1 Segmento + Normal Map de Tangente Assado)**.

A IA implementadora no Blender 4.0 deve:
1. Manter a profundidade física das fendas em 4,0 mm e a tela colmeia a 1,2 mm.
2. Aplicar chanfro de 1 segmento com largura de 0,25 mm nas entradas das fendas e 45° nos escareados dos parafusos.
3. Integrar o relevo das aletas e turbinas internas no atlas PBR existente, sem gerar draw calls avulsas.

---

### Consequências

**Positivas:**
- Fidelidade fotorealista idêntica à foto de referência (`base-3d-foto-x-modelo.jpg`).
- Manutenção rigorosa do teto de performance (+2.800 triângulos vs teto de +3.500).
- Nenhum impacto no LCP ou TBT do Lighthouse em dispositivos móveis.
- Unificação de materiais respeitando a convenção `grupo_notebook_*`.

**Negativas:**
- O script `montar.sh` no Blender requer etapa de atribuição e cálculo de vetores tangentes (`bpy.ops.mesh.normals_tools`).
