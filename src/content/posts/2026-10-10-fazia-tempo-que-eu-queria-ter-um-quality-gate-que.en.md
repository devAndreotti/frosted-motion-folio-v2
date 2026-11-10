---
title: "Quality Gate: Local and CI checks without relying on SonarCloud"
date: 2026-10-10
time: "16:19"
description: "Vulnerability audits, secret scanning, coverage ratchets and local linting with SonarJS and Node/uv before opening a PR."
tags: [quality-gate, devops, ci-cd, nodejs, python]
draft: false
source: 309eaf73e7e1
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7507835706581356544/) on 10/10/2026.*

For a long time I felt the need for a quality gate that could run locally in my terminal and in CI pipelines without depending on uploading code to SonarQube or SonarCloud just to discover whether something broke or coverage dropped.

The idea came up after watching software governance discussions by Lucas Montano: I took the core concepts and adapted them to my daily development workflow, consolidating everything into a fast and deterministic CLI called **quality-gate**.

## Why validate locally before the cloud?

Waiting for remote CI feedback burns precious minutes and pollutes git commit history with trivial fixups (`fix: lint`, `fix: types`). Running the same rules directly in the terminal before committing eliminates unnecessary round trips:

```bash
# Executa o gate completo no repositório atual
npx quality-gate check --ratchet
```

> The main goal is turning software quality into a reproducible contract: whatever passes on the developer machine passes strictly in CI.

## Concentrated pipeline checks

The gate unifies checks that traditionally stay scattered across separate tools and ad-hoc scripts:

- **Linting & Code Smells:** Direct integration with ESLint and SonarJS rules to catch cyclomatic complexity and static vulnerabilities;
- **Test Battery:** Parallel execution of unit and integration test suites;
- **Coverage Ratchet:** Automated protection against test coverage regression;
- **Dependency Audit:** Scanning for CVEs and prohibited licenses in Node.js and Python (`uv`) ecosystems;
- **Deterministic Secret Scan:** Detection of leaked credentials, private keys and tokens;
- **Docker Image Gate:** Static validation of Dockerfile syntax and build layers;
- **Pull Request Report:** Automatic formatted Markdown summary ready for GitHub Actions.

## How the Coverage Ratchet works

Setting a static coverage threshold (such as "minimum 80%") carries a major flaw: if a module has 95% coverage, someone could add 100 untested lines and drop it down to 81% without the pipeline complaining.

The **ratchet** mechanism solves this by locking the current coverage index as the mandatory floor:

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

If coverage increases in a PR, the new value becomes the permanent minimum threshold. If it drops even 0.1%, the gate rejects the merge.

## Ephemeral execution for any repository

One of the requirements I wanted most was auditing repositories without having to install global packages or persist configuration lock files inside target projects:

```bash
# Audita repositório alvo em modo efêmero sem alterar arquivos locais
npx quality-gate audit --dir /caminho/do/projeto --strict
```

The gate inspects Pull Request state (pending merge conflicts, required branch checks and unresolved review threads) before signaling approval.

*A note for anyone cloning the repository and running tests: there are deliberately fake keys and tokens in the test suite to verify whether the secret scanner accurately catches them.*

Open source code available on [GitHub](https://github.com/devAndreotti/quality-gate).

---

### Mídia da publicação

![Mídia do post no LinkedIn](/blog/fazia-tempo-que-eu-queria-ter-um-quality-gate-que/midia-1.jpg)
