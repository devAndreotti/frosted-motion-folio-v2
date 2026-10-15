#!/usr/bin/env node
// Traduz os posts do blog para inglês, de forma restritiva. Quem traduz é um agente (o cron do
// Hermes); este script decide O QUE traduzir e só aceita a tradução se ela passar na validação.
//
//   node scripts/traduzir-posts.mjs pendentes                  lista os posts sem inglês (ou com o PT mudado)
//   node scripts/traduzir-posts.mjs aplicar <slug> <arquivo>   valida a tradução e grava o <post>.en.md
//   node scripts/traduzir-posts.mjs publicar                   abre um PR só com os .en.md novos
//   node scripts/traduzir-posts.mjs mesclar                    faz o merge dos PRs traducao/* com os checks verdes
//
// A tradução é um arquivo com `title:` e `description:` no front matter e o texto em Markdown. O resto
// do cabeçalho (date, tags, draft) vem do original, e `source` guarda o hash do original para saber
// quando o inglês ficou velho.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitFrontmatter } from '../src/lib/blog/parse.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const BRANCH_PREFIX = 'traducao/';
const EN_FILE = /^src\/content\/posts\/[^/]+\.en\.md$/;
const MIN_RATIO = 0.6;
const MAX_RATIO = 1.8;

export const hashOf = (raw) => createHash('sha256').update(raw).digest('hex').slice(0, 12);
export const englishName = (file) => file.replace(/\.md$/, '.en.md');

/** Os blocos de código cercados (```), na ordem. */
export function codeBlocks(body) {
  return [...body.matchAll(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm)].map((m) => m[0]);
}

const withoutCode = (body) => body.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '');

/** O código sem os comentários de fim de linha (`# ...`, `// ...`): eles podem ser traduzidos, o resto não. */
export const stripComments = (block) => block.replace(/[ \t]+(#|\/\/)[ \t].*$/gm, '');

/** A "forma" do texto: tudo o que a tradução NÃO pode mudar. */
export function shapeOf(body) {
  const prose = withoutCode(body);
  const lines = prose.split('\n');
  const count = (re) => lines.filter((line) => re.test(line)).length;
  return {
    code: codeBlocks(body).map(stripComments),
    urls: [...prose.matchAll(/\]\(([^)\s]+)/g)].map((m) => m[1]),
    inlineCode: [...prose.matchAll(/`([^`\n]+)`/g)].length,
    headings: [1, 2, 3, 4, 5, 6].map((n) => count(new RegExp(`^#{${n}}\\s`))),
    bullets: count(/^\s*[-*+]\s/),
    numbered: count(/^\s*\d+[.)]\s/),
    quotes: count(/^\s*>/),
    rows: count(/^\s*\|/),
    rules: count(/^\s*(---|\*\*\*)\s*$/),
    blocks: prose.split(/\n\s*\n/).filter((b) => b.trim()).length,
  };
}

/** Lista o que difere entre o original e a tradução; vazio = a tradução manteve a estrutura. */
export function compareShapes(pt, en) {
  const problems = [];
  const a = shapeOf(pt);
  const b = shapeOf(en);
  for (const key of Object.keys(a)) {
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) problems.push(`"${key}" mudou: original ${JSON.stringify(a[key])} x tradução ${JSON.stringify(b[key])}`);
  }
  const ratio = en.length / Math.max(pt.length, 1);
  if (ratio < MIN_RATIO || ratio > MAX_RATIO) problems.push(`tamanho fora do esperado (${ratio.toFixed(2)}x o original)`);
  return problems;
}

/** Original + tradução do agente -> o `.en.md` final, ou os problemas que impedem de gravar. */
export function buildEnglish(ptRaw, translated) {
  const pt = splitFrontmatter(ptRaw);
  const en = splitFrontmatter(translated);
  const problems = [];
  const title = typeof en.data.title === 'string' ? en.data.title.trim() : '';
  const description = typeof en.data.description === 'string' ? en.data.description.trim() : '';
  if (!title) problems.push('a tradução não tem "title"');
  if (!description && pt.data.description) problems.push('a tradução não tem "description"');
  if (/[\r\n]/.test(title + description)) problems.push('title/description em mais de uma linha');
  if (!en.body.trim()) problems.push('a tradução está sem texto');
  problems.push(...compareShapes(pt.body, en.body));
  if (problems.length) return { problems };
  const quote = (text) => (/[:#\[\]"]|^\s|\s$/.test(text) ? JSON.stringify(text) : text);
  const tags = Array.isArray(pt.data.tags) ? pt.data.tags : [];
  const front = [
    '---',
    `title: ${quote(title)}`,
    `date: ${pt.data.date}`,
    ...(description ? [`description: ${quote(description)}`] : []),
    `tags: [${tags.join(', ')}]`,
    `draft: ${pt.data.draft === true}`,
    `source: ${hashOf(ptRaw)}`,
    '---',
    '',
    '',
  ].join('\n');
  return { problems, content: front + en.body.replace(/^\n+/, '') };
}

/** Posts que precisam de inglês: sem .en.md, ou com `source` diferente do hash do original. Rascunhos ficam de fora. */
export function pending(dir = POSTS_DIR) {
  const out = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.endsWith('.en.md')).sort()) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data } = splitFrontmatter(raw);
    if (data.draft === true) continue;
    const enFile = englishName(file);
    const enPath = path.join(dir, enFile);
    const source = fs.existsSync(enPath) ? splitFrontmatter(fs.readFileSync(enPath, 'utf8')).data.source : undefined;
    if (source === hashOf(raw)) continue;
    out.push({
      slug: file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
      original: path.join('src/content/posts', file),
      english: path.join('src/content/posts', enFile),
      reason: source === undefined ? 'sem versão em inglês' : 'o original mudou depois da tradução',
    });
  }
  return out;
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts }).trim();

