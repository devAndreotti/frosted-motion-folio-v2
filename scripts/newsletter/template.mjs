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
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const STRINGS = {
  pt: {
    issue: (n, range) => `Semana ${n} · ${range}`,
    thisWeek: 'Esta semana no blog',
    read: 'Ler o post',
    minutes: (n) => `${n} min de leitura`,
    behind: 'Bastidores',
    links: 'Para ler esta semana',
    why: 'Você recebe este e-mail porque se inscreveu em devandreotti.com.',
    unsubscribe: 'Sair da lista',
    other: 'Read in English',
    preheader: (title) => title,
  },
  en: {
    issue: (n, range) => `Week ${n} · ${range}`,
    thisWeek: 'New on the blog',
    read: 'Read the post',
    minutes: (n) => `${n} min read`,
    behind: 'Behind the scenes',
    links: 'Worth reading this week',
    why: 'You are receiving this because you subscribed at devandreotti.com.',
    unsubscribe: 'Unsubscribe',
    other: 'Ler em português',
    preheader: (title) => title,
  },
};

/**
 * data = { lang, week, range, intro, posts:[{title,description,minutes,tags,url}], behind?, links?:[{title,url,note}],
 *          unsubscribeUrl, otherLangUrl?, siteUrl }
 * options = { hue } (padrão: sorteado pela semana)
 */
