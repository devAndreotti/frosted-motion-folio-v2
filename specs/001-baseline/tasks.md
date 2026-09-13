# Tasks: Linha de Base e Qualidade do Frosted Motion Folio

## Phase 1: Setup & Infraestrutura Compartilhada
- [x] T001 Inicializar Spec-Kit e documentação em .specify/ e docs/spec-kit/
- [x] T002 Integrar diagrama arquitetural com Archify em docs/spec-kit/folio-app.architecture.html
- [x] T003 Configurar script npm run archify no package.json
- [x] T004 Atualizar .gitignore para ignorar artefatos de agentes e credenciais locais

## Phase 2: User Story 1 - Experiência Visual e Interativa de Boas-Vindas (P1)
- [x] T005 [US1] Validar carregamento do Hero e transições de background (tests/smoke.spec.ts)
- [x] T006 [US1] Validar indicador de progresso de scroll e navegação suave (tests/home/navigation.spec.ts)
- [x] T007 [US1] Ajustar BrowserRouter basename para suportar base dinamica de build (src/App.tsx)

## Phase 3: User Story 2 - Personalização de Tema e Idioma (P2)
- [x] T008 [US2] Provedor de temas e detecção de esquema do sistema operacional (src/contexts/ThemeContext.tsx)
- [x] T009 [US2] Provedor de internacionalização pt/en sem dependências externas (src/contexts/LanguageContext.tsx, src/lib/i18n.ts)
- [x] T010 [US2] Testes E2E de alternância de tema e persistência em localStorage (tests/home/theme-toggle.spec.ts)

## Phase 4: User Story 3 - Vitrine de Projetos e Terminal Interativo (P3)
- [x] T011 [US3] Exibição de projetos com card stack e modal de detalhes (src/components/Projects.tsx, src/components/CaseModal.tsx)
- [x] T012 [US3] Terminal sudo interativo com easter eggs e comandos embutidos (src/components/SudoTerminal.tsx)
- [x] T013 [US3] Testes unitários para modais, terminal e catalogo (src/components/*.test.tsx)

## Phase 5: Polimento & Entrega Contínua
- [x] T014 Pipeline de CI com Quality Gate, Lint, Ratchet de cobertura e Playwright E2E
- [x] T015 Deploy automático em GitHub Pages (npm run deploy)
- [x] T016 Deploy em VPS própria via Tailscale (scripts/deploy-vps.ps1) e limpeza de releases