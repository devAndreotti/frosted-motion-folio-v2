---
title: A memória do projeto não deveria ser refém do provedor de IA
date: 2026-10-15
description: O ai-memory mantém decisões, regras e gotchas do projeto fora da sessão de chat, e qualquer modelo continua de onde o outro parou.
tags: [ia, mcp, ai-memory]
draft: false
---

> "Um grande fod\*-se para os provedores de IA e o lock-in que eles tentam empurrar."

Fabio Akita esteve no Flow e falou sobre essa armadilha. Se você programa com IA,
provavelmente já percebeu: cada provedor tenta te prender no próprio cercadinho.
A memória do ChatGPT fica na OpenAI; os Projects, na Anthropic.

![Capa do episódio do Flow com Fabio Akita](/blog/ai-memory-memoria-do-projeto/capa.jpg)

## O custo de trocar de modelo

Se a cota estoura, o serviço cai ou você quer testar um modelo mais competente
para uma tarefa, precisa reexplicar a arquitetura, as regras de negócio, as
decisões antigas e os *gotchas* do projeto.

A premissa do ai-memory é simples: o provedor de IA deve ser um mero processador
de inferência descartável. O contexto, o conhecimento e a memória durável do
projeto pertencem a você e ao seu repositório, fora da sessão efêmera do chat.

## O que é o ai-memory

É um servidor MCP (Model Context Protocol) que mantém a memória técnica dos
projetos independente do provedor de IA. A integração é configurada por um
arquivo TOML na raiz do projeto, que referencia a memória remota. Com hooks
configurados, informações relevantes são enviadas automaticamente para essa
memória durante o fluxo de trabalho, sem copiar e colar contexto entre sessões
ou agentes.

Em vez de depender só do histórico de conversas ou de despejar tudo na janela de
contexto, ele organiza o conhecimento para que os agentes recuperem o que precisam:

- reorganiza o conhecimento em decisões arquiteturais, regras invioláveis, fatos de configuração e *gotchas* (problemas recorrentes já resolvidos);
- tem um ciclo de limpeza ativo, parecido com o sono humano, que reduz informações sem uso recente e evita ruído e desperdício da janela de inferência;
- serve de caixa de entrada (*inbox*) entre vários agentes trabalhando em paralelo;
- facilita o onboarding de novos desenvolvedores ou a retomada do projeto depois das férias.

## Como eu uso

Uso o ai-memory há 4 meses nos meus projetos pessoais e no dia a dia de
engenharia. É um fork do projeto do Akita, com customizações, como um grafo
interativo das conexões de memória: [repositório](https://lnkd.in/dzcNwWCj).

Hoje combino vários provedores. Meu uso diário alterna entre Claude (Opus, Haiku
e Sonnet), Codex e Gemini. Quando a cota de um modelo acaba ou troco de agente no
terminal, o novo modelo consulta o ai-memory, recupera as decisões e convenções
do projeto e continua o trabalho. Sem copiar e colar contexto, sem ruído e sem
fidelidade cega a uma única empresa de IA.

## Em uma frase

A memória acompanha o projeto, não o fornecedor escolhido para executar a próxima
tarefa. O modelo pode mudar, o provedor pode cair, a cota pode acabar. Mas o
conhecimento acumulado pelo projeto não deveria desaparecer junto com a sessão.
