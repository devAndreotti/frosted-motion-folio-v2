// Textos da página /privacidade/. Cada fato aqui tem de bater com worker/newsletter.js e worker/likes.js
// (e com os testes em worker/): mudou lá, muda aqui. Os números (7 dias, 2 horas) vêm de PENDING_TTL_MS
// e da limpeza de subscribe_hits.

export const FICHA_IDS = ['newsletter', 'abuse', 'likes', 'browser'] as const;
export type FichaId = (typeof FICHA_IDS)[number];
export type PrivacyLang = 'pt' | 'en';
export type SimPhase = 'waiting' | 'active' | 'deleted' | 'left';

export interface Ficha {
  label: string;
  title: string;
  sum: string;
  keep: string[];
  not: string[];
  rows: { k: string; v: string }[];
}

export interface PrivacyCopy {
  title: string;
  kicker: string;
  h1: string;
  lead: string;
  updated: string;
  promises: { title: string; text: string }[];
  numbers: { big: string; small: string }[];
  fichasTitle: string;
  fichasLead: string;
  keepLabel: string;
  notLabel: string;
  fichas: Record<FichaId, Ficha>;
  sim: {
    title: string;
    lead: string;
    group: string;
    steps: string[];
    panel: string;
    slider: string;
    gone: string;
    labels: { email: string; lang: string; requested: string; confirmed: string };
    values: { email: string; lang: string; requested: string; confirmed: string; notYet: string };
    dayTag: (n: number) => string;
    faltam: (n: number) => string;
    phases: Record<SimPhase, { status: string; note: string }>;
  };
  rights: { title: string; text: string; contact: string; copy: string; copied: string };
}

