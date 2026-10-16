# Roadmap: melhorias pendentes do site

Este documento detalha o que ainda falta fazer. Nada aqui está implementado: cada item vira um PR próprio quando for a vez dele.

Numeração mantida da lista de ideias original, para facilitar a conversa. O item 16 (painel de estatísticas) é outro projeto e não está neste repositório.

Convenções do projeto que valem para todos os itens:

- Cada arquivo `.ts` ou `.tsx` tem no máximo 300 linhas (`node scripts/quality-gate.cjs check`). Os arquivos de texto `src/lib/i18n.pt.ts` e `src/lib/i18n.en.ts` já estão em 299: texto novo precisa de um arquivo novo ou de compactação.
- A cobertura de testes só pode subir.
- Todo texto novo existe em PT e EN.
- Cores só pelos tokens do tema (`--accent`, `--fg-*`, `--border-*`, `--surface-*`); o site tem 7 tons de destaque e modo claro e escuro.
- Respeitar `prefers-reduced-motion` e, em hover, `@media (hover: hover)`.

## Resumo

| # | Item | Esforço | Depende de | Valor |
|---|---|---|---|---|
| 1 | Página própria para cada projeto | Alto | gerador de páginas estáticas | Alto |
| 2 | Currículo em PDF | Médio | `print.css` atual e geração no CI | Alto |
| 3 | Imagem de compartilhamento por página | Médio | 1 e o gerador de páginas | Alto |
| 6 | Melhorias no blog | Médio | 12 (para "mais lidos") | Médio |
| 7 | Página `/uses` | Baixo | nada | Médio |
| 8 | "Agora" com data e arquivo | Baixo | nada | Médio |
| 10 | Hover dos cards sem "grudar" no toque | Baixo | nada | Médio |
| 11 | GIFs e animações pesadas | Médio | decisão de formato | Alto |
| 12 | Medição de desempenho no CI | Médio | nada | Alto |
| 13 | Auditoria de contraste e acessibilidade | Médio | nada | Alto |
| 14 | Testes visuais automáticos | Médio | nada | Médio |
| 17 | Modo leitura nos posts | Baixo | nada | Baixo |
| 18 | Novidades do site (changelog) | Baixo | nada | Baixo |

Ordem sugerida: ~~10~~ (feito), 12, 13, 14 (base de qualidade, pouco risco) → 11 → 1, 3, 2 (visibilidade) → 6, 7, 8, 17, 18.

---

## 1. Página própria para cada projeto

**Problema.** Hoje o projeto abre num detalhe (`CaseModal`) sem endereço. Não dá para mandar o link de um projeto num processo seletivo, e o Google não indexa cada caso.

**Estado atual.** Os dados vêm de `src/data/projects.ts`, `curatedProjects.ts` e `moreProjects.ts`. O blog já tem um gerador de páginas estáticas em `vite-plugins/blog.ts`, que serve de modelo.

**O que fazer.**
- Dar um `slug` estável a cada projeto (ex.: `starbucks`, `cook-app`) e validar no teste que não repete.
- Rota `/projetos/:slug` com a página do caso: título, descrição, tecnologias, galeria, links (GitHub, site), o que foi feito e o resultado.
- Gerar o HTML estático de cada rota no build (como o blog faz), com `<title>`, `description`, `canonical` e dados estruturados (`CreativeWork`), e incluir as URLs em `sitemap.xml`.
- O detalhe em popup continua; o card passa a ter o link e o popup atualiza o endereço (`history.pushState`) e abre de novo ao abrir a URL direto.
- Manter o foco e o `Esc` do modal; o botão voltar do navegador fecha o popup.

**Pronto quando.**
- Abrir `/projetos/starbucks` direto mostra o caso, em PT e EN.
- O sitemap lista todos os casos e o teste de CSP (`vite-plugins/csp.test.ts`) continua passando.
- E2E: abrir pelo link, abrir pelo card, fechar com voltar.

**Atenção.** O Worker do Cloudflare precisa servir essas rotas estáticas (conferir `wrangler.jsonc` e `public/_headers`).

## 2. Currículo em PDF

**Problema.** O Ctrl+P já gera um currículo limpo (`src/styles/print.css`), mas pouca gente sabe dele e ele sai com 8 páginas.

**O que fazer.**
- Botão "Baixar currículo (PDF)" no Modo recrutador (`RecruiterModal`) e no rodapé, em PT e EN.
- Gerar o PDF no build ou no CI com Playwright (`page.pdf`) a partir de uma rota de impressão dedicada (`/curriculo`, `noindex`), e publicar em `/curriculo-ricardo-andreotti-pt.pdf` e `-en.pdf`.
- Ajustar o CSS de impressão para caber em 1 a 2 páginas: sem galerias, com texto em duas colunas onde fizer sentido, margens de 12 mm e a grade de números dentro da margem (hoje passa uns 4 px).
- Evitar quebra no meio de um bloco (`break-inside: avoid`).

