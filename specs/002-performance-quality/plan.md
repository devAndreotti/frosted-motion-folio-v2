# Implementation Plan: Otimização de Performance, Motion e Quality Gate

**Branch**: `perf/motion-bundle-quality` | **Date**: 2026-10-26 | **Spec**: spec.md

## Summary
Refatorar componentes críticos de renderização, suporte a `prefers-reduced-motion`, arquitetura de empacotamento com Vite `manualChunks` e lazy loading de modais, além de isolamento determinístico de testes Playwright/Vitest.

## Technical Context
- Language/Version: TypeScript 5.5+, React 18.3.1, Node.js >= 18
- Build/Bundler: Vite 5.4.10, `@vitejs/plugin-react-swc`, Rollup
- Animation/Motion: Framer Motion 12.23 (MotionConfig, useScroll, useMotionValue)
- Styles: Tailwind CSS 3.4, CSS Variables, `backdrop-filter`
- Testing: Vitest 3.2 (v8 coverage), Playwright 1.62
- Constraints: Limite de 300 linhas por arquivo (.quality-gate/policy.json), cobertura ratchet sem regressão

## Architecture & Code Changes

### 1. Motion & Render Performance (`src/`)
- `src/App.tsx`: Envolver raiz com `<MotionConfig reducedMotion="user">`.
- `src/index.css`:
  - Adicionar regra de supressão global em `@media (prefers-reduced-motion: reduce)`.
  - Desativar `backdrop-filter` em `.glass-card-bg` / cartões traseiros em telas móveis (`@media (max-width: 768px)`).
- `src/components/CardStack.tsx`:
  - Condicionar aplicação de `.glass-strong` apenas ao cartão frontal (`depth === 0`) ou desativar blur em telas <= 768px para profundidades maiores.
- `src/components/ScrollProgress.tsx`:
  - Substituir `useState` e listener nativo por `useScroll()` da Framer Motion + `style={{ scaleX: scrollYProgress }}`.
- `src/components/Header.tsx`:
  - Substituir estado local no mousemove por CSS variables no elemento raiz ou `useMotionValue`.
- `src/components/Navigation.tsx`:
  - Envolver menu mobile em `<AnimatePresence>` e remover interpolação de `height: 'auto'`.
- `src/components/Marquee.tsx`:
  - Consultar `useReducedMotion()` e pausar loop rAF quando ativo.

### 2. Bundle Size & Code Splitting
- `vite.config.ts`:
  - Adicionar `rollupOptions.output.manualChunks` segregando `vendor-react`, `vendor-motion`, `vendor-boneyard`, `vendor-others`.
- `src/components/Projects.tsx`:
  - Migrar `CaseModal` para `React.lazy` com `<Suspense fallback={null}>`.
- `src/components/Navigation.tsx`:
  - Migrar `SudoTerminal` para `React.lazy` disparado apenas quando necessário.

### 3. Testes & Quality Gate
- `tests/home/github-activity.spec.ts`:
  - Adicionar interceptação `page.route('**/api.github.com/**', ...)` com payload fixture estável.
- `vitest.config.ts`:
  - Configurar execução otimizada de ambiente e verificar cobertura sem gargalo.
- `sonar-project.properties`:
  - Ajustar caminhos de testes para `tests,src` com exclusões apropriadas.

## Verification & Rollback
- Build: `npm run build` deve gerar chunk da aplicação <= 130 kB e passar sem erros.
- Lint/Typecheck: `npm run lint` e validação estática.
- Unit Tests: `npm run test` com ratchet aprovado (`node scripts/quality-gate.cjs check`).
- E2E Tests: `npx playwright test` em headless.
- Rollback: Reverter commit na branch dedicada `perf/motion-bundle-quality`.
