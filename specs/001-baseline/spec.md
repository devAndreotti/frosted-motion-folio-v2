# Feature Specification: Linha de Base e Qualidade do Frosted Motion Folio

**Feature Branch**: eat/infra-speckit-archify
**Created**: 2026-09-12
**Status**: Approved
**Input**: Requisitos de portfólio interativo moderno, responsivo, animado com Framer Motion e com qualidade auditada.

## User Scenarios & Testing

### User Story 1 - Experiência Visual e Interativa de Boas-Vindas (Priority: P1)
O visitante acessa o portfólio para conhecer os projetos e competências de Ricardo Andreotti com transições fluidas e efeito frosted glass.

**Why this priority**: É a porta de entrada e identidade visual profissional do desenvolvedor.
**Independent Test**: Carregamento da página inicial (	ests/smoke.spec.ts) valida renderização do Hero, navegação e background layers.

**Acceptance Scenarios**:
1. **Given** visitante no desktop ou mobile, **When** abre a URL raiz, **Then** visualiza o Hero com animação suave e menu navegável.
2. **Given** visitante rolando a página, **When** atinge seções específicas, **Then** a barra de progresso e o indicador de navegação refletem a seção ativa.

---

### User Story 2 - Personalização de Tema e Idioma (Priority: P2)
O visitante alterna entre temas claro/escuro, escolhe cores de destaque e troca o idioma entre Português e Inglês com persistência local.

**Why this priority**: Acessibilidade e alcance internacional para recrutadores e clientes.
**Independent Test**: Testes E2E em 	ests/home/theme-toggle.spec.ts cobrem alternância, detecção de preferências do OS e persistência em localStorage.

**Acceptance Scenarios**:
1. **Given** tema padrão do sistema, **When** clica no alternador de tema, **Then** a classe dark é aplicada/removida e salva no localStorage.
2. **Given** paleta de cores, **When** seleciona um swatch de cor, **Then** as variáveis CSS de destaque (--accent) mudam imediatamente.
3. **Given** idioma em PT, **When** clica no seletor de idioma, **Then** todas as seções atualizam os textos para EN sem recarregar a página.

---

### User Story 3 - Vitrine de Projetos e Terminal Interativo (Priority: P3)
O visitante explora projetos selecionados com detalhes técnicos, links externos e pode executar comandos no terminal de desenvolvedor (sudo terminal).

**Why this priority**: Prova de competência técnica e elemento lúdico e diferenciador.
**Independent Test**: Testes unitários em CaseModal.test.tsx, Projects.test.tsx e SudoTerminal.test.tsx.

**Acceptance Scenarios**:
1. **Given** lista de projetos, **When** clica em um card, **Then** o modal de detalhes abre com captura de foco (focus trap) e tecla Escape funcional.
2. **Given** navegação no site, **When** digita o atalho 'sudo', **Then** o terminal embutido abre permitindo comandos como help, skills e easter eggs.

## Requisitos Não-Funcionais
- **Performance**: Monitoramento com Web Vitals e renderização sob demanda.
- **Tamanho de Arquivo**: Máximo de 300 linhas por arquivo conforme .quality-gate/policy.json.
- **Cobertura de Código**: Ratchet estrito impedindo regressão de testes unitários.
- **Alvos de Deploy**: GitHub Pages (/frosted-motion-folio-v2/) e VPS (/).
