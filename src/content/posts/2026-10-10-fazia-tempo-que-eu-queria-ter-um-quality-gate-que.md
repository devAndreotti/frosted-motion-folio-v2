---
title: "Quality Gate: Verificações locais e na CI sem depender de SonarCloud"
date: 2026-10-10
time: "16:19"
description: "Auditoria de vulnerabilidades, secret scan, ratchet de cobertura e lint local com SonarJS e Node/uv antes de abrir o PR."
tags: [quality-gate, devops, ci-cd, nodejs, python]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7507835706581356544/) em 10/10/2026.*

Fazia tempo que eu sentia falta de um quality gate que pudesse rodar localmente no meu terminal e na esteira de CI sem depender de subir o código para o SonarQube ou SonarCloud apenas para descobrir se algo quebrou ou se a cobertura caiu.

A ideia nasceu após acompanhar reflexões do Lucas Montano sobre governança e qualidade de software: peguei os conceitos essenciais e adaptei para o meu fluxo diário de desenvolvimento, concentrando tudo em uma CLI rápida e determinística chamada **quality-gate**.

## Por que validar localmente antes da nuvem?

Esperar o feedback da esteira remota consome minutos preciosos e polui o histórico do GitHub com commits de correção trivial (`fix: lint`, `fix: types`). Rodar as mesmas regras no terminal antes do commit elimina idas e vindas desnecessárias:

```bash
# Executa o gate completo no repositório atual
npx quality-gate check --ratchet
```

> O objetivo principal é transformar a qualidade em um contrato reproduzível: o que passa na máquina do desenvolvedor passa rigorosamente na CI.

## Verificações concentradas no pipeline

O gate unifica verificações que tradicionalmente ficam espalhadas em scripts e ferramentas distintas:

- **Linting & Code Smells:** Integração direta com ESLint e regras do SonarJS para detectar complexidade ciclomática e vulnerabilidades estáticas;
- **Bateria de Testes:** Execução paralela dos testes unitários e de integração;
- **Ratchet de Cobertura:** Travamento automático contra regressão de testes;
- **Auditoria de Dependências:** Varredura de CVEs e licenças proibidas em ecossistemas Node.js e Python (`uv`);
- **Secret Scan Determinístico:** Detecção de credenciais, chaves privadas e tokens vazados;
- **Docker Image Gate:** Validação estática de Dockerfile e camadas de build;
- **Relatório de Pull Request:** Geração de sumário formatado em Markdown pronto para o GitHub Actions.

## Como funciona o Ratchet de Cobertura

Definir uma meta estática (como "mínimo de 80%") tem uma falha grave: se a cobertura de um módulo estiver em 95%, alguém pode adicionar 100 linhas sem teste e derrubar para 81% sem que a esteira reclame.

O mecanismo de **ratchet** resolve isso registrando o índice atual como piso obrigatório:

```json
{
  "ratchet": {
    "lines": 94.2,
    "statements": 93.8,
    "functions": 95.0,
    "branches": 91.5
  }
}
```

Se a cobertura subir em um PR, o novo valor passa a ser o patamar mínimo permanente. Se cair mesmo 0.1%, o gate rejeita o merge.

## Execução efêmera para qualquer repositório

Um dos requisitos que eu mais queria era auditar repositórios sem precisar instalar pacotes globais ou criar arquivos de lock permanentes dentro do projeto:

```bash
# Audita repositório alvo em modo efêmero sem alterar arquivos locais
npx quality-gate audit --dir /caminho/do/projeto --strict
```

O gate inspeciona o estado do Pull Request (conflitos pendentes, checks obrigatórios da branch e threads de review não resolvidas) antes de sinalizar aprovação.

*Detalhe para quem clonar o repositório e rodar os testes: existem chaves e tokens propositalmente falsos na suite de testes para validar se o scanner de segredos realmente os intercepta.*

Código open source disponível no [GitHub](https://github.com/devAndreotti/quality-gate).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/fazia-tempo-que-eu-queria-ter-um-quality-gate-que/midia-1.jpg)
