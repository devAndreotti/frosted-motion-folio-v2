---
title: Project memory shouldn't be held hostage by your AI provider
date: 2026-10-15
description: ai-memory keeps a project's decisions, rules and gotchas outside the chat session, so any model can pick up where the last one stopped.
tags: [ia, mcp, ai-memory]
draft: false
source: be3e7e5f2cd1
---

> "A big f\*-you to the AI providers and the lock-in they try to push."

Fabio Akita was on Flow and talked about this trap. If you program with AI, you have
probably noticed it already: every provider tries to lock you into its own little
pen. ChatGPT's memory lives at OpenAI; Projects live at Anthropic.

![Cover of the Flow episode with Fabio Akita](/blog/ai-memory-memoria-do-projeto/capa.webp)

## The cost of switching models

If the quota runs out, the service goes down, or you want to try a more capable model
for a task, you have to explain the architecture, the business rules, the old
decisions and the project's *gotchas* all over again.

The premise of ai-memory is simple: the AI provider should be a disposable inference
processor. The context, the knowledge and the durable memory of the project belong to
you and to your repository, outside the ephemeral chat session.

## What ai-memory is

It is an MCP (Model Context Protocol) server that keeps a project's technical memory
independent of the AI provider. The integration is configured by a TOML file at the
project root that points to the remote memory. With hooks set up, relevant information
is sent to that memory automatically as you work, with no copying and pasting context
between sessions or agents.

Instead of relying only on the conversation history or dumping everything into the
context window, it organizes knowledge so agents can retrieve what they need:

- it reorganizes knowledge into architectural decisions, inviolable rules, configuration facts and *gotchas* (recurring problems already solved);
- it has an active cleanup cycle, similar to human sleep, that trims information with no recent use and avoids noise and wasted inference window;
- it works as an *inbox* between several agents working in parallel;
- it makes onboarding new developers, or resuming the project after a vacation, easier.

## How I use it

I have been using ai-memory for 4 months in my personal projects and in my day-to-day
engineering work. It is a fork of Akita's project, with customizations such as an
interactive graph of the memory connections: [repository](https://lnkd.in/dzcNwWCj).

These days I combine several providers. My daily use alternates between Claude (Opus,
Haiku and Sonnet), Codex and Gemini. When one model's quota runs out or I switch agents
in the terminal, the new model queries ai-memory, retrieves the project's decisions and
conventions and carries on with the work. No copying and pasting context, no noise, and
no blind loyalty to a single AI company.

## In one sentence

The memory follows the project, not the vendor chosen to run the next task. The model can
change, the provider can go down, the quota can run out. But the knowledge the project
has accumulated shouldn't disappear along with the session.
