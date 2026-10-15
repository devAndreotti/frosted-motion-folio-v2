// E-mail da newsletter semanal, no estilo do site (vidro fosco, claro/escuro, cor de destaque).
// Cores: as mesmas 7 cores do site (src/lib/theme.ts). Cada envio sorteia uma delas com pesos
// (a cor padrão do site sai na maioria das vezes), e o sorteio é fixado pelo número da semana.
//
// E-mail não tem backdrop-filter na maioria dos clientes, então o "vidro" é feito de cartões
// translúcidos com borda fina sobre o gradiente; onde não há rgba/gradiente (Outlook desktop), o
// bgcolor sólido de cada bloco segura o visual. O tema escuro entra por prefers-color-scheme
// (Apple Mail, Outlook.com, vários apps); o claro é a base, que funciona em qualquer lugar.
import { HUE_ORDER, HUE_THEMES } from '../../src/lib/theme.ts';

/** Peso de cada cor no sorteio: 'black' é a cor padrão do site; as outras dividem o resto. */
export const HUE_WEIGHTS = { black: 52, blue: 8, purple: 8, orange: 8, red: 8, green: 8, yellow: 8 };

/** Sorteio determinístico: a mesma semana dá sempre a mesma cor (prévia e envio batem). */
export function pickHue(seed) {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  let roll = ((x ^ (x >>> 16)) >>> 0) % 100;
  for (const hue of HUE_ORDER) {
    roll -= HUE_WEIGHTS[hue];
    if (roll < 0) return hue;
  }
  return 'black';
}

const hex = (n) => Math.round(n).toString(16).padStart(2, '0');

/** `hsl(210 35% 94%)` / `hsl(0 0% 96% / 0.22)` -> `#f0f4f9` / `rgba(245,245,245,0.22)` */
export function toRgb(css) {
  const m = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+))?\s*\)/.exec(css);
  if (!m) return css; // já é hex/rgba
  const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))));
  const [r, g, b] = [f(0), f(8), f(4)];
  return m[4] === undefined ? `#${hex(r)}${hex(g)}${hex(b)}` : `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${m[4]})`;
}

/** `#3b82f6` + 0.18 -> `rgba(59,130,246,0.18)` */
export function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

const gradient = (bg) => bg.replace(/hsl\([^)]*\)/g, toRgb);

/** As cores de um modo (claro/escuro) de uma cor do site, já em hex/rgba. */
export function palette(hue, mode) {
  const t = HUE_THEMES[hue][mode];
  const dark = mode === 'dark';
  return {
    solid: toRgb(t.solid),
    bg: gradient(t.bg),
    accent: t.accent,
    accentText: t.accentText,
    // no claro, o vidro do site (22% de branco) some num e-mail: mais opaco para os cartões lerem bem
    glass: dark ? toRgb(t.glassSurface) : 'rgba(255,255,255,0.55)',
    glassBorder: dark ? toRgb(t.glassBorder) : 'rgba(255,255,255,0.9)',
    glassStrong: dark ? toRgb(t.glassStrongSurface) : 'rgba(255,255,255,0.7)',
    // sólido de reserva para clientes sem rgba: o cartão sobre o fundo
    cardSolid: dark ? '#16181d' : '#f4f6fa',
    fg1: dark ? '#f5f5f5' : '#131316',
    fg2: dark ? 'rgba(255,255,255,0.72)' : 'rgba(19,19,22,0.72)',
    fg3: dark ? 'rgba(255,255,255,0.56)' : 'rgba(19,19,22,0.62)',
    line: dark ? 'rgba(255,255,255,0.14)' : 'rgba(19,19,22,0.1)',
    // o destaque em tons translúcidos (fundos de pílulas e do cartão em destaque) e os brilhos do fundo
    // no preto (cor padrão) o destaque é cinza: um tom bem mais leve para o cartão não pesar
    accentSoft: hexToRgba(t.accent, hue === 'black' ? (dark ? 0.1 : 0.05) : dark ? 0.18 : 0.12),
    accentLine: hexToRgba(t.accent, dark ? 0.55 : 0.4),
    glow1: toRgb(t.glow1),
    glow2: toRgb(t.glow2),
  };
}

/** Palavras por minuto de leitura silenciosa: ~238 em inglês (média de estudos), ~200 em português (mesmo valor dos posts do site). */
export const WORDS_PER_MINUTE = { pt: 200, en: 238 };

