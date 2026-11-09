---
title: "Um grande fod*-se para os provedores de IA e o lock-in que eles tentam empurrar."
date: 2026-10-19
description: "Um grande fod*-se para os provedores de IA e o lock-in que eles tentam empurrar.' Ontem, Fabio Akita esteve no Flow e falou sobre essa armadilha. Se você..."
tags: [linkedin, inteligenciaartificial, mcp, softwareengineering, desenvolvimento, claude]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7516483324803063808/) em 19/10/2026.*

"Um grande fod*-se para os provedores de IA e o lock-in que eles tentam empurrar."

Ontem, Fabio Akita esteve no Flow e falou sobre essa armadilha. Se você programa com IA, provavelmente já percebeu: cada provedor tenta te prender no próprio cercadinho. A memória do ChatGPT fica na OpenAI; os Projects, na Anthropic. Se a cota estoura, o serviço cai ou você quer testar um modelo mais competente para uma tarefa, precisa reexplicar a arquitetura, as regras de negócio, decisões antigas e *gotchas* do projeto.

No podcast, Fabio Akita detalhou a filosofia e o funcionamento do ai-memory. A premissa é simples: o provedor de IA deve ser um mero processador de inferência descartável. O contexto, o conhecimento e a memória durável do projeto pertencem a você e ao seu repositório, fora da sessão efêmera do chat.

O ai-memory é um servidor MCP (Model Context Protocol) que mantém a memória técnica dos projetos independente do provedor de IA utilizado. A integração é configurada por um arquivo TOML na raiz do projeto, que referencia a memória remota. Com hooks configurados, informações relevantes são enviadas automaticamente para essa memória durante o fluxo de trabalho, sem copiar e colar contexto entre sessões ou agentes.

Em vez de depender apenas do histórico de conversas ou de despejar informações na janela de contexto, o ai-memory organiza o conhecimento para que os agentes recuperem o que precisam:

- Reorganiza o conhecimento em decisões arquiteturais, regras invioláveis, fatos de configuração e *gotchas* (problemas recorrentes já resolvidos).

- Possui um ciclo de limpeza ativo, similar ao sono humano, que reduz informações sem uso recente para evitar ruído e desperdício da janela de inferência da LLM.

- Serve de caixa de entrada (*inbox*) entre múltiplos agentes que trabalham em paralelo.

- Facilita o onboarding de novos desenvolvedores ou a retomada do projeto após as férias.

Uso o ai-memory há 4 meses nos meus projetos pessoais e no dia a dia de engenharia. É um fork do projeto do Akita, com customizações, como um grafo interativo das conexões de memória:

https://lnkd.in/dzcNwWCj

Atualmente, combino vários provedores. Meu uso diário alterna entre Claude (Opus, Haiku e Sonnet), Codex e Gemini. Quando a cota de um modelo acaba ou troco de agente no terminal, o novo modelo consulta o ai-memory, recupera as decisões e convenções do projeto e continua o trabalho. Sem copiar e colar contexto manualmente, sem ruído e sem fidelidade cega a uma única empresa de IA.

A ideia é que a memória acompanhe o projeto, não o fornecedor escolhido para executar a próxima tarefa. O modelo pode mudar. O provedor pode cair. A cota pode acabar. Mas o conhecimento acumulado pelo projeto não deveria desaparecer junto com a sessão.


---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/um-grande-fod-se-para-os-provedores-de-ia-e-o-lock/midia-1.jpg)

