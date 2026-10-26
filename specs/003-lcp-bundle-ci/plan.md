# Implementation Plan: Otimização de LCP, Lazy Load do Terminal e Racionalização de CI

**Branch**: `perf/lcp-terminal-ci` | **Date**: 2026-10-26 | **Spec**: spec.md

## Summary
Implementar preload estrito do asset LCP no `<head>`, segregação assíncrona do `SudoTerminal` via `React.lazy` na navegação e racionalização de viewports redundantes na configuração do Playwright.

## Technical Context
- Language/Version: TypeScript 5.6+, React 19 / 18 SPA, Node.js 22
- Bundler: Vite 6.4.4, Rollup
- Testing: Playwright 1.64.0 (E2E e Responsividade)
- Target: `index.html`, `src/components/Navigation.tsx`, `playwright.config.ts`
- Constraints: Limite de 300 linhas por arquivo (.quality-gate/policy.json), ratchet sem regressão

## Architecture & Code Changes

### 1. Preload de LCP (`index.html`)
- Localização: `<head>` após meta tags de SEO e ícones.
- Código:
  ```html
  <!-- Preload da foto de abertura no Hero para acelerar LCP -->
  <link rel="preload" as="image" href="./profile/black.webp" type="image/webp" fetchpriority="high" />
  ```
- Justificativa: Evita aguardar o download do bundle JS e execução do React para iniciar a busca da imagem principal da primeira dobra.

### 2. Lazy Loading do SudoTerminal (`src/components/Navigation.tsx`)
- Substituir:
  ```typescript
  import SudoTerminal from './SudoTerminal';
  ```
  Por:
  ```typescript
  import { lazy, Suspense } from 'react';
  const SudoTerminal = lazy(() => import('./SudoTerminal'));
  ```
- Renderizar com `<Suspense fallback={null}><SudoTerminal /></Suspense>`.
- Justificativa: Isola o terminal (~13 kB), `SudoHire` e metadados de comandos em um chunk autônomo sob demanda, reduzindo o custo de hidratação do cabeçalho.

### 3. Racionalização de Viewports no Playwright (`playwright.config.ts`)
- Reduzir `RESPONSIVE_VIEWPORTS` de 9 entradas para os 4 breakpoints de referência do Tailwind:
  1. `vp-1920x1080` (Desktop widescreen / full HD)
  2. `vp-1280x720` (Laptop / desktop padrão)
  3. `vp-768x1024` (Tablet iPad vertical)
  4. `vp-360x800` (Mobile Android médio / target mínimo)
- Dispositivos: Manter `device-pixel7` para validação de toques/touch targets reais e desativar presets duplicados que testam a mesma geometria.
- Justificativa: Reduz de 12 para 5 projetos na suíte responsiva (~58% menos tempo de execução) sem comprometer a detecção de overflow.

## Verification & Rollback
- Build: `npm run build` deve gerar novo chunk `SudoTerminal-*.js` separado.
- Lint/Typecheck: `npm run lint` e `npx tsc --noEmit` devem passar com 0 erros.
- Tests & Ratchet: `npm run test` e `node scripts/quality-gate.cjs check`.
- Playwright: `npx playwright test` cobrindo responsive specs.
- Rollback: Reverter commit ou descartar branch `perf/lcp-terminal-ci`.
