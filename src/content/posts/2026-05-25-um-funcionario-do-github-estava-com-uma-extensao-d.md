---
title: "Nx Console envenenado: 11 minutos de auto-update e 3.800 repositórios do GitHub comprometidos"
date: 2026-05-25
time: "08:24"
description: "Como um pacote npm malicioso no ecossistema TanStack virou uma extensão do VS Code com backdoor, e o que fazer com auto-update, credenciais e extensões a partir disso."
tags: [linkedin, seguranca, supply-chain, vscode, npm, github]
linkedin: urn:li:activity:7464637618132066304
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7464637618132066304/) em 25/05/2026.*

Um funcionário do GitHub estava com uma extensão do VSCode instalada com auto-update ativado. Em 11 minutos, 3.800 repositórios internos foram comprometidos.

Não foi um zero-day. Não foi engenharia social sofisticada. Foi um pacote npm malicioso e uma extensão envenenada.

## A cadeia do ataque

Tudo começou no dia 11 de maio, uma semana antes do incidente principal. O grupo TeamPCP publicou pacotes maliciosos no ecossistema TanStack no npm, incluindo o `@tanstack/zod-adapter`.

Um contribuidor do Nx Console rodou um `pnpm install` de rotina e resolveu o pacote comprometido. Uma salvaguarda que deveria ter bloqueado pacotes recém-publicados foi silenciosamente ignorada por uma versão antiga do pnpm. A opção de configuração era um no-op, não fazia nada.

O token OAuth do GitHub CLI do contribuidor foi roubado.

Sete dias depois, esse token foi usado para publicar uma versão backdoored do Nx Console (v18.95.0) no VS Code Marketplace. O payload malicioso ficou ativo por 11 a 18 minutos antes de ser removido. Tempo suficiente.

O código injetado buscava e executava um dropper de 498 KB. Alvos: tokens do GitHub, tokens npm, credenciais AWS/GCP, chaves SSH, variáveis de ambiente. Exfiltração via HTTPS e DNS tunneling.

Um funcionário do GitHub com a extensão instalada e auto-update ativo foi comprometido. Resultado: acesso a aproximadamente 3.800 repositórios internos.

## O problema estrutural

O VS Code Marketplace não tem processo de revisão de segurança significativo. Não tem kill-switch para versões já instaladas. Não tem mecanismo para notificar usuários quando uma extensão que eles têm instalada é encontrada como maliciosa depois.

Auto-update vem ativado por padrão. Extensões rodam com permissões amplas no sistema. E por serem artefatos interpretados em texto plano, ferramentas tradicionais de EDR frequentemente não detectam o comportamento malicioso.

11 minutos foi suficiente.

## O que fazer agora

Se você tinha o Nx Console instalado com auto-update ativo por volta do dia 18 de maio:

- Atualize para uma versão limpa imediatamente
- Rotacione todas as credenciais: GitHub tokens, npm, AWS/GCP, chaves SSH
- Audite seus repositórios por atividade não autorizada

De forma geral: considere desativar auto-update para extensões do VSCode ou usar uma ferramenta que impõe um delay antes de instalar versões recém-publicadas.

O GitHub confirmou que dados de clientes não foram afetados. A investigação ainda está em andamento.

Mas a superfície de ataque não vai desaparecer. E o Marketplace não mudou estruturalmente.

A pergunta não é se vai acontecer de novo. É quando.

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/um-funcionario-do-github-estava-com-uma-extensao-d/midia-1.jpg)