export const PRIVACY: Record<PrivacyLang, PrivacyCopy> = {
  pt: {
    title: 'Privacidade',
    kicker: 'Privacidade',
    h1: 'Seus dados, sem letras miúdas.',
    lead: 'O que acontece com os seus dados neste site. Resumo: guardo o mínimo, não vendo nem compartilho nada, e você apaga tudo quando quiser.',
    updated: 'Atualizado em 15 de outubro de 2026.',
    promises: [
      { title: 'Guardo o mínimo', text: 'Só o que cada recurso precisa para funcionar.' },
      { title: 'Não vendo nem compartilho', text: 'Quem entrega o serviço só trata os dados para isso.' },
      { title: 'Você apaga quando quiser', text: 'Pelo link do e-mail ou escrevendo para o contato.' },
    ],
    numbers: [
      { big: '7 dias', small: 'é o prazo para apagar o endereço de quem pediu a inscrição e não confirmou.' },
      { big: '2 h', small: 'é o tempo máximo que o código anti-abuso do formulário fica guardado.' },
      { big: '0', small: 'cookies de rastreamento neste site.' },
      { big: 'na hora', small: 'o endereço some quando você sai da lista.' },
    ],
    fichasTitle: 'O que cada parte do site guarda',
    fichasLead: 'Escolha uma parte para ver a ficha.',
    keepLabel: 'Guardo',
    notLabel: 'Não guardo',
    fichas: {
      newsletter: {
        label: 'Newsletter',
        title: 'Newsletter',
        sum: 'Confirmação por e-mail e, depois, a newsletter semanal, toda segunda-feira.',
        keep: ['E-mail', 'Idioma escolhido', 'Data do pedido', 'Data da confirmação', 'Código (hash) do e-mail nas edições já enviadas'],
        not: ['Nome', 'IP', 'Abertura dos e-mails', 'Cliques nos e-mails'],
        rows: [
          { k: 'Para quê', v: 'Enviar o e-mail de confirmação e, depois de confirmado, a newsletter semanal (segundas-feiras). Nada além disso.' },
          { k: 'Por quanto tempo', v: 'Até você sair da lista. Quem pede a inscrição e não confirma tem o endereço apagado em até 7 dias.' },
          { k: 'Quem trata', v: 'A lista fica no banco D1 da Cloudflare, e os e-mails saem pelo serviço Email Delivery da Oracle Cloud. Eles só tratam os dados para entregar o serviço.' },
          { k: 'Como sair', v: 'Pelo link "Sair da lista" que vem em todo e-mail, ou escrevendo para o contato abaixo. Ao sair, o endereço é apagado na hora, e não fica nenhuma lista de quem saiu.' },
        ],
      },
      abuse: {
        label: 'Proteção contra abuso',
        title: 'Proteção contra abuso',
        sum: 'Uma verificação anti-robô e um limite de tentativas por visitante.',
        keep: ['Código criptográfico (hash) derivado da sua rede'],
        not: ['Seu IP'],
        rows: [
          { k: 'Para quê', v: 'O formulário usa o Cloudflare Turnstile, uma verificação anti-robô, e limita as tentativas por visitante.' },
          { k: 'Por quanto tempo', v: 'Até 2 horas.' },
        ],
      },
      likes: {
        label: 'Curtidas',
        title: 'Curtidas',
        sum: 'Curtir não pede conta e não usa cookie.',
        keep: ['Código criptográfico (hash) da sua rede e do seu navegador, junto do post curtido'],
        not: ['Cookie', 'Conta'],
        rows: [{ k: 'Para quê', v: 'Só para impedir curtidas repetidas.' }],
      },
      browser: {
        label: 'Cookies e navegador',
        title: 'Cookies e armazenamento',
        sum: 'O site não usa cookies de rastreamento.',
        keep: ['Tema', 'Cor', 'Idioma'],
        not: ['Cookies de rastreamento'],
        rows: [{ k: 'Onde fica', v: 'Só no seu navegador: ficam guardadas apenas as suas escolhas de tema, cor e idioma.' }],
      },
    },
    sim: {
      title: 'E se eu me inscrever na newsletter?',
      lead: 'Veja o que existe sobre você em cada etapa.',
      group: 'Etapa da inscrição',
      steps: ['Pedi a inscrição', 'Confirmei', 'Saí da lista'],
      panel: 'O que existe sobre você agora',
      slider: 'Toque num dia para avançar sem confirmar',
      gone: 'apagado',
      labels: { email: 'E-mail', lang: 'Idioma', requested: 'Pedido em', confirmed: 'Confirmado em' },
      values: { email: 'voce@exemplo.com', lang: 'PT', requested: 'dia 0', confirmed: 'dia 1', notYet: 'ainda não' },
      dayTag: (n) => `dia ${n}`,
      faltam: (n) => (n === 1 ? 'Falta 1 dia.' : `Faltam ${n} dias.`),
      phases: {
        waiting: { status: 'Aguardando confirmação', note: 'Se você não confirmar, o endereço é apagado em até 7 dias.' },
        active: { status: 'Inscrição ativa', note: 'Você recebe a newsletter semanal, toda segunda-feira, até sair da lista.' },
        deleted: { status: 'Apagado automaticamente', note: 'Você não confirmou em 7 dias, então o endereço foi apagado sozinho.' },
        left: { status: 'Nada guardado', note: 'O endereço é apagado na hora e não fica nenhuma lista de quem saiu.' },
      },
    },
    rights: {
      title: 'Seus direitos',
      text: 'Pela LGPD você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento. É só escrever para o contato abaixo.',
      contact: 'Contato',
      copy: 'Copiar e-mail',
      copied: 'Copiado',
    },
  },
  en: {
    title: 'Privacy',
    kicker: 'Privacy',
    h1: 'Your data, no fine print.',
    lead: 'What happens with your data on this site. In short: I keep the minimum, I sell and share nothing, and you can delete everything whenever you like.',
    updated: 'Updated on October 15, 2026.',
    promises: [
      { title: 'I keep the minimum', text: 'Only what each feature needs to work.' },
      { title: 'I don’t sell or share', text: 'Whoever delivers the service only handles the data to do that.' },
      { title: 'You delete whenever you want', text: 'Through the email link or by writing to me.' },
    ],
    numbers: [
      { big: '7 days', small: 'is the deadline to delete the address of anyone who asked to subscribe and never confirmed.' },
      { big: '2 h', small: 'is the longest the form’s anti-abuse code is kept.' },
      { big: '0', small: 'tracking cookies on this site.' },
      { big: 'at once', small: 'the address disappears when you leave the list.' },
    ],
    fichasTitle: 'What each part of the site keeps',
    fichasLead: 'Pick a part to see its card.',
    keepLabel: 'I keep',
    notLabel: 'I don’t keep',
    fichas: {
      newsletter: {
        label: 'Newsletter',
        title: 'Newsletter',
        sum: 'Email confirmation and, after that, the weekly newsletter, every Monday.',
        keep: ['Email', 'Chosen language', 'Request date', 'Confirmation date', 'Code (hash) of the email in the issues already sent'],
        not: ['Name', 'IP address', 'Email opens', 'Email clicks'],
        rows: [
          { k: 'What for', v: 'Sending the confirmation email and, once you confirm, the weekly newsletter (Mondays). Nothing beyond that.' },
          { k: 'How long', v: 'Until you leave the list. If you ask to subscribe and never confirm, the address is deleted within 7 days.' },
          { k: 'Who handles it', v: 'The list lives in Cloudflare’s D1 database, and the emails go out through Oracle Cloud’s Email Delivery service. They handle the data only to provide the service.' },
          { k: 'How to leave', v: 'With the "Unsubscribe" link in every email, or by writing to the contact below. When you leave, the address is deleted at once, and no list of who left is kept.' },
        ],
      },
      abuse: {
        label: 'Abuse protection',
        title: 'Abuse protection',
        sum: 'An anti-robot check and a limit on attempts per visitor.',
        keep: ['Cryptographic code (hash) derived from your network'],
        not: ['Your IP address'],
        rows: [
          { k: 'What for', v: 'The form uses Cloudflare Turnstile, an anti-robot check, and limits attempts per visitor.' },
          { k: 'How long', v: 'Up to 2 hours.' },
        ],
      },
      likes: {
        label: 'Likes',
        title: 'Likes',
        sum: 'Liking asks for no account and uses no cookie.',
        keep: ['Cryptographic code (hash) of your network and browser, kept next to the liked post'],
        not: ['Cookie', 'Account'],
        rows: [{ k: 'What for', v: 'Only to stop repeated likes.' }],
      },
      browser: {
        label: 'Cookies and browser',
        title: 'Cookies and storage',
        sum: 'The site uses no tracking cookies.',
        keep: ['Theme', 'Color', 'Language'],
        not: ['Tracking cookies'],
        rows: [{ k: 'Where it lives', v: 'Only in your browser: just your theme, color and language choices are kept there.' }],
      },
    },
    sim: {
      title: 'What if I subscribe to the newsletter?',
      lead: 'See what exists about you at each step.',
      group: 'Subscription step',
      steps: ['I asked to subscribe', 'I confirmed', 'I left the list'],
      panel: 'What exists about you right now',
      slider: 'Tap a day to move forward without confirming',
      gone: 'deleted',
      labels: { email: 'Email', lang: 'Language', requested: 'Requested on', confirmed: 'Confirmed on' },
      values: { email: 'you@example.com', lang: 'EN', requested: 'day 0', confirmed: 'day 1', notYet: 'not yet' },
      dayTag: (n) => `day ${n}`,
      faltam: (n) => (n === 1 ? '1 day left.' : `${n} days left.`),
      phases: {
        waiting: { status: 'Waiting for confirmation', note: 'If you don’t confirm, the address is deleted within 7 days.' },
        active: { status: 'Subscription active', note: 'You get the weekly newsletter, every Monday, until you leave the list.' },
        deleted: { status: 'Deleted automatically', note: 'You didn’t confirm within 7 days, so the address was deleted on its own.' },
        left: { status: 'Nothing kept', note: 'The address is deleted at once, and no list of who left is kept.' },
      },
    },
    rights: {
      title: 'Your rights',
      text: 'Under Brazil’s LGPD you can ask for access, correction or deletion of your data at any time. Just write to the contact below.',
      contact: 'Contact',
      copy: 'Copy email',
      copied: 'Copied',
    },
  },
};
