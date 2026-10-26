# Feature Specification: Otimização de LCP, Lazy Load do Terminal e Racionalização de CI

**Feature Branch**: `perf/lcp-terminal-ci`
**Created**: 2026-10-26
**Status**: Draft / Ready for Implementation
**Input**: Recomendações pós-auditoria de performance e qualidade no portfólio (/home/ubuntu/projects/repos/frosted-motion-folio-v2).

## User Scenarios & Testing

### User Story 1 - Aceleração do LCP com Pré-Carregamento da Imagem do Hero (Priority: P1)
O visitante acessa o portfólio e tem a imagem principal do Hero (`./profile/black.webp`) renderizada imediatamente sem bloqueio pelo ciclo de hidratação do React.

**Why this priority**: A imagem do autor no Hero é o elemento candidato a Largest Contentful Paint (LCP) na primeira dobra. Carregá-la tardiamente degrada a pontuação no Core Web Vitals e Lighthouse.
**Independent Test**: Inspeção do DOM inicial em `index.html` e auditoria Lighthouse confirmando LCP < 1.8s.

**Acceptance Scenarios**:
1. **Given** visitante carregando a página inicial, **When** o navegador analisa o `<head>`, **Then** encontra `<link rel="preload" as="image" href="./profile/black.webp" type="image/webp" fetchpriority="high">` e dispara o download antes da execução dos scripts.

---

### User Story 2 - Segregação e Lazy Loading do SudoTerminal (Priority: P2)
O visitante comum navega no portfólio sem carregar os 13 kB de código do terminal interativo (`SudoTerminal`), que passa a ser carregado sob demanda apenas quando ativado.

**Why this priority**: O terminal é um easter egg e ferramenta exploratória usado por uma minoria dos visitantes. Mantê-lo no bundle de navegação inicial é desperdício de bytes e parse de JS.
**Independent Test**: Execução de `npm run build` confirmando que `SudoTerminal` gera um chunk assíncrono separado e não integra o chunk principal de navegação.

**Acceptance Scenarios**:
1. **Given** carregamento inicial da aplicação, **When** a barra de navegação (`Navigation.tsx`) é montada, **Then** o `SudoTerminal` é importado via `lazy()` com `<Suspense fallback={null}>`.
2. **Given** usuário disparando o atalho `sudo` ou o glitch no logo, **When** o terminal é acionado, **Then** o componente monta e exibe o prompt interativo sem erros de foco ou layout.

---

### User Story 3 - Racionalização de Viewports na Suíte E2E do Playwright (Priority: P3)
A equipe e o pipeline de CI executam a suíte E2E em menos de 3 minutos, mantendo a cobertura de todos os breakpoints CSS críticos sem redundância de viewports quase idênticos.

**Why this priority**: A matriz de 12 projetos (9 viewports com diferenças mínimas como 390x844 vs 430x932 + 3 devices) estende o tempo de execução para quase 6 minutos por commit, retardando o ciclo de desenvolvimento.
**Independent Test**: Execução de `npx playwright test` verificando passagem dos testes de layout e tempo total reduzido em mais de 50%.

**Acceptance Scenarios**:
1. **Given** execução do job de E2E no CI, **When** os testes em `tests/responsive/` rodam, **Then** cobrem os 4 breakpoints fundamentais (Mobile 360x800, Tablet 768x1024, Laptop 1280x720, Desktop 1920x1080) e 1 preset de dispositivo touch (`device-pixel7`).
2. **Given** as 4 viewports selecionadas, **When** o teste `no-overflow.spec.ts` é executado, **Then** nenhum transbordamento horizontal ou quebra de navegação passa despercebido.

## Requisitos Não-Funcionais
- **Lighthouse Performance Score**: Manter >= 95 no relatório de PR.
- **Tamanho do Chunk Inicial**: Redução adicional no bundle inicial de navegação.
- **Tempo de Execução do CI**: Redução do job de E2E de ~5m50s para <= 2m30s.
- **Regra de 300 Linhas**: Todos os arquivos mantidos rigorosamente dentro do limite de linhas.