/** Conta só o que é palavra (letras/números), como o site faz nos posts. */
export const countWords = (text) => String(text ?? '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * Tempo de leitura DO E-MAIL: o texto que a pessoa lê dentro dele (introdução, posts com título e descrição,
 * bastidores, links com comentário), sem rodapé nem URLs. Mínimo de 1 minuto, arredondado ao mais próximo.
 */
export function emailReadingMinutes(data) {
  const parts = [
    data.intro,
    ...(data.posts ?? []).flatMap((p) => [p.title, p.description]),
    data.behind,
    ...(data.links ?? []).flatMap((l) => [l.title, l.note]),
  ];
  const words = parts.reduce((sum, part) => sum + countWords(part), 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE[data.lang === 'en' ? 'en' : 'pt']));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const SITE_URL = 'https://devandreotti.com';
export const GITHUB_URL = 'https://github.com/devAndreotti';
export const REPLY_TO = 'ricardo@devandreotti.com';

export const STRINGS = {
  pt: {
    issue: (n, range) => `Semana ${n} · ${range}`,
    issueNo: (n) => `Nº ${n}`,
    readTime: (n) => `~${n} min de leitura`,
    featured: 'Destaque',
    thisWeek: 'Esta semana no blog',
    read: 'Ler o post',
    minutes: (n) => `${n} min`,
    behind: 'Bastidores',
    links: 'Para ler esta semana',
    signoff: 'Até a próxima segunda,',
    reply: 'Respondeu este e-mail? Eu leio todos.',
    replyButton: 'Responder',
    why: 'Você recebe este e-mail porque se inscreveu em devandreotti.com.',
    unsubscribe: 'Sair da lista',
    other: 'Read in English',
    confirmSubject: 'Confirme sua inscrição na newsletter',
    confirmKicker: 'Falta um passo',
    confirmTitle: 'Confirme sua inscrição',
    confirmBody: 'Recebi um pedido para enviar a newsletter semanal de devandreotti.com para este endereço. Toda segunda-feira: os posts da semana, bastidores dos projetos e alguns links que valem a leitura.',
    confirmButton: 'Confirmar inscrição',
    confirmHelp: 'Se o botão não funcionar, copie este endereço no navegador:',
    confirmIgnore: 'Não foi você? Ignore este e-mail: sem a confirmação, nada será enviado.',
  },
  en: {
    issue: (n, range) => `Week ${n} · ${range}`,
    issueNo: (n) => `No. ${n}`,
    readTime: (n) => `~${n} min read`,
    featured: 'Featured',
    thisWeek: 'New on the blog',
    read: 'Read the post',
    minutes: (n) => `${n} min`,
    behind: 'Behind the scenes',
    links: 'Worth reading this week',
    signoff: 'See you next Monday,',
    reply: 'Did this email land? Reply to it. I read every answer.',
    replyButton: 'Reply',
    why: 'You are receiving this because you subscribed at devandreotti.com.',
    unsubscribe: 'Unsubscribe',
    other: 'Ler em português',
    confirmSubject: 'Confirm your newsletter subscription',
    confirmKicker: 'One more step',
    confirmTitle: 'Confirm your subscription',
    confirmBody: 'I got a request to send the weekly devandreotti.com newsletter to this address. Every Monday: the week’s posts, behind the scenes of my projects and a few links worth reading.',
    confirmButton: 'Confirm subscription',
    confirmHelp: 'If the button does not work, paste this address into your browser:',
    confirmIgnore: 'Was not you? Ignore this email: nothing is sent until you confirm.',
  },
};

const FONT = `'Geist','Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO = `'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

/** CSS do tema escuro: só o que muda (as classes deste arquivo). O claro é o estilo inline, a base de todo cliente. */
function darkCss(D) {
  return `@media (prefers-color-scheme: dark) {
    .bg { background-color: ${D.solid} !important; background-image: radial-gradient(circle 460px at 6% 90px, ${D.glow1}, rgba(0,0,0,0)), radial-gradient(circle 420px at 98% 260px, ${D.glow2}, rgba(0,0,0,0)), ${D.bg} !important; }
    .glass { background-color: ${D.cardSolid} !important; background-color: ${D.glass} !important; border-color: ${D.glassBorder} !important; }
    .glass2 { background-color: ${D.glassStrong} !important; border-color: ${D.glassBorder} !important; }
    .hero { background-color: ${D.accentSoft} !important; border-color: ${D.accentLine} !important; }
    .t1 { color: ${D.fg1} !important; } .t2 { color: ${D.fg2} !important; } .t3 { color: ${D.fg3} !important; }
    .acc { color: ${D.accent} !important; }
    .btn { background-color: ${D.accent} !important; color: ${D.accentText} !important; }
    .ghost { border-color: ${D.accentLine} !important; color: ${D.accent} !important; }
    .pill { border-color: ${D.line} !important; color: ${D.fg2} !important; }
    .chip { background-color: ${D.accentSoft} !important; color: ${D.accent} !important; }
    .bar { background-color: ${D.accent} !important; }
    .rule { border-color: ${D.line} !important; }
  }`;
}