function cmdPendentes() {
  const list = pending();
  for (const item of list) console.log(`${item.slug}\t${item.original}\t${item.reason}`);
}

function cmdAplicar(slug, translationFile) {
  const item = pending().find((p) => p.slug === slug);
  if (!item) return fail(`"${slug}" não está pendente`);
  if (!translationFile || !fs.existsSync(translationFile)) return fail('informe o arquivo com a tradução');
  const { problems, content } = buildEnglish(fs.readFileSync(path.join(ROOT, item.original), 'utf8'), fs.readFileSync(translationFile, 'utf8'));
  if (problems.length) return fail(`tradução reprovada:\n- ${problems.join('\n- ')}`);
  fs.writeFileSync(path.join(ROOT, item.english), content);
  console.log(`ok: ${item.english}`);
}

function cmdPublicar() {
  const changed = run('git', ['status', '--porcelain', '--', 'src', 'public', 'scripts', 'package.json'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, ''));
  if (!changed.length) return console.log('nada para publicar');
  const stray = changed.filter((file) => !EN_FILE.test(file));
  if (stray.length) return fail(`há mudanças que não são traduções, abortando:\n- ${stray.join('\n- ')}`);
  const names = changed.map((file) => path.basename(file, '.en.md').replace(/^\d{4}-\d{2}-\d{2}-/, ''));
  const branch = `${BRANCH_PREFIX}${new Date().toISOString().slice(0, 10)}-${names[0]}${names.length > 1 ? `-e-mais-${names.length - 1}` : ''}`.slice(0, 80);
  run('git', ['checkout', '-B', branch, 'origin/main']);
  run('git', ['add', '--', ...changed]);
  run('git', ['commit', '-m', `post: versão em inglês de ${names.join(', ')}\n\nTradução automática (cron do Hermes), validada por scripts/traduzir-posts.mjs.`]);
  run('git', ['push', '-u', 'origin', branch]);
  const body = `Tradução automática para inglês de: ${names.join(', ')}.\n\nValidada contra o original (blocos de código, links, imagens, títulos, listas e tabelas idênticos em estrutura). Só arquivos \`.en.md\`. O merge é feito pelo cron quando os checks passam.`;
  console.log(run('gh', ['pr', 'create', '--base', 'main', '--head', branch, '--title', `post: versão em inglês (${names.join(', ')})`, '--body', body]));
}

function cmdMesclar() {
  const prs = JSON.parse(run('gh', ['pr', 'list', '--state', 'open', '--json', 'number,headRefName,statusCheckRollup,files', '--limit', '50']));
  for (const pr of prs.filter((p) => p.headRefName.startsWith(BRANCH_PREFIX))) {
    const onlyTranslations = pr.files.length > 0 && pr.files.every((f) => EN_FILE.test(f.path));
    const checks = pr.statusCheckRollup ?? [];
    const green = checks.length > 0 && checks.every((c) => (c.conclusion ?? c.state) === 'SUCCESS' || c.conclusion === 'SKIPPED' || c.conclusion === 'NEUTRAL');
    if (!onlyTranslations) console.log(`#${pr.number}: tem arquivo que não é tradução, não mesclo`);
    else if (!green) console.log(`#${pr.number}: checks ainda não passaram`);
    else {
      run('gh', ['pr', 'merge', String(pr.number), '--squash', '--delete-branch']);
      console.log(`#${pr.number}: mesclado`);
    }
  }
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const commands = { pendentes: cmdPendentes, aplicar: cmdAplicar, publicar: cmdPublicar, mesclar: cmdMesclar };
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [name, ...args] = process.argv.slice(2);
  if (!commands[name]) fail('uso: node scripts/traduzir-posts.mjs pendentes | aplicar <slug> <arquivo> | publicar | mesclar');
  else commands[name](...args);
}
