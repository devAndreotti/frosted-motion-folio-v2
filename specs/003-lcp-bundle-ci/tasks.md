# Tasks: Otimização de LCP, Lazy Load do Terminal e Racionalização de CI

## Phase 1: Código & Assets (P1 & P2)
- [x] T001 Adicionar preload de `./profile/black.webp` com `fetchpriority="high"` no `<head>` de `index.html`
- [x] T002 Refatorar `src/components/Navigation.tsx` para importar `SudoTerminal` via `React.lazy` com `<Suspense fallback={null}>`
- [x] T003 Executar `npm run build` e verificar extração do chunk assíncrono `SudoTerminal-*.js`

## Phase 2: Pipeline de Testes (P3)
- [x] T004 Atualizar `RESPONSIVE_VIEWPORTS` em `playwright.config.ts` mantendo os 4 breakpoints chave (1920x1080, 1280x720, 768x1024, 360x800)
- [x] T005 Racionalizar projetos de devices no `playwright.config.ts`, mantendo `device-pixel7`
- [x] T006 Validar sintaxe e tipagem com `npx tsc --noEmit` e `npm run lint`

## Phase 3: Validação Local & Quality Gate
- [x] T007 Executar suíte de testes com ratchet (`node scripts/quality-gate.cjs check`)
- [x] T008 Conferir limite de 300 linhas nos arquivos alterados

## Phase 4: Git, PR & Babysit
- [ ] T009 Criar branch `perf/lcp-terminal-ci`, commitar alterações e subir para origin
- [ ] T010 Abrir PR via `gh pr create`
- [ ] T011 Acionar rotina `babysit-pr` monitorando o CI no GitHub Actions até aprovação total