/** A moldura comum: fundo com brilho, cabeçalho com a marca, conteúdo e rodapé. */
function shell({ lang, hue, title, preheader, headerRight, inner, footer }) {
  const L = palette(hue, 'light');
  const D = palette(hue, 'dark');
  const bgLight = `radial-gradient(circle 460px at 6% 90px, ${L.glow1}, rgba(0,0,0,0)), radial-gradient(circle 420px at 98% 260px, ${L.glow2}, rgba(0,0,0,0)), ${L.bg}`;
  return `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'pt-BR'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<style>${darkCss(D)}
  @media only screen and (max-width: 620px) { .wrap { width: 100% !important; } .pad { padding: 20px 12px !important; } .cardp { padding: 20px 18px !important; } .big { font-size: 22px !important; } }
</style></head>
<body class="bg" bgcolor="${L.solid}" style="margin:0;padding:0;background-color:${L.solid};background-image:${bgLight};background-repeat:no-repeat;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader ?? '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="pad" style="padding:36px 16px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;"><tr><td>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="50" valign="middle"><div class="glass2" style="width:44px;height:44px;border-radius:999px;background-color:${L.glassStrong};border:2px solid ${L.accent};text-align:center;font:700 14px/40px ${FONT};"><span class="t1" style="color:${L.fg1};">RA</span></div></td>
  <td valign="middle" style="padding-left:4px;"><div class="t1" style="font:600 15px/1.25 ${FONT};color:${L.fg1};">Ricardo A. Gonçalves</div><div class="t3" style="font:400 11px/1.4 ${MONO};letter-spacing:0.04em;color:${L.fg3};">devandreotti.com</div></td>
  <td align="right" valign="middle">${headerRight ?? ''}</td>
</tr></table>

${inner}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;"><tr><td class="rule" style="border-top:1px solid ${L.line};padding-top:18px;">
${footer}
</td></tr></table>

</td></tr></table></td></tr></table></body></html>`;
}

const pillLight = (L) => `display:inline-block;padding:3px 10px;margin:0 6px 6px 0;border-radius:999px;border:1px solid ${L.line};font:400 11.5px/1.5 ${MONO};color:${L.fg2};`;
const chipLight = (L) => `display:inline-block;padding:4px 10px;border-radius:999px;background-color:${L.accentSoft};font:600 10.5px/1.4 ${MONO};letter-spacing:0.1em;text-transform:uppercase;color:${L.accent};`;

function card(L, inner, { cls = 'glass', extra = '' } = {}) {
  const bg = cls === 'glass' ? L.glass : cls === 'glass2' ? L.glassStrong : L.accentSoft;
  const border = cls === 'hero' ? L.accentLine : L.glassBorder;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;"><tr>` +
    `<td class="${cls} cardp" bgcolor="${L.cardSolid}" style="background-color:${bg};border:1px solid ${border};border-radius:22px;padding:24px 26px;-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);${extra}">${inner}</td></tr></table>`;
}

const button = (L, href, label) =>
  `<a class="btn" href="${esc(href)}" style="display:inline-block;padding:11px 22px;border-radius:999px;background-color:${L.accent};color:${L.accentText};font:600 14px/1 ${FONT};text-decoration:none;">${esc(label)} &rarr;</a>`;

const sectionLabel = (L, text) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 12px;"><tr><td class="bar" width="22" height="2" style="width:22px;height:2px;line-height:2px;font-size:2px;background-color:${L.accent};">&nbsp;</td><td class="acc" style="padding-left:10px;font:600 11px/1 ${MONO};letter-spacing:0.16em;text-transform:uppercase;color:${L.accent};">${esc(text)}</td></tr></table>`;

