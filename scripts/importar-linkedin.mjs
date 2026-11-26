#!/usr/bin/env node
/**
 * Importa posts coletados do LinkedIn (feed-dispatch/scripts/coletar_meus_posts_linkedin.py) para o blog.
 *
 * Uso:
 *   node scripts/importar-linkedin.mjs --listar
 *   node scripts/importar-linkedin.mjs --indices 1,3,5 [--arquivo]
 *   node scripts/importar-linkedin.mjs --todos [--dry-run] [--input <json>]
 *
 * O coletor entrega o texto do card como está na tela: a 1a linha é o headline do perfil, a 2a é o
 * "há quanto tempo" relativo ("1 m •", "3 sem • Editado •"), e `title`/`date` vêm desse lixo (o título
 * vira "1 m •" e a data é a do dia da coleta). Aqui o card é limpo e a data sai do próprio URN da
 * atividade, que é um snowflake com o instante da publicação.
 *
 * Deduplicação, em ordem: o id numérico da atividade (campo `linkedin:` no front matter ou o link
 * "Publicado originalmente" no corpo) em src/content/posts e src/content/archive; depois o começo do
 * texto já limpo. Posts curados à mão devem manter o `linkedin:` para não voltarem como PR.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__filename), '..');
export const POSTS_DIR = path.join(ROOT_DIR, 'src/content/posts');
export const ARCHIVE_DIR = path.join(ROOT_DIR, 'src/content/archive');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public/blog');
const TIME_ZONE = 'America/Sao_Paulo';

const CANDIDATE_JSONS = [
  path.resolve(ROOT_DIR, 'runtime/meus_posts_linkedin.json'),
  path.resolve(ROOT_DIR, '../feed-dispatch/runtime/meus_posts_linkedin.json'),
  '/home/ubuntu/projects/repos/feed-dispatch/runtime/meus_posts_linkedin.json',
];

// "1 m •", "3 sem • Editado •", "2 d •", "5 h •", "1 a •", "4 w •", "2 mo •", "1 yr •"
const RELATIVE_TIME = /^\s*\d+\s*(?:s|seg|min|h|d|sem|m|mo|mes|meses|a|ano|anos|w|wk|y|yr)\.?\s*•/i;

export function slugify(text) {
  const clean = (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean.slice(0, 50).replace(/-+$/, '') || 'post-linkedin';
}

/** `urn:li:activity:7516483324803063808` ou a URL do post -> `7516483324803063808`. */
export function activityId(text) {
  const match = /activity[:%3A]+(\d{15,22})/i.exec(text || '');
  return match ? match[1] : null;
}

