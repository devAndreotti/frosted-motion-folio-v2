# Feature Specification: Otimização de Performance, Motion e Quality Gate

**Feature Branch**: `perf/motion-bundle-quality`
**Created**: 2026-10-26
**Status**: Draft / Ready for Review
**Input**: Auditoria técnica validada do portfólio (/home/ubuntu/projects/repos/frosted-motion-folio-v2) com foco em 60fps mobile, code splitting e robustez de testes.

## User Scenarios & Testing

### User Story 1 - Fluidez de Renderização e Suporte Estrito a Redução de Movimento (Priority: P1)
O visitante acessa o portfólio em dispositivo móvel ou com preferência de movimento reduzido ativada no sistema, experimentando interface estável a 60fps sem sobrecarga de GPU e respeitando preferências de acessibilidade.

**Why this priority**: Evita gargalos de hardware em dispositivos móveis (overdraw por multi-camada de blur) e atende WCAG 2.2.2 e 2.3.3.
**Independent Test**:
- Carregamento e rolagem em emulação mobile 360x800 sem layout thrashing ou jank.
- Teste E2E com `prefers-reduced-motion: reduce` verificando interrupção de loops contínuos (Marquee) e supressão de molas.

**Acceptance Scenarios**:
1. **Given** navegação em dispositivo móvel (largura <= 768px), **When** o `CardStack` é renderizado, **Then** apenas o cartão frontal (`depth === 0`) aplica `backdrop-filter`, enquanto cartões de fundo usam `var(--surface-2)` opaco.
2. **Given** SO com `prefers-reduced-motion: reduce`, **When** a página é carregada, **Then** `<MotionConfig reducedMotion="user">` suprime molas do Framer Motion e o loop rAF do `Marquee` é pausado.
3. **Given** rolagem da página, **When** `ScrollProgress` é atualizado, **Then** a barra anima via aceleração de hardware (`transform: scaleX`) sem alterar geometria (`width`).
4. **Given** movimento do cursor no Hero, **When** `handleHeroMove` / `handleMagnetMove` disparam, **Then** posições atualizam via compositor (`useMotionValue` ou CSS variables) sem re-renderizar a árvore React do `Header`.
5. **Given** abertura e fechamento do menu mobile em `Navigation.tsx`, **When** o estado alterna, **Then** transiciona opacidade/escala com `AnimatePresence` sem interpolar `height: 'auto'`.

---

### User Story 2 - Otimização de Bundle e Code Splitting (Priority: P2)
O visitante carrega a aplicação com tempo mínimo de bloqueio (TBT) e menor Largest Contentful Paint (LCP) através de chunks segregados e carregamento sob demanda de componentes secundários.

**Why this priority**: Bundle inicial monolítico de ~420 kB retarda hidratação e execução inicial em conexões 4G/móveis.
**Independent Test**: Execução de `npm run build` gerando chunk de aplicação <= 130 kB e chunks de fornecedores separados para cache HTTP.

**Acceptance Scenarios**:
1. **Given** build de produção, **When** o Vite processa as dependências, **Then** `vendor-react` e `vendor-motion` são emitidos em chunks isolados via `manualChunks`.
2. **Given** carregamento inicial da página inicial, **When** o modal de detalhes do projeto (`CaseModal`) e o terminal (`SudoTerminal`) não foram solicitados, **Then** seus códigos não são incluídos no bundle inicial (importados via `React.lazy`).

---

### User Story 3 - Confiabilidade da Suíte de Testes e Quality Gate (Priority: P3)
O desenvolvedor ou pipeline de CI executa os testes unitários e de integração rapidamente sem flakiness causado por APIs externas ou sobrecarga de ambiente jsdom.

**Why this priority**: Evita falso-positivo no CI por rate-limiting da API do GitHub e acelera feedback local.
**Independent Test**: Execução de `npm run test` e `npx playwright test tests/home/github-activity.spec.ts`.

**Acceptance Scenarios**:
1. **Given** teste E2E do feed de atividades do GitHub, **When** o teste carrega a página, **Then** intercepta chamadas à API (`page.route()`) com resposta simulada previsível sem esgotar cota unauthenticated.
2. **Given** suíte Vitest, **When** executados testes unitários matemáticos e de dados (`radar`, `i18n`, `cardStack`), **Then** o ambiente é executado sem overhead desnecessário de DOM global.

## Requisitos Não-Funcionais
- **Orçamento de Performance**: Chunk principal da aplicação <= 130 kB.
- **Taxa de Quadros**: 60fps constante em interações móveis.
- **Acessibilidade**: 100% de conformidade com WCAG 2.2.2 para elementos animados.
- **Quality Gate Ratchet**: Não regressar as métricas de cobertura de código estabelecidas em `scripts/baseline.json`.
- **Limite de Arquivos**: Nenhum arquivo modificado pode ultrapassar 300 linhas de código (.quality-gate/policy.json).
