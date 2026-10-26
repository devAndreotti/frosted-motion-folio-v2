# Tasks: Otimização de Performance, Motion e Quality Gate

## Phase 1: Render & Motion Performance (P1)
- [ ] T001 Adicionar `<MotionConfig reducedMotion="user">` na raiz da aplicação (`src/App.tsx`)
- [ ] T002 Implementar regra universal de `@media (prefers-reduced-motion: reduce)` no `src/index.css`
- [ ] T003 Otimizar `CardStack.tsx`: remover multi-blur dos cartões de fundo (`depth > 0`) em telas móveis
- [ ] T004 Refatorar `ScrollProgress.tsx` para usar `useScroll()` + `scaleX` com aceleração de GPU
- [ ] T005 Refatorar `Header.tsx` para evitar re-render no mousemove (eliminar `setParallax`/`setMagnet` no estado React)
- [ ] T006 Corrigir `Navigation.tsx`: adicionar `<AnimatePresence>` e substituir animação de `height: 'auto'`
- [ ] T007 Adequar `Marquee.tsx`: cancelar loop rAF quando `prefers-reduced-motion` estiver ativo

## Phase 2: Bundle Size & Code Splitting (P2)
- [ ] T008 Configurar `manualChunks` no `vite.config.ts` (`vendor-react`, `vendor-motion`, `vendor-boneyard`)
- [ ] T009 Implementar `React.lazy` para `CaseModal` em `src/components/Projects.tsx`
- [ ] T010 Implementar `React.lazy` para `SudoTerminal` em `src/components/Navigation.tsx`
- [ ] T011 Executar `npm run build` e validar redução do chunk principal para <= 130 kB

## Phase 3: Quality Gate & Testes E2E (P3)
- [ ] T012 Adicionar mock com `page.route()` no teste E2E `tests/home/github-activity.spec.ts`
- [ ] T013 Otimizar ambientes no `vitest.config.ts` para testes rápidos
- [ ] T014 Ajustar `sonar.tests` e inclusões no `sonar-project.properties`
- [ ] T015 Executar suíte de testes unitários com ratchet (`node scripts/quality-gate.cjs check`)

## Phase 4: Validação & PR
- [ ] T016 Rodar linter (`npm run lint`) e build de produção
- [ ] T017 Criar branch `perf/motion-bundle-quality`, commitar e abrir Pull Request via `gh pr create`
- [ ] T018 Iniciar workflow `babysit-pr` para monitorar Playwright headless e checagens de CI até aprovação total