/** O id da atividade é um snowflake: os 41 bits altos são o instante em ms. Devolve data e hora em São Paulo. */
export function dateFromActivity(id) {
  if (!id) return null;
  const ms = Number(BigInt(id) >> 22n);
  if (!Number.isFinite(ms) || ms < Date.UTC(2010, 0, 1) || ms > Date.now() + 86_400_000) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function isJunkTitle(title) {
  const t = (title || '').trim();
  return !t || RELATIVE_TIME.test(t) || t.replace(/[^\p{L}]/gu, '').length < 8;
}

/**
 * O texto do card -> só o post: tira headline do perfil e "há X tempo" do topo, e do fim o "… mais",
 * contadores de reação, caracteres invisíveis e o bloco final de hashtags.
 */
export function cleanBody(content) {
  let text = (content || '').replace(/[​-‍﻿]/g, '').replace(/\r\n/g, '\n');
  const cut = text.search(/(?:…|\.\.\.)\s*mais\s*(?:\n|$)/);
  if (cut !== -1) text = text.slice(0, cut);
  const lines = text.split('\n');
  const timeIdx = lines.findIndex((line, i) => i < 4 && RELATIVE_TIME.test(line));
  if (timeIdx !== -1) lines.splice(0, timeIdx + 1);
  text = lines.join('\n');
  text = text.replace(/(?:\n\s*\d+\s*)+$/g, ''); // contadores de reação/comentário
  text = text.replace(/(?:\n\s*)+(?:#[\p{L}\p{N}_]+\s*)+$/u, '');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/** Primeira frase/linha do post, sem aspas e emoji, cortada em ~90 caracteres numa palavra. */
export function titleFromBody(body) {
  const first = (body.split('\n').find((l) => l.trim()) || '').trim();
  let t = first.replace(/\p{Extended_Pictographic}/gu, '').replace(/^[\s*>#-]+|[\s*]+$/g, '').trim();
  // aspas só saem quando envolvem a linha inteira (uma citação), não quando fecham um trecho no meio
  if (/^["“]/.test(t) && /["”]$/.test(t)) t = t.slice(1, -1).trim();
  if (t.length > 90) t = `${t.slice(0, 90).replace(/\s+\S*$/, '')}...`;
  return t;
}

export function descriptionFromBody(body, title) {
  const text = body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^https?:\/\//.test(l))
    .join(' ')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // título inteiro no começo do texto: a descrição continua dele; título truncado ("..."): a descrição começa do início
  const rest = title && !title.endsWith('...') && text.startsWith(title) ? text.slice(title.length).trim() : text;
  const base = rest || text;
  return base.length > 160 ? `${base.slice(0, 160).replace(/\s+\S*$/, '')}...` : base;
}

const normalizeAlphaNum = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** Converte o item cru do coletor no post que será gravado (sem tocar em disco). */
export function normalizePost(raw) {
  const id = activityId(raw.id) || activityId(raw.url);
  const body = cleanBody(raw.content);
  const when = dateFromActivity(id) || { date: raw.date, time: null };
  const title = isJunkTitle(raw.title) ? titleFromBody(body) : raw.title.trim();
  const description = isJunkTitle(raw.description) || /\|/.test(raw.description || '') ? descriptionFromBody(body, title) : raw.description;
  const tags = ['linkedin'];
  for (const t of raw.tags || []) {
    const tag = t
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  const slug = slugify(title);
  return { id, url: raw.url, title, description, date: when.date, time: when.time, body, tags, slug, images: raw.images || [], isShared: !!raw.is_shared };
}

function readPosts(dirs) {
  const out = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md') && !f.endsWith('.en.md')) out.push({ file: f, content: fs.readFileSync(path.join(dir, f), 'utf8') });
    }
  }
  return out;
}

/** Onde o post já existe (motivo) ou null. `existing` = [{file, content}] de posts e archive. */
export function findExisting(post, existing) {
  for (const { file, content } of existing) {
    if (post.id && content.includes(post.id)) return `atividade ${post.id} já está em ${file}`;
  }
  for (const { file } of existing) {
    if (file.replace(/^\d{4}-\d{2}-\d{2}-/, '') === `${post.slug}.md`) return `slug "${post.slug}" já existe em ${file}`;
  }
  const head = normalizeAlphaNum(post.body).slice(0, 80);
  if (head.length >= 40) {
    for (const { file, content } of existing) {
      if (normalizeAlphaNum(content).includes(head)) return `texto coincide com ${file}`;
    }
  }
  return null;
}

const quoteYaml = (str) => `"${(str || '').replace(/\\/g, '\\\\').replace(/"/g, "'").replace(/\s+/g, ' ').trim()}"`;
const formatDatePt = (day) => day.split('-').reverse().join('/');

export function renderPost(post, images = []) {
  const lines = [
    '---',
    `title: ${quoteYaml(post.title)}`,
    `date: ${post.date}`,
    ...(post.time ? [`time: "${post.time}"`] : []),
    `description: ${quoteYaml(post.description)}`,
    `tags: [${post.tags.join(', ')}]`,
    `linkedin: urn:li:activity:${post.id}`,
    'draft: false',
    '---',
    '',
    `*Publicado originalmente no [LinkedIn](${post.url}) em ${formatDatePt(post.date)}.*`,
    '',
    post.body,
    '',
  ];
  let md = lines.join('\n');
  if (images.length) {
    md += '\n---\n\n### Mídia da publicação\n\n';
    for (const img of images) md += `![Mídia do post no LinkedIn](${img})\n\n`;
  }
  return md;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) return resolve();
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          return downloadImage(response.headers.location, destPath).then(resolve, reject);
        }
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`HTTP ${response.statusCode}`));
        }
        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
        file.on('error', reject);
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

async function importPost(raw, existing, { dryRun, includeReposts, toArchive }) {
  const post = normalizePost(raw);
  if (post.isShared && !includeReposts) {
    console.log(`⏩ repost, pulando: ${post.title.slice(0, 50)}`);
    return 'skipped';
  }
  if (!post.id) {
    console.log(`⚠️  sem id de atividade, pulando: ${post.title.slice(0, 50)}`);
    return 'skipped';
  }
  const reason = findExisting(post, existing);
  if (reason) {
    console.log(`⏭️  já existe (${reason})`);
    return 'skipped';
  }
  const dir = toArchive ? ARCHIVE_DIR : POSTS_DIR;
  const fileName = `${post.date}-${post.slug}.md`;
  const rel = path.relative(ROOT_DIR, path.join(dir, fileName));
  if (dryRun) {
    console.log(`[dry-run] criaria ${rel} ("${post.title}")`);
    return 'created';
  }
  const images = [];
  for (let i = 0; i < post.images.length; i++) {
    const name = `midia-${i + 1}.jpg`;
    try {
      await downloadImage(post.images[i], path.join(PUBLIC_DIR, post.slug, name));
      images.push(`/blog/${post.slug}/${name}`);
    } catch (e) {
      console.warn(`aviso: imagem ${i + 1} de ${post.slug} não baixou (${e.message})`);
    }
  }
  const md = renderPost(post, images);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), md, 'utf8');
  existing.push({ file: fileName, content: md });
  console.log(`✅ criado ${rel}`);
  return 'created';
}