export function renderNewsletter(data, options = {}) {
  const hue = options.hue ?? pickHue(data.week);
  const L = palette(hue, 'light');
  const D = palette(hue, 'dark');
  const S = STRINGS[data.lang === 'en' ? 'en' : 'pt'];
  const font = `'Geist','Helvetica Neue',Helvetica,Arial,sans-serif`;
  const mono = `'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

  // classes recebem o tema escuro; o estilo inline é o claro (a base que funciona em todo cliente)
  const dark = `
    @media (prefers-color-scheme: dark) {
      .bg { background-color: ${D.solid} !important; background-image: ${D.bg} !important; }
      .glass { background-color: ${D.cardSolid} !important; background-color: ${D.glass} !important; border-color: ${D.glassBorder} !important; }
      .glass2 { background-color: ${D.glassStrong} !important; border-color: ${D.glassBorder} !important; }
      .t1 { color: ${D.fg1} !important; } .t2 { color: ${D.fg2} !important; } .t3 { color: ${D.fg3} !important; }
      .acc { color: ${D.accent} !important; }
      .btn { background-color: ${D.accent} !important; color: ${D.accentText} !important; }
      .rule { border-color: ${D.line} !important; }
    }`;

  const card = (inner, cls = 'glass') =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;"><tr>` +
    `<td class="${cls}" bgcolor="${L.cardSolid}" style="background-color:${cls === 'glass' ? L.glass : L.glassStrong};border:1px solid ${L.glassBorder};border-radius:20px;padding:22px 24px;-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);">${inner}</td></tr></table>`;

  const button = (href, label) =>
    `<a class="btn" href="${esc(href)}" style="display:inline-block;margin-top:14px;padding:10px 20px;border-radius:999px;background-color:${L.accent};color:${L.accentText};font:600 14px/1 ${font};text-decoration:none;">${esc(label)} &rarr;</a>`;

  const label = (text) =>
    `<p class="acc" style="margin:26px 0 12px;font:600 11px/1 ${mono};letter-spacing:0.14em;text-transform:uppercase;color:${L.accent};">${esc(text)}</p>`;

  const posts = (data.posts ?? [])
    .map(
      (p) =>
        card(
          `<p class="t1" style="margin:0 0 8px;font:600 21px/1.25 ${font};letter-spacing:-0.02em;color:${L.fg1};">${esc(p.title)}</p>` +
            (p.description ? `<p class="t2" style="margin:0 0 6px;font:400 15px/1.6 ${font};color:${L.fg2};">${esc(p.description)}</p>` : '') +
            `<p class="t3" style="margin:0;font:400 12px/1.4 ${mono};color:${L.fg3};">${esc(S.minutes(p.minutes))}${p.tags?.length ? ' · ' + p.tags.map((t) => '#' + esc(t)).join(' ') : ''}</p>` +
            button(p.url, S.read)
        )
    )
    .join('');

  const links = (data.links ?? [])
    .map(
      (l) =>
        card(
          `<a class="acc" href="${esc(l.url)}" style="font:600 16px/1.35 ${font};color:${L.accent};text-decoration:none;">${esc(l.title)} &#8599;</a>` +
            `<p class="t2" style="margin:8px 0 0;font:400 14.5px/1.6 ${font};color:${L.fg2};">${esc(l.note)}</p>`,
          'glass2'
        )
    )
    .join('');

  const behind = data.behind
    ? label(S.behind) + card(`<p class="t2" style="margin:0;font:400 15px/1.7 ${font};color:${L.fg2};">${esc(data.behind)}</p>`)
    : '';

  const html = `<!doctype html>
<html lang="${data.lang === 'en' ? 'en' : 'pt-BR'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(S.issue(data.week, data.range))}</title>
<style>${dark}
  @media only screen and (max-width: 620px) { .wrap { width: 100% !important; } .pad { padding: 20px 14px !important; } }
</style></head>
<body class="bg" bgcolor="${L.solid}" style="margin:0;padding:0;background-color:${L.solid};background-image:${L.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(S.preheader(data.posts?.[0]?.title ?? data.intro))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="pad" style="padding:36px 16px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;"><tr><td>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
  <td width="44" valign="middle"><div class="glass2" style="width:40px;height:40px;border-radius:999px;background-color:${L.glassStrong};border:1px solid ${L.glassBorder};text-align:center;font:600 13px/40px ${font};color:${L.fg1};"><span class="t1" style="color:${L.fg1};">RA</span></div></td>
  <td valign="middle" class="t1" style="font:600 15px/1.2 ${font};color:${L.fg1};padding-left:6px;">Ricardo A. Gonçalves</td>
  <td align="right" valign="middle" class="t3" style="font:400 11px/1.2 ${mono};letter-spacing:0.08em;color:${L.fg3};">${esc(S.issue(data.week, data.range))}</td>
</tr></table>

<p class="t1" style="margin:30px 0 0;font:500 24px/1.35 ${font};letter-spacing:-0.02em;color:${L.fg1};">${esc(data.intro)}</p>

${posts ? label(S.thisWeek) + posts : ''}
${behind}
${links ? label(S.links) + links : ''}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;"><tr><td class="rule" style="border-top:1px solid ${L.line};padding-top:18px;">
  <p class="t3" style="margin:0 0 6px;font:400 12.5px/1.6 ${font};color:${L.fg3};">${esc(S.why)}</p>
  <p class="t3" style="margin:0;font:400 12.5px/1.6 ${font};color:${L.fg3};">
    <a class="acc" href="${esc(data.unsubscribeUrl)}" style="color:${L.accent};">${esc(S.unsubscribe)}</a>
    ${data.otherLangUrl ? ` · <a class="acc" href="${esc(data.otherLangUrl)}" style="color:${L.accent};">${esc(S.other)}</a>` : ''}
    · <a class="acc" href="${esc(data.siteUrl)}" style="color:${L.accent};">devandreotti.com</a>
  </p>
</td></tr></table>

</td></tr></table></td></tr></table></body></html>`;

  // versão em texto puro: leitores sem HTML e filtros de spam gostam dela
  const text = [
    S.issue(data.week, data.range),
    '',
    data.intro,
    '',
    ...(data.posts?.length ? [S.thisWeek.toUpperCase(), ...data.posts.flatMap((p) => [`- ${p.title} (${S.minutes(p.minutes)})`, `  ${p.description ?? ''}`, `  ${p.url}`, ''])] : []),
    ...(data.behind ? [S.behind.toUpperCase(), data.behind, ''] : []),
    ...(data.links?.length ? [S.links.toUpperCase(), ...data.links.flatMap((l) => [`- ${l.title}`, `  ${l.note}`, `  ${l.url}`, ''])] : []),
    S.why,
    `${S.unsubscribe}: ${data.unsubscribeUrl}`,
  ].join('\n');

  return { html, text, hue };
}
