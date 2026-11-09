---
title: "Fazia tempo que eu queria ter um quality gate que eu pudesse rodar localmente e na..."
date: 2026-10-10
description: "Fazia tempo que eu queria ter um quality gate que eu pudesse rodar localmente e na CI sem depender de subir o projeto no SonarQube ou SonarCloud só para..."
tags: [linkedin]
draft: false
---

*Publicado originalmente no [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7507835706581356544/) em 10/10/2026.*

Fazia tempo que eu queria ter um quality gate que eu pudesse rodar localmente e na CI sem depender de subir o projeto no SonarQube ou SonarCloud só para descobrir se alguma coisa passou ou não.

A ideia começou depois de assistir a um vídeo do Lucas Montano: peguei as ideias por trás do que ele mostrou e fui adaptando para o que eu queria usar no dia a dia. No fim, acabou virando outro projeto:

quality-gate ⚙️

A proposta é concentrar em um único gate várias verificações que eu normalmente faria separadas:

• lint;
• testes;
• cobertura com ratchet, para impedir regressão;
• auditoria de vulnerabilidades e licenças;
• secret scan;
• validação de Docker; *depende de outra ferramenta
• diagnóstico de falhas da CI;
• relatório automático nos PRs.

Além do código em si, ele também olha para o estado do PR: checks obrigatórios, conflitos, threads não resolvidas e condição de merge.

Tem dashboard no terminal, suporte a Node.js e Python/uv e um modo que eu particularmente queria bastante: executar o gate em um repositório da empresa sem precisar instalar ou persistir nada dentro dele.

Para análise estática, integrei o SonarJS ao ESLint. Ele ajuda a pegar code smells, complexidade e outros problemas localmente.

Também coloquei um ratchet de cobertura: em vez de simplesmente definir "80% ou falhou", o gate registra o baseline e impede que a cobertura piore. Se subir, o novo valor passa a ser o mínimo esperado.

Dtalhe para quem abrir o repo e rodar o scanner: existem tokens e chaves propositalmente falsos nos testes. Eles estão lá justamente para testar se o secret scan consegue encontrá-los. 😅

Ainda tem coisa que quero evoluir, mas já virou uma ferramenta que consigo usar de verdade em outros projetos.

Repo: https://lnkd.in/dY_Bd7tY


---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/fazia-tempo-que-eu-queria-ter-um-quality-gate-que/midia-1.jpg)