**Pronto quando.**
- O PDF abre com 1 a 2 páginas, com texto selecionável e links clicáveis.
- O arquivo é gerado automaticamente e o link do botão não quebra (teste E2E verifica que responde 200).

## 3. Imagem de compartilhamento por página

**Problema.** Há uma só imagem (`public/og-image.png`) para o site todo. Ao colar um post ou um projeto no LinkedIn, WhatsApp ou Discord, aparece sempre a mesma.

**O que fazer.**
- Gerar uma imagem 1200×630 por página no build: título, subtítulo, foto ou capa e a marca, nos dois idiomas.
- Opções: SVG para PNG no build (satori + resvg) ou captura de um modelo HTML com Playwright. Escolher a mais leve de manter.
- Preencher `og:image`, `og:title`, `og:description` e `twitter:*` por página (posts do blog primeiro, depois os projetos do item 1).
- Fallback para a imagem atual quando algo falhar.

**Pronto quando.**
- Cada post e cada projeto tem sua imagem e as meta tags certas (teste lê o HTML gerado).
- Validado no depurador do LinkedIn e no Open Graph do Facebook.

## 6. Melhorias no blog

**Estado atual.** O blog tem posts em Markdown, busca, curtidas, newsletter e RSS. Há estilos de índice (`.toc`), a confirmar quanto já está pronto.

**O que fazer.**
- Tempo de leitura em cada post e na lista (calculado no build).
- Posts relacionados no fim (mesmas tags, ou os mais próximos).
- Índice lateral fixo em posts longos, com o título atual destacado ao rolar.
- Âncoras em títulos (`#secao`) com botão "copiar link".
- "Mais lidos": exige a medição do item 12 ou um contador próprio; só entra quando houver dado real.
- Paginação ou "carregar mais" quando a lista passar de ~20 posts.

**Pronto quando.** Cada recurso tem teste e aparece em PT e EN; nenhum recurso novo aumenta o JS da lista de forma notável (conferir o tamanho do bundle).

## 7. Página `/uses`

**O que fazer.** Página com as ferramentas do dia a dia: editor, terminal, extensões, hardware, serviços, e o motivo de cada escolha. Dados em `src/data/uses.ts` (lista por categoria), página no padrão do `Privacy.tsx` (usa a barra do blog e a largura de leitura de 880 px). Link no rodapé e no menu do blog.

**Pronto quando.** Está no sitemap, tem `<title>` próprio, funciona em PT e EN e passa na auditoria de contraste do item 13.

## 8. "Agora" com data e arquivo

**Obstáculo conhecido.** O texto "Atualizado em…" precisa existir em PT e EN, mas `i18n.pt.ts` e `i18n.en.ts` já estão em 299 linhas (limite de 300). Antes de fazer este item, dividir os textos por área (por exemplo, `i18n.now.ts`) ou compactar mais blocos.

**Estado atual.** O bloco "Agora" vem de `src/data/now.ts` e inclui o card do Memory Apartment com a TV.

**O que fazer.**
- Campo `updatedAt` visível ("atualizado em 12 de outubro de 2026") e o texto em tom pessoal.
- Página `/agora` com a versão atual e um arquivo das anteriores (cada versão com data), no estilo de nownownow.org.
- Manter o card da TV e a regra de que a TV é o único som do site.

**Pronto quando.** Há ao menos uma versão arquivada, o RSS (opcional) inclui as atualizações e o teste garante que a data mais recente é a exibida.

## 10. Hover dos cards sem "grudar" no toque

**Status: feito no PR #78.** Todas as regras de `:hover` dos cards e linhas foram para dentro de `@media (hover: hover)`, com o foco por teclado separado, e há um teste que impede `:hover` solto em `v2.css`, `blog.css` e `more.css`. Sobrou fora: `memory-tv.css` (botões da TV) e `index.css`.

**Problema.** Os botões já foram padronizados em `src/styles/interactive.css`, mas os cards e linhas ainda usam hover sem `@media (hover: hover)` e podem ficar levantados depois de um toque no celular.

**Onde.** `.nc`, `.blog-feat`, `.teaser-c`, `.tile`, `.chp`, `.tl-ch`, `.dl a`, `.also-i`, `.row`, `.nf-s` (conferir com `grep -n ":hover" src/styles/*.css`).

**O que fazer.** Mover cada regra de hover para `@media (hover: hover)`, deixar o `:focus-visible` igual ao hover, tirar o levantamento sob `prefers-reduced-motion`, e ampliar `src/styles/interactive.test.ts` para cobrir essas classes.

**Pronto quando.** Em emulação de toque, nenhum card muda de estado ao ser tocado, e com mouse e teclado tudo se comporta como hoje.