const tagPills = (L, tags) => (tags?.length ? `<div style="margin-top:12px;">${tags.map((t) => `<span class="pill" style="${pillLight(L)}">#${esc(t)}</span>`).join('')}</div>` : '');

/**
 * data = { lang, week, range, intro, posts:[{title,description,minutes,tags,url}], behind?, links?:[{title,url,note}],
 *          unsubscribeUrl, otherLangUrl?, siteUrl }
 * options = { hue } (padrão: sorteado pela semana)
 */
export function renderNewsletter(data, options = {}) {
  const hue = options.hue ?? pickHue(data.week);
  const L = palette(hue, 'light');
  const S = STRINGS[data.lang === 'en' ? 'en' : 'pt'];
  const [first, ...rest] = data.posts ?? [];

  const featured = first
    ? card(
        L,
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;"><tr><td><span class="chip" style="${chipLight(L)}">${esc(S.featured)}</span></td><td class="t3" style="padding-left:10px;font:400 12px/1 ${MONO};color:${L.fg3};">${esc(S.minutes(first.minutes))}</td></tr></table>` +
          `<p class="t1 big" style="margin:0 0 10px;font:600 25px/1.2 ${FONT};letter-spacing:-0.025em;color:${L.fg1};">${esc(first.title)}</p>` +
          (first.description ? `<p class="t2" style="margin:0;font:400 15.5px/1.65 ${FONT};color:${L.fg2};">${esc(first.description)}</p>` : '') +
          tagPills(L, first.tags) +
          `<div style="margin-top:16px;">${button(L, first.url, S.read)}</div>`,
        { cls: 'hero' }
      )
    : '';

  const others = rest
    .map(
      (p, i) =>
        card(
          L,
          `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
            `<td width="40" valign="top" class="acc" style="font:600 13px/1.5 ${MONO};color:${L.accent};">${String(i + 2).padStart(2, '0')}</td>` +
            `<td valign="top"><a class="t1" href="${esc(p.url)}" style="font:600 18px/1.3 ${FONT};letter-spacing:-0.015em;color:${L.fg1};text-decoration:none;">${esc(p.title)}</a>` +
            (p.description ? `<p class="t2" style="margin:6px 0 0;font:400 14.5px/1.6 ${FONT};color:${L.fg2};">${esc(p.description)}</p>` : '') +
            `<p class="t3" style="margin:8px 0 0;font:400 11.5px/1.4 ${MONO};color:${L.fg3};">${esc(S.minutes(p.minutes))}${p.tags?.length ? ' · ' + p.tags.map((t) => '#' + esc(t)).join(' ') : ''}</p></td></tr></table>`
        )
    )
    .join('');

  const behind = data.behind
    ? sectionLabel(L, S.behind) +
      card(
        L,
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="bar" width="4" style="width:4px;background-color:${L.accent};border-radius:4px;">&nbsp;</td><td style="padding-left:16px;"><p class="t2" style="margin:0;font:400 15.5px/1.75 ${FONT};color:${L.fg2};">${esc(data.behind)}</p></td></tr></table>`
      )
    : '';

  const links = (data.links ?? [])
    .map((l) =>
      card(
        L,
        `<a class="acc" href="${esc(l.url)}" style="font:600 16px/1.35 ${FONT};color:${L.accent};text-decoration:none;">${esc(l.title)} &#8599;</a><p class="t2" style="margin:8px 0 0;font:400 14.5px/1.65 ${FONT};color:${L.fg2};">${esc(l.note)}</p>`,
        { cls: 'glass2' }
      )
    )
    .join('');

  const signature = card(
    L,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td width="56" valign="middle"><div class="glass2" style="width:44px;height:44px;border-radius:999px;background-color:${L.glassStrong};border:2px solid ${L.accent};text-align:center;font:700 14px/40px ${FONT};"><span class="t1" style="color:${L.fg1};">RA</span></div></td>` +
      `<td valign="middle"><p class="t1" style="margin:0;font:600 15px/1.4 ${FONT};color:${L.fg1};">${esc(S.signoff)} Ricardo</p><p class="t2" style="margin:2px 0 0;font:400 13.5px/1.5 ${FONT};color:${L.fg2};">${esc(S.reply)}</p></td>` +
      `<td align="right" valign="middle"><a class="ghost" href="mailto:${REPLY_TO}" style="display:inline-block;padding:9px 18px;border-radius:999px;border:1px solid ${L.accentLine};color:${L.accent};font:600 13px/1 ${FONT};text-decoration:none;">${esc(S.replyButton)}</a></td>` +
      `</tr></table>`,
    { cls: 'glass2' }
  );

  const inner = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr><td>
  <span class="chip" style="${chipLight(L)}">${esc(S.issueNo(data.week))}</span><span class="t3" style="margin-left:10px;font:400 12px/1 ${MONO};letter-spacing:0.04em;color:${L.fg3};">${esc(data.range)} · ${esc(S.readTime(emailReadingMinutes(data)))}</span>
</td></tr></table>
<p class="t1 big" style="margin:14px 0 6px;font:500 26px/1.3 ${FONT};letter-spacing:-0.025em;color:${L.fg1};">${esc(data.intro)}</p>

${first ? sectionLabel(L, S.thisWeek) + featured + others : ''}
${behind}
${links ? sectionLabel(L, S.links) + links : ''}
<div style="margin-top:30px;">${signature}</div>`;

  const footer = `
  <p class="t3" style="margin:0 0 8px;font:400 12.5px/1.6 ${FONT};color:${L.fg3};">${esc(S.why)}</p>
  <p class="t3" style="margin:0;font:400 12.5px/1.9 ${FONT};color:${L.fg3};">
    <a class="acc" href="${esc(data.unsubscribeUrl)}" style="color:${L.accent};">${esc(S.unsubscribe)}</a>
    ${data.otherLangUrl ? ` · <a class="acc" href="${esc(data.otherLangUrl)}" style="color:${L.accent};">${esc(S.other)}</a>` : ''}
    · <a class="acc" href="${esc(data.siteUrl ?? SITE_URL)}" style="color:${L.accent};">devandreotti.com</a>
    · <a class="acc" href="${GITHUB_URL}" style="color:${L.accent};">GitHub</a>
  </p>`;

  const html = shell({
    lang: data.lang,
    hue,
    title: S.issue(data.week, data.range),
    preheader: first?.title ?? data.intro,
    headerRight: `<span class="t3" style="font:400 11px/1.2 ${MONO};letter-spacing:0.08em;color:${L.fg3};">${esc(S.issue(data.week, data.range))}</span>`,
    inner,
    footer,
  });

  // versão em texto puro: leitores sem HTML e filtros de spam gostam dela
  const text = [
    `${S.issue(data.week, data.range)} · ${S.readTime(emailReadingMinutes(data))}`,
    '',
    data.intro,
    '',
    ...(data.posts?.length ? [S.thisWeek.toUpperCase(), ...data.posts.flatMap((p) => [`- ${p.title} (${S.minutes(p.minutes)})`, `  ${p.description ?? ''}`, `  ${p.url}`, ''])] : []),
    ...(data.behind ? [S.behind.toUpperCase(), data.behind, ''] : []),
    ...(data.links?.length ? [S.links.toUpperCase(), ...data.links.flatMap((l) => [`- ${l.title}`, `  ${l.note}`, `  ${l.url}`, ''])] : []),
    `${S.signoff} Ricardo`,
    S.reply,
    '',
    S.why,
    `${S.unsubscribe}: ${data.unsubscribeUrl}`,
  ].join('\n');

  return { html, text, hue };
}

/** O e-mail de confirmação da inscrição (double opt-in): data = { lang, confirmUrl } */
export function renderConfirmation(data, options = {}) {
  const hue = options.hue ?? 'black';
  const L = palette(hue, 'light');
  const S = STRINGS[data.lang === 'en' ? 'en' : 'pt'];
  const inner = `
<div style="margin-top:30px;">${card(
    L,
    `<span class="chip" style="${chipLight(L)}">${esc(S.confirmKicker)}</span>` +
      `<p class="t1 big" style="margin:16px 0 10px;font:600 26px/1.2 ${FONT};letter-spacing:-0.025em;color:${L.fg1};">${esc(S.confirmTitle)}</p>` +
      `<p class="t2" style="margin:0 0 20px;font:400 15.5px/1.7 ${FONT};color:${L.fg2};">${esc(S.confirmBody)}</p>` +
      button(L, data.confirmUrl, S.confirmButton) +
      `<p class="t3" style="margin:22px 0 4px;font:400 12.5px/1.6 ${FONT};color:${L.fg3};">${esc(S.confirmHelp)}</p>` +
      `<p style="margin:0;font:400 12px/1.5 ${MONO};word-break:break-all;"><a class="acc" href="${esc(data.confirmUrl)}" style="color:${L.accent};">${esc(data.confirmUrl)}</a></p>`,
    { cls: 'hero' }
  )}</div>`;
  const footer = `<p class="t3" style="margin:0;font:400 12.5px/1.6 ${FONT};color:${L.fg3};">${esc(S.confirmIgnore)}</p>`;
  const html = shell({ lang: data.lang, hue, title: S.confirmSubject, preheader: S.confirmBody, inner, footer });
  const text = [S.confirmTitle, '', S.confirmBody, '', data.confirmUrl, '', S.confirmIgnore].join('\n');
  return { html, text, subject: S.confirmSubject, hue };
}
