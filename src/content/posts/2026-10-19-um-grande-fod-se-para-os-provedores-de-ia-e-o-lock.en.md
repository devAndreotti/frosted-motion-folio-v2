---
title: A big f***-you to AI providers and the lock-in they try to push.
date: 2026-10-19
description: A big f***-you to AI providers and the lock-in they try to push.' Yesterday, Fabio Akita was on Flow and talked about this trap. If you...
tags: [linkedin, inteligenciaartificial, mcp, softwareengineering, desenvolvimento, claude]
draft: false
source: 0bb306c5dae7
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7516483324803063808/) on 10/19/2026.*

"A big f***-you to AI providers and the lock-in they try to push."

Yesterday, Fabio Akita was on Flow podcast and talked about this trap. If you code with AI, you have probably noticed: every provider tries to lock you into their own walled garden. ChatGPT memory stays with OpenAI; Projects stay with Anthropic. If the quota runs out, the service goes down, or you want to test a more capable model for a specific task, you have to re-explain the architecture, business rules, past decisions, and project *gotchas*.

On the podcast, Fabio Akita detailed the philosophy and mechanics of ai-memory. The premise is simple: the AI provider should be a mere disposable inference engine. The context, knowledge, and durable memory of the project belong to you and your repository, outside the ephemeral chat session.

ai-memory is an MCP (Model Context Protocol) server that keeps the technical memory of projects independent of the AI provider used. Integration is configured through a TOML file at the repository root referencing remote memory. With configured hooks, relevant information is automatically dispatched to this memory during the workflow, without manually copying and pasting context between sessions or agents.

Instead of relying solely on chat history or dumping raw data into the context window, ai-memory organizes knowledge so agents can retrieve exactly what they need:

- Reorganizes knowledge into architectural decisions, inviolable rules, configuration facts, and *gotchas* (recurring issues already resolved).

- Features an active pruning cycle, similar to human sleep, which reduces information without recent usage to avoid noise and wasteful LLM context consumption.

- Serves as an *inbox* across multiple agents working concurrently in parallel.

- Streamlines onboarding for new developers or resuming a project after returning from vacation.

I have been using ai-memory for 4 months across my personal projects and daily engineering routines. It is a fork of Akita's project with custom additions, such as an interactive graph of memory connections:

https://lnkd.in/dzcNwWCj

Currently, I combine multiple providers. My daily workflow switches between Claude (Opus, Haiku, and Sonnet), Codex, and Gemini. When a model's quota runs out or I switch agents in the terminal, the new model queries ai-memory, retrieves project decisions and conventions, and continues working. No manual copy-pasting of context, no noise, and no blind vendor loyalty to a single AI company.

The core idea is that memory must belong to the project, not to whichever vendor was chosen to run the next task. The model can change. The provider can go down. The quota can expire. But the cumulative knowledge built by the project should never vanish with the session.

---

### Post media

![LinkedIn post media](/blog/um-grande-fod-se-para-os-provedores-de-ia-e-o-lock/midia-1.jpg)