## 11. GIFs e animações pesadas

**Problema.** Os maiores pesos estão nos repositórios dos projetos, não neste: `powder-gate` tem 11 GIFs (até 14,6 MB), mais 3 WebP animados de cerca de 2 MB; `animated-burger` tem um GIF de 2 MB; `dev-hero-selector` tem um de 5 MB. O PNG `clean-02.png` do `powder-gate` tem 37,8 MB.

**O que fazer.**
- Converter GIFs para MP4/WebM curtos (`ffmpeg`, 24 fps, sem áudio) e usar `<video autoplay muted loop playsinline>`, com poster e `preload="none"` fora da primeira tela.
- WebP animado: reduzir quadros e tamanho, ou trocar por vídeo.
- Trocar o PNG de 37,8 MB por JPEG ou WebP e ajustar as referências no código.
- Neste repositório: conferir que nenhum GIF ou imagem grande é carregado na home (`public/projects/**` já está em WebP leve; confirmar no relatório do item 12).
- Abrir um PR por repositório, sem mexer nas páginas além do necessário.

**Pronto quando.** Cada arquivo trocado tem menos de 1 MB, a aparência é equivalente nas capturas antes e depois, e o comportamento (loop, tamanho, posição) é o mesmo.

## 12. Medição de desempenho no CI

**Estado atual.** O `web-vitals` já está nas dependências e `initWebVitals()` roda no `main.tsx`. Não há medição de Lighthouse no CI.

**O que fazer.**
- Adicionar Lighthouse CI ao workflow (`.github/workflows/quality-gate.yml`) para home, blog, privacidade e 404, mobile e desktop.
- Orçamento: desempenho ≥ 90, acessibilidade ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms. Começar só reportando, depois falhar abaixo do orçamento.
- Comentar os números no PR (a "PR report" já existe).
- Enviar LCP, INP e CLS reais dos visitantes ao Umami, como evento, para ver o campo e não só o laboratório.
- Rodar uma vez por semana contra o site publicado, para pegar regressões de deploy.

**Pronto quando.** Cada PR mostra os números; há uma linha de base registrada no repositório.

## 13. Auditoria de contraste e acessibilidade

**Estado atual.** Já houve problemas reais: borda de aba sumindo no modo claro e abas com pouco contraste.

**O que fazer.**
- Script que calcula a razão de contraste de cada par texto/fundo dos tokens, nos 7 tons de destaque × 2 modos (14 combinações) e falha abaixo de 4,5:1 (3:1 para texto grande e bordas de controles).
- Playwright + `@axe-core/playwright` nas páginas principais, nos dois modos.
- Conferir: foco visível, ordem de tabulação, `aria-*` das abas e do modal, alvos de toque ≥ 44 px, leitor de tela nos diálogos (TV, terminal, detalhe de projeto), `prefers-reduced-motion`.
- Corrigir o que aparecer, com um PR por área.

**Pronto quando.** Zero violações sérias ou críticas no axe e a tabela de contraste está sem falhas.

## 14. Testes visuais automáticos

**Problema.** Quebras de layout (como o ícone de tema fora da borda ou o desenho do "404" empurrado) só apareciam quando alguém olhava.

**O que fazer.**
- Playwright `toHaveScreenshot` para home, blog, privacidade e 404, em 390 e 1280 px, claro e escuro.
- As imagens-base ficam no repositório, geradas no mesmo ambiente do CI (Linux), para evitar diferença de fonte.
- Tolerância baixa (`maxDiffPixelRatio` ~0,01), com animações e relógios congelados (fixar data e hora; o site mostra horário local).
- Comando para atualizar as bases e instrução no README; o relatório mostra o antes e o depois em caso de falha.

**Pronto quando.** O CI passa de forma estável em 5 execuções seguidas e uma mudança proposital de layout é pega.

## 17. Modo leitura nos posts

**O que fazer.** Botão no post que esconde a barra, índice e rodapé, aumenta a fonte (18 a 20 px), limita a linha a ~65 caracteres e guarda a preferência em `localStorage` (dentro de `try/catch`). Sair com o mesmo botão ou `Esc`. Não pode causar salto de layout.

**Pronto quando.** Funciona em PT e EN, com teclado, e os testes cobrem ligar, desligar e lembrar.

## 18. Novidades do site

**O que fazer.** Página `/novidades` e um selo discreto no rodapé ("Novo") com a lista das mudanças visíveis ao visitante, em PT e EN, a partir de um arquivo de dados (`src/data/changelog.ts`) mantido junto com os PRs; opcionalmente alimentar o RSS. Não confundir com o `CHANGELOG.md` do kit de automação, que é interno.

**Pronto quando.** A página lista as entradas por data, o selo some depois de visto (`localStorage`) e um teste garante que as entradas estão ordenadas.
