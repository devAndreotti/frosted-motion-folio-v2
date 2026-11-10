---
title: "Portfólio v2: Glassmorfismo, automações com IA e infraestrutura própria"
date: 2026-10-26
time: "16:19"
description: "Como construí a nova versão do portfólio unindo design tokens adaptativos, tradução autônoma com Hermes, terminal interativo e edge na Cloudflare."
tags: [react, tailwind, automacao, cloudflare, hermes]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7518270888371445761/) em 26/10/2026.*

Sempre gostei de interfaces com profundidade, camadas de vidro fosco (*frosted glass*), iluminação física e transições suaves. Para a nova versão do meu portfólio, decidi transformar essa identidade visual em um projeto de engenharia completo, unindo front-end moderno, automações inteligentes e infraestrutura própria.

## Muito além de uma vitrine estática

Em vez de criar uma página convencional de links, o objetivo foi construir um espaço interativo com personalidade técnica evidente logo no primeiro carregamento:

> Um bom portfólio deve ser a prova viva das habilidades que ele anuncia: se você constrói sistemas e interfaces, o próprio site precisa demonstrar isso em cada detalhe.

A stack une React 19, Vite, Tailwind CSS com design tokens em OKLCH, animações com Motion e Three.js para o hardware 3D no Hero.

## O Terminal interativo Sudo

No canto superior da interface, os visitantes podem abrir um terminal real embutido para explorar a stack, atalhos e dados públicos do projeto diretamente via linha de comando:

```bash
# Comandos públicos disponíveis no terminal embutido
sudo help
sudo stack
sudo projetos
```

O terminal suporta navegação por histórico (setas para cima/baixo), autocompletar e respostas localizadas em português e inglês.

## Pipeline autônomo com agentes Hermes

A gestão de conteúdo não depende de painéis pesados de CMS:

- **Publicação via Git:** Cada artigo do blog é um arquivo Markdown tipado versionado no repositório;
- **Tradução com Agentes:** Um cronjob local do **Hermes Agent** detecta novos posts publicados em português, gera a versão correspondente em inglês e submete um Pull Request com validação estrita de estrutura (*AST shape match*);
- **Rich Snippets Automáticos:** Geração de JSON-LD com Schema.org `BlogPosting` para indexação em buscadores;
- **Modo Leitura Zen:** Alternância para visualização sem distrações em coluna única com atalho `<kbd>Esc</kbd>`.

## Infraestrutura híbrida: Cloudflare e VPS Oracle

A distribuição combina o melhor de dois mundos:

- **Edge na Cloudflare:** Distribuição global com latência mínima para os assets estáticos do portfólio;
- **Serviços na VPS Oracle:** O gerenciador de newsletter, coleta de métricas e orquestração de rotinas rodam em containers isolados no meu servidor Linux pessoal.

O código-fonte completo está aberto no [GitHub](https://github.com/devAndreotti/frosted-motion-folio-v2).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/meu-portfolio-ganhou-uma-nova-versao-e-tem-alguns/midia-1.jpg)