async function main() {
  const args = process.argv.slice(2);
  const inputIdx = args.indexOf('--input');
  const jsonPath = inputIdx !== -1 && args[inputIdx + 1] ? path.resolve(args[inputIdx + 1]) : CANDIDATE_JSONS.find((p) => fs.existsSync(p)) || CANDIDATE_JSONS[0];
  if (!fs.existsSync(jsonPath)) {
    console.error(`Erro: arquivo de dados não encontrado em: ${jsonPath}`);
    process.exit(1);
  }
  const posts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  if (args.includes('--listar')) {
    const existing = readPosts([POSTS_DIR, ARCHIVE_DIR]);
    posts.forEach((raw, i) => {
      const p = normalizePost(raw);
      const where = findExisting(p, existing);
      console.log(`[${String(i + 1).padStart(2, '0')}] ${p.isShared ? '[REPOST]' : '[AUTORAL]'} ${p.date} ${p.time ?? ''}  ${p.title}`);
      console.log(`     ${where ? `já no blog: ${where}` : 'NOVO'}  ${p.url}\n`);
    });
    return;
  }

  let selected = [];
  if (args.includes('--todos') || args.includes('--apenas-novos')) selected = posts.map((_, i) => i);
  else {
    const eq = args.find((a) => a.startsWith('--indices='));
    const pos = args.indexOf('--indices');
    const val = eq ? eq.split('=')[1] : pos !== -1 ? args[pos + 1] : '';
    selected = (val || '')
      .split(',')
      .map((s) => parseInt(s.trim(), 10) - 1)
      .filter((n) => !Number.isNaN(n) && n >= 0 && n < posts.length);
  }
  if (!selected.length) {
    console.log('Nenhum índice válido selecionado. Use --indices 1,3,5 ou --todos.');
    return;
  }

  const opts = { dryRun: args.includes('--dry-run'), includeReposts: args.includes('--incluir-reposts'), toArchive: args.includes('--arquivo') };
  const existing = readPosts([POSTS_DIR, ARCHIVE_DIR]);
  let created = 0;
  for (const i of selected) if ((await importPost(posts[i], existing, opts)) === 'created') created++;
  console.log(`\n✨ ${created} novos, ${selected.length - created} pulados.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error('Erro na execução:', err);
    process.exit(1);
  });
}
