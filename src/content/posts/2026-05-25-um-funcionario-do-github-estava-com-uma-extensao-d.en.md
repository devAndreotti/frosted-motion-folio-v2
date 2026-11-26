---
title: "Poisoned Nx Console: 11 minutes of auto-update and 3,800 GitHub repositories compromised"
date: 2026-05-25
description: How a malicious npm package in the TanStack ecosystem became a backdoored VS Code extension, and what to do about auto-update, credentials and extensions from now on.
tags: [linkedin, seguranca, supply-chain, vscode, npm, github]
draft: false
source: 2b6e3fef19dd
---

*Originally published on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7464637618132066304/) on 05/25/2026.*

A GitHub employee had a VS Code extension installed with auto-update enabled. In 11 minutes, 3,800 internal repositories were compromised.

It wasn't a zero-day. It wasn't sophisticated social engineering. It was a malicious npm package and a poisoned extension.

## The attack chain

It all started on May 11, a week before the main incident. The TeamPCP group published malicious packages in the TanStack ecosystem on npm, including `@tanstack/zod-adapter`.

An Nx Console contributor ran a routine `pnpm install` and resolved the compromised package. A safeguard that should have blocked freshly published packages was silently ignored by an old pnpm version. The config option was a no-op; it did nothing.

The contributor's GitHub CLI OAuth token was stolen.

Seven days later, that token was used to publish a backdoored version of Nx Console (v18.95.0) to the VS Code Marketplace. The malicious payload was live for 11 to 18 minutes before being pulled. Long enough.

The injected code fetched and ran a 498 KB dropper. Targets: GitHub tokens, npm tokens, AWS/GCP credentials, SSH keys, environment variables. Exfiltration over HTTPS and DNS tunneling.

A GitHub employee with the extension installed and auto-update on was compromised. Result: access to roughly 3,800 internal repositories.

## The structural problem

The VS Code Marketplace has no meaningful security review process. It has no kill switch for versions already installed. It has no way to notify users when an extension they have installed is later found to be malicious.

Auto-update is on by default. Extensions run with broad system permissions. And because they are plain-text interpreted artifacts, traditional EDR tools often fail to detect the malicious behavior.

11 minutes was enough.

## What to do now

If you had Nx Console installed with auto-update on around May 18:

- Update to a clean version immediately
- Rotate every credential: GitHub tokens, npm, AWS/GCP, SSH keys
- Audit your repositories for unauthorized activity

More broadly: consider disabling auto-update for VS Code extensions, or use a tool that enforces a delay before installing freshly published versions.

GitHub confirmed that customer data was not affected. The investigation is still ongoing.

But the attack surface isn't going away. And the Marketplace hasn't changed structurally.

The question isn't whether it will happen again. It's when.

---

### Post media

![Media from the LinkedIn post](/blog/um-funcionario-do-github-estava-com-uma-extensao-d/midia-1.jpg)
