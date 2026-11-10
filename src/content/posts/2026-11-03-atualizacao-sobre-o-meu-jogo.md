---
title: "Espaços Impossíveis: Geometria Não-Euclidiana no Godot 4"
date: 2026-11-03
time: "16:19"
description: "Como implementei transições espaciais impossíveis e portas em loop no Godot 4 sem portais ou câmeras secundárias."
tags: [godot, gamedev, gdscript, terrorpsicologico, indiegame]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7523398830097305602/) em 03/11/2026.*

Uma das sensações que mais quero explorar em **Memory Apartment** é o desconforto de estar preso em um lugar que deveria ser familiar e acolhedor. Para isso, estive refinando uma mecânica de geometria não-euclidiana no apartamento 17.

A premissa é direta: a porta de entrada nem sempre leva para o lado de fora.

## O terror do que deveria ser familiar

Em determinado momento da narrativa, o jogador destranca a porta da frente esperando encontrar o corredor de pastilhas do Edifício Primavera. No entanto, ao girar a maçaneta, depara-se com o próprio corredor interno do apartamento.

> O verdadeiro terror psicológico não nasce de monstros correndo atrás de você, mas da percepção gradual de que as leis da física e da arquitetura do seu quarto deixaram de operar como deveriam.

Ele recua, bate a porta, respira fundo e abre de novo: o corredor interno continua lá, estendendo-se em um loop claustrofóbico.

## Implementando sem portais ou câmeras extras

Muitos jogos resolvem transições espaciais impossíveis utilizando *stencil buffers*, render targets secundários ou portais com câmeras duplicadas. Embora funcionem bem em motores de grande porte, essas abordagens costumam dobrar o custo de renderização de luzes e sombras em tempo real.

Na Godot 4, adotei uma solução mais leve e determinística: alternar nós de colisão, iluminação e visibilidade no frame exato em que a folha da porta fecha o campo de visão:

```gdscript
# Alterna o ambiente atrás da porta fechada baseado no estado narrativo
func _on_front_door_closed() -> void:
    if narrative_state.is_anomaly_active("loop_hallway"):
        building_corridor.visible = false
        building_corridor.process_mode = Node.PROCESS_MODE_DISABLED
        interior_mirror.visible = true
        interior_mirror.process_mode = Node.PROCESS_MODE_INHERIT
```

## Vantagens da alternância discreta

Essa abordagem oferece benefícios claros de performance e fluxo:

- **Custo Zero de Draw Calls Extras:** Não há câmeras secundárias desenhando geometria fora da visão do jogador;
- **Persistência de Iluminação:** A iluminação assada (lightmaps) e os probes de reflexão permanecem estáveis sem transição brusca;
- **Reutilização Modular:** A mesma lógica de gatilho narrativo pode ser reaproveitada em armários, janelas e cômodos que mudam de tamanho.

E o jogo reserva outros cenários inesperados: além do apartamento e do prédio, existe um teatro antigo escondido nas entranhas do edifício.

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/atualizacao-sobre-o-meu-jogo/midia-1.jpg)
