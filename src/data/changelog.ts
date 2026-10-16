import type { Localized } from '@/lib/i18n';

/** One visible change on the site. Newest first; several can share a date. */
export interface ChangelogEntry {
  id: string;
  /** ISO date (YYYY-MM-DD) the change went live. */
  date: string;
  title: Localized<string>;
  text: Localized<string>;
}

// Only what a visitor can see or use, taken from the merged PRs on main (no CI, deps or refactors).
// Add the new entries here in the same PR that makes the change.
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: 'privacidade-novo-desenho',
    date: '2026-10-16',
    title: { pt: 'Privacidade com desenho novo', en: 'Privacy page redesigned' },
    text: {
      pt: 'A página de privacidade ganhou um desenho novo, com os números e as regras de dados em linguagem simples.',
      en: 'The privacy page has a new layout, with the numbers and the data rules in plain language.',
    },
  },
  {
    id: 'modo-leve',
    date: '2026-10-16',
    title: { pt: 'Modo leve', en: 'Lite mode' },
    text: {
      pt: 'Com economia de dados ativa ou bateria abaixo de 20%, o site carrega uma versão mais leve, sem efeitos de vidro.',
      en: 'With data saver on or battery below 20%, the site loads a lighter version, without the glass effects.',
    },
  },
  {
    id: 'agora-tv',
    date: '2026-10-16',
    title: { pt: 'TV do Memory Apartment na seção Agora', en: 'Memory Apartment TV in Now' },
    text: {
      pt: 'No card do Memory Apartment, uma TV interativa abre no lugar do site, e a seção Agora mostra a data da última revisão.',
      en: 'On the Memory Apartment card, an interactive TV opens in place of the site, and Now shows its last review date.',
    },
  },
  {
    id: 'pagina-404-jogo',
    date: '2026-10-16',
    title: { pt: 'Página 404 com um jogo', en: '404 page with a game' },
    text: {
      pt: 'A página de endereço inexistente ganhou um jogo: desvie dos bugs, com vidas, café e ondas.',
      en: 'The page for missing addresses has a game now: dodge the bugs, with lives, coffee and waves.',
    },
  },
  {
    id: 'navegacao-e-tema-claro',
    date: '2026-10-16',
    title: { pt: 'Navegação e tema claro', en: 'Navigation and light theme' },
    text: {
      pt: 'A barra de navegação tem o mesmo tamanho em todas as páginas. No tema claro, o fundo ficou contínuo e as abas inativas, mais legíveis.',
      en: 'The navigation bar is the same size on every page. In the light theme, the background is continuous and the inactive tabs are easier to read.',
    },
  },
  {
    id: 'hover-so-com-mouse',
    date: '2026-10-16',
    title: { pt: 'Hover só com mouse', en: 'Hover only with a mouse' },
    text: {
      pt: 'Botões, cards e linhas ganharam o mesmo estado de foco e de toque. O efeito de hover só aparece em aparelhos com mouse.',
      en: 'Buttons, cards and rows share the same focus and press states. The hover effect only shows on devices with a mouse.',
    },
  },
  {
    id: 'newsletter-confirmacao',
    date: '2026-10-15',
    title: { pt: 'Newsletter com confirmação', en: 'Newsletter with confirmation' },
    text: {
      pt: 'A inscrição na newsletter pede a confirmação por e-mail. O formulário mostra o idioma e avisa o que acontece depois.',
      en: 'Newsletter sign-up asks for confirmation by email. The form shows the language and says what happens next.',
    },
  },
  {
    id: 'blog-ingles-e-curtidas',
    date: '2026-10-15',
    title: { pt: 'Blog em inglês e curtidas', en: 'English blog and likes' },
    text: {
      pt: 'Os posts ganharam versão em inglês, traduzida e conferida antes de publicar. Dá para curtir um post sem criar conta.',
      en: 'Posts now have an English version, translated and checked before publishing. You can like a post without an account.',
    },
  },
  {
    id: 'projetos-fotos',
    date: '2026-10-15',
    title: { pt: 'Fotos dos projetos', en: 'Project photos' },
    text: {
      pt: 'Quinze projetos menores ganharam foto na galeria "Outros projetos". As fotos têm carrossel no modal e carregam mais leve.',
      en: 'Fifteen smaller projects got a photo in the "Other projects" gallery. The photos have a carousel in the modal and load lighter.',
    },
  },
  {
    id: 'paginas-de-erro',
    date: '2026-10-13',
    title: { pt: 'Páginas de erro', en: 'Error pages' },
    text: {
      pt: 'Páginas novas para endereço inexistente e para site fora do ar, em português e em inglês.',
      en: 'New pages for missing addresses and for the site being down, in Portuguese and English.',
    },
  },
  {
    id: 'agora-icones',
    date: '2026-10-13',
    title: { pt: 'Agora com cards novos', en: 'Now with new cards' },
    text: {
      pt: 'A seção Agora ganhou ícones novos e cards de projetos em andamento.',
      en: 'The Now section has new icons and cards for projects in progress.',
    },
  },
  {
    id: 'trajetoria-em-capitulos',
    date: '2026-10-10',
    title: { pt: 'Trajetória em capítulos', en: 'Journey in chapters' },
    text: {
      pt: 'A trajetória foi dividida em capítulos, com ajustes para telas pequenas e um favicon com as iniciais RA.',
      en: 'The journey is split into chapters, with fixes for small screens and a favicon with the RA initials.',
    },
  },
  {
    id: 'contatos-instagram-x',
    date: '2026-10-09',
    title: { pt: 'Instagram e X nos contatos', en: 'Instagram and X in contacts' },
    text: {
      pt: 'Instagram e X entraram na lista de contatos diretos, junto com GitHub, LinkedIn e e-mail.',
      en: 'Instagram and X joined the direct contacts, next to GitHub, LinkedIn and email.',
    },
  },
  {
    id: 'idioma-pt-en',
    date: '2026-10-09',
    title: { pt: 'Troca de idioma PT | EN', en: 'PT | EN language switch' },
    text: {
      pt: 'O botão PT | EN voltou a responder de primeira. Na primeira visita, o idioma segue o do navegador.',
      en: 'The PT | EN button works on the first click again. On the first visit, the language follows the browser.',
    },
  },
  {
    id: 'portfolio-no-ar',
    date: '2026-10-09',
    title: { pt: 'Portfólio no ar', en: 'Portfolio online' },
    text: {
      pt: 'O portfólio está no ar em devandreotti.com, com a versão 2 do site.',
      en: 'The portfolio is live at devandreotti.com, with the second version of the site.',
    },
  },
  {
    id: 'cartas-do-topo',
    date: '2026-10-08',
    title: { pt: 'Cartas do topo em leque', en: 'Top cards in a fan' },
    text: {
      pt: 'As cartas do topo ficam em leque, e a trajetória, o heatmap e o hover dos projetos foram corrigidos.',
      en: 'The top cards sit in a fan, and the journey, the heatmap and the project hover were fixed.',
    },
  },
  {
    id: 'agora-sobre-mim',
    date: '2026-10-07',
    title: { pt: 'Seção Agora', en: 'Now section' },
    text: {
      pt: 'Nova seção Agora, com um texto sobre mim e os projetos em que estou trabalhando.',
      en: 'New Now section, with a text about me and the projects I am working on.',
    },
  },
  {
    id: 'versao-2',
    date: '2026-10-06',
    title: { pt: 'Versão 2 do portfólio', en: 'Portfolio version 2' },
    text: {
      pt: 'Nova versão do site, com tela de carregamento, pilha animada de projetos e skills em bento, ajustada de 320 a 1920 px.',
      en: 'New version of the site, with a loading screen, an animated stack of projects and skills in a bento grid, fitted from 320 to 1920 px.',
    },
  },
];

/** The newest entry's date, the one the "Novo" badge compares against. */
export const LATEST_CHANGE = CHANGELOG.reduce((latest, entry) => (entry.date > latest ? entry.date : latest), '');
