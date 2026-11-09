---
title: I had wanted a quality gate I could run locally and in CI for a while...
date: 2026-10-10
time: "16:19"
description: I had wanted a quality gate I could run locally and in CI for a while, without having to push to SonarQube or SonarCloud just to find out if something passed...
tags: [linkedin]
draft: false
source: 5de3f7fc01d6
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7507835706581356544/) on 10/10/2026.*

I had wanted a quality gate I could run locally and in CI for a while, without having to push to SonarQube or SonarCloud just to find out if something passed or not.

The idea started after watching a video by Lucas Montano: I took the concepts behind what he showed and adapted them to what I wanted to use in my daily routine. In the end, it turned into another project:

quality-gate ⚙️

The proposal is to gather into a single gate several checks that I would normally run separately:

• lint;
• tests;
• coverage with ratchet, to prevent regressions;
• vulnerability and license audit;
• secret scan;
• Docker validation; *depends on another tool
• CI failure diagnosis;
• automated reports on PRs.

Beyond the code itself, it also inspects PR state: required checks, merge conflicts, unresolved threads, and merge readiness.

It has a terminal dashboard, support for Node.js and Python/uv, and a mode I particularly wanted: running the gate on a company repository without installing or persisting anything inside it.

For static analysis, I integrated SonarJS into ESLint. It helps catch code smells, complexity, and other issues locally.

I also added a coverage ratchet: instead of simply defining "80% or fail", the gate records the baseline and prevents coverage from dropping. If it increases, the new value becomes the minimum expected.

A detail for anyone who opens the repo and runs the scanner: there are deliberately fake tokens and keys in the tests. They are there specifically to verify if the secret scanner detects them. 😅

There are still things I want to improve, but it has already become a tool I genuinely use across other projects.

Repo: https://lnkd.in/dY_Bd7tY

---

### Post media

![LinkedIn post media](/blog/fazia-tempo-que-eu-queria-ter-um-quality-gate-que/midia-1.jpg)
