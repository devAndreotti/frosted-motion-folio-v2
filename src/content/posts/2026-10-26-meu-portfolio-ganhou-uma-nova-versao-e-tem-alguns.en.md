---
title: "Portfolio v2: Glassmorphism, autonomous AI workflows and self-hosted infrastructure"
date: 2026-10-26
time: "16:19"
description: "How I built the new version of my portfolio uniting adaptive design tokens, autonomous Hermes translation, interactive terminal and Cloudflare edge."
tags: [react, tailwind, automacao, cloudflare, hermes]
draft: false
source: 76b86ffc450d
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7518270888371445761/) on 10/26/2026.*

I have always gravitated toward interfaces with depth, frosted glass layers, physically plausible illumination, and fluid transitions. For the new version of my portfolio, I decided to turn this visual identity into an engineering-led project uniting modern frontend architecture, smart autonomous routines, and dedicated self-hosted infrastructure.

## Far beyond a static portfolio showcase

Instead of assembling a conventional link tree, the goal was building an interactive space with clear technical personality right from first paint:

> A great portfolio must be living evidence of the skills it claims: if you build systems and interfaces, the site itself must demonstrate that in every detail.

The frontend stack unites React 19, Vite, Tailwind CSS with OKLCH design tokens, Motion animations, and Three.js driving the interactive 3D notebook stage in the Hero.

## The interactive Sudo Terminal

In the top navigation area, visitors can trigger an embedded terminal to explore the stack, shortcuts, and public project details directly via command line:

```bash
# Comandos públicos disponíveis no terminal embutido
sudo help
sudo stack
sudo projetos
```

The terminal supports command history navigation (up/down arrow keys), autocomplete, and localized output in both Portuguese and English.

## Autonomous pipeline with Hermes agents

Content management does not depend on heavy database CMS dashboards:

- **Git-driven publishing:** Every blog article is a strictly typed Markdown file tracked in git version control;
- **Agentic translation:** A local scheduled task via **Hermes Agent** detects newly published Portuguese posts, writes corresponding English editions, and opens a Pull Request with strict structural AST validation;
- **Automated rich snippets:** Dynamic Schema.org `BlogPosting` JSON-LD generation for search engine rich results;
- **Zen reading mode:** Distraction-free single-column reading view toggleable with `<kbd>Esc</kbd>`.

## Hybrid infrastructure: Cloudflare and Oracle VPS

Deployment combines edge speed with server-side control:

- **Cloudflare Edge:** Global static asset distribution ensuring single-digit millisecond latency worldwide;
- **Oracle Linux VPS:** The newsletter dispatcher, metric collection scripts, and task orchestrators run in isolated containers on my personal server.

The complete codebase is open source on [GitHub](https://github.com/devAndreotti/frosted-motion-folio-v2).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/meu-portfolio-ganhou-uma-nova-versao-e-tem-alguns/midia-1.jpg)
