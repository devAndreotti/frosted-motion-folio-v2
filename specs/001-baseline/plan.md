# Implementation Plan: Linha de Base e Qualidade do Frosted Motion Folio

**Branch**: main | **Date**: 2026-09-12 | **Spec**: spec.md

## Summary
Estabelecer a linha de base de código, arquitetura, qualidade e pipeline do portfólio React 18 SPA com estética frosted glass, internacionalização leve em TypeScript puro, alternância dinâmica de temas e cores, e duplo alvo de publicação.

## Technical Context
- Language/Version: TypeScript 5.5+, React 18.3.1, Node.js >= 18
- Primary Dependencies: Vite 5.4, Framer Motion 12.23, Tailwind CSS 3.4, Lucide React, boneyard-js
- Testing: Vitest 3.2 (unitários com v8 coverage) e Playwright 1.62 (E2E e responsividade em 9 viewports)
- Storage: localStorage para tema e idioma
- Constraints: Limite de 300 linhas por arquivo (.quality-gate/policy.json) e ratchet de cobertura estrito

## Project Structure
src/ (bones, components, contexts, data, hooks, lib, pages)
tests/ (home, responsive, smoke.spec.ts)
docs/spec-kit/ (diagramas arquiteturais Archify)