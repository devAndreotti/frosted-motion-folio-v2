---
title: "Eu só precisava de um papel amassado para o meu jogo."
date: 2026-11-02
description: "Eu só precisava de um papel amassado para o meu jogo. Não achei nada pronto. Então criei uma biblioteca do zero e ela é 100% procedural. Durante o..."
tags: [linkedin, webgl, creativecoding, javascript, gamedev, opensource]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7521189846770405377/) em 02/11/2026.*

Eu só precisava de um papel amassado para o meu jogo.

Não achei nada pronto. Então criei uma biblioteca do zero e ela é 100% procedural.

Durante o desenvolvimento de Memory Apartment (meu jogo de terror psicológico e investigação), esbarrei em um detalhe essencial de imersão: o jogador precisa interagir com bilhetes no chão, memorandos velhos, recibos térmicos e cartas que contam os segredos do Edifício Primavera.

Eu não queria uma textura estática nem uma animação pré-renderizada. Queria que o papel parecesse físico: voasse até o centro da tela e se desdobrasse diante do jogador.

Procurei uma biblioteca web leve para isso. Não encontrei nada procedural, interativo e sem um monte de dependências pesadas.

A solução foi construir o Crumple: uma biblioteca WebGL2 procedural, generativa e sem nenhuma dependência externa (zero-dependency).

O que tem por trás do código:

- 100% generativo: malha, vincos e deformações calculados em tempo de execução. Com uma seed, o mesmo amassado e padrão de dobras é reproduzido deterministicamente.

- 10 tipos de papel: folha datilografada, papel pautado de caderno, formulário contínuo de impressora antiga, cupom fiscal térmico, foto instantânea, envelope selado e canhoto de teatro destacável.

- 14 estados de desgaste físico: papel queimado, chamuscado, manchas de café, água, vinho, marcas de dedos, fita adesiva, carimbos e envelhecimento pelo tempo.

- Interatividade real: o usuário pode abrir arrastando com o mouse, virar a folha (frente e verso), queimar a nota (com 4 modos de propagação de fogo) e revelar tinta oculta usando o cursor como foco de luz.

- Áudio procedural: ruídos de papel amassando, desdobrando e queimando sintetizados diretamente via Web Audio API, sem necessidade de carregar pacotes de áudio externos.

O projeto está publicado no npm (@devandreotti/crumple) e funciona tanto em canvas direto (Stage) quanto acoplado a elementos do DOM (Scene).

Playground interativo: https://lnkd.in/d6gVAMGm

Repositório no GitHub: https://lnkd.in/dytp-QcJ


---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/eu-so-precisava-de-um-papel-amassado-para-o-meu-jo/midia-1.jpg)

