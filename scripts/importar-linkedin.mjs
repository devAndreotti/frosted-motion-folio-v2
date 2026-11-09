#!/usr/bin/env node
/**
 * Importa posts coletados do LinkedIn para o formato nativo do blog (frosted-motion-folio-v2).
 *
 * Uso:
 *   node scripts/importar-linkedin.mjs --listar
 *   node scripts/importar-linkedin.mjs --indices 1,3,5
 *   node scripts/importar-linkedin.mjs --todos
 *   node scripts/importar-linkedin.mjs --todos --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT_DIR, 'src/content/posts');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public/blog');

const CANDIDATE_JSONS = [
  path.resolve(ROOT_DIR, 'runtime/meus_posts_linkedin.json'),
  path.resolve(ROOT_DIR, '../feed-dispatch/runtime/meus_posts_linkedin.json'),
  '/home/ubuntu/projects/repos/feed-dispatch/runtime/meus_posts_linkedin.json',
];
const DEFAULT_JSON = CANDIDATE_JSONS.find((p) => fs.existsSync(p)) || CANDIDATE_JSONS[0];

function slugify(text) {
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean.slice(0, 50).replace(/-+$/, '') || 'post-linkedin';
}

function formatDatePt(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function extractTime(post) {
  if (post.time && /^\d{2}:\d{2}/.test(post.time)) {
    return post.time.slice(0, 5);
  }
  if (post.datetime) {
    const match = post.datetime.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  if (post.collected_at) {
    const match = post.collected_at.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  return null;
}

function normalizeAlphaNum(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      resolve();
      return;
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Falha HTTP ${response.statusCode} ao baixar imagem: ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function safeYamlString(str) {
  const clean = sanitizeText(str);
  return `"${clean.replace(/\\/g, '\\\\')}"`;
}

function cleanBody(content) {
  let text = content || '';
  if (/…\s*mais|\.\.\.\s*mais/.test(text)) {
    text = text.split(/…\s*mais|\.\.\.\s*mais/)[0];
  }
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.replace(/(?:\r?\n\s*)+(?:#[a-zA-Z0-9_\u00C0-\u00FF]+\s*)+$/g, '');
  return text.trim();
}

/**
 * Deduplicação contra arquivos existentes em src/content/posts/
 */
function findExistingMatch(post, existingFiles) {
  const slug = slugify(post.title);
  const fileName = `${post.date}-${slug}.md`;

  // 1. Arquivo exato
  if (fs.existsSync(path.join(POSTS_DIR, fileName))) {
    return { exists: true, reason: `arquivo ${fileName} já existe` };
  }

  // 2. Slug idêntico em qualquer data
  const slugMatch = existingFiles.find((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, '') === `${slug}.md`);
  if (slugMatch) {
    return { exists: true, reason: `slug "${slug}" já existe no arquivo ${slugMatch}` };
  }

  // 3. Scan textual profundo por URL, URN, título ou início do corpo
  const pUrl = (post.url || '').toLowerCase();
  const pUrn = (post.id || '').toLowerCase();
  const pTitleNorm = normalizeAlphaNum(post.title);
  const pBodyNorm = normalizeAlphaNum(post.content ? post.content.slice(0, 70) : '');

  for (const f of existingFiles) {
    if (!f.endsWith('.md') || f.endsWith('.en.md')) continue;
    const fullPath = path.join(POSTS_DIR, f);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const contentNorm = normalizeAlphaNum(content);

    if (pUrl && content.toLowerCase().includes(pUrl)) {
      return { exists: true, reason: `URL vinculada em ${f}` };
    }
    if (pUrn && content.toLowerCase().includes(pUrn)) {
      return { exists: true, reason: `URN vinculada em ${f}` };
    }
    if (pTitleNorm && pTitleNorm.length > 25 && contentNorm.includes(pTitleNorm.slice(0, 35))) {
      return { exists: true, reason: `título coincide com ${f}` };
    }
    if (pBodyNorm && pBodyNorm.length > 35 && contentNorm.includes(pBodyNorm)) {
      return { exists: true, reason: `conteúdo coincide com ${f}` };
    }
  }

  return { exists: false };
}

async function importPost(post, existingFiles, options = {}) {
  const { dryRun = false, includeReposts = false } = options;

  if (post.is_shared && !includeReposts) {
    console.log(`⏩ [REPOST] Pulando compartilhamento: ${post.title ? post.title.slice(0, 50) : 'sem título'}...`);
    return { status: 'skipped', reason: 'repost' };
  }

  const slug = slugify(post.title);
  const fileName = `${post.date}-${slug}.md`;
  const filePath = path.join(POSTS_DIR, fileName);

  const check = findExistingMatch(post, existingFiles);
  if (check.exists) {
    console.log(`⚠️  Post já existe, pulando (${check.reason})`);
    return { status: 'skipped', reason: check.reason, fileName };
  }

  if (dryRun) {
    console.log(`[DRY-RUN] Seria importado post: src/content/posts/${fileName}`);
    return { status: 'dry-run', fileName, filePath };
  }

  // Tags
  const baseTags = ['linkedin'];
  if (post.tags && Array.isArray(post.tags)) {
    for (const t of post.tags) {
      const cleanTag = t
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
      if (cleanTag && !baseTags.includes(cleanTag)) {
        baseTags.push(cleanTag);
      }
    }
  }

  // Baixar imagens se houver
  const downloadedImages = [];
  if (post.images && post.images.length > 0) {
    const slugMediaDir = path.join(PUBLIC_DIR, slug);
    fs.mkdirSync(slugMediaDir, { recursive: true });

    for (let i = 0; i < post.images.length; i++) {
      const imgUrl = post.images[i];
      const imgName = `midia-${i + 1}.jpg`;
      const imgDest = path.join(slugMediaDir, imgName);
      try {
        await downloadImage(imgUrl, imgDest);
        downloadedImages.push(`/blog/${slug}/${imgName}`);
      } catch (e) {
        console.warn(`Aviso: falha ao baixar imagem ${i + 1}: ${e.message}`);
      }
    }
  }

  // Montar corpo do post limpo
  const bodyContent = cleanBody(post.content);
  const postTime = extractTime(post);
  const timeLine = postTime ? `\ntime: "${postTime}"` : '';

  let postMarkdown = `---
title: ${safeYamlString(post.title)}
date: ${post.date}${timeLine}
description: ${safeYamlString(post.description || post.title)}
tags: [${baseTags.join(', ')}]
draft: false
---

*Publicado originalmente no [LinkedIn](${post.url}) em ${formatDatePt(post.date)}.*

${bodyContent}
`;

  if (downloadedImages.length > 0) {
    postMarkdown += '\n\n---\n\n### Mídia da publicação\n\n';
    for (const imgPath of downloadedImages) {
      postMarkdown += `![Mídia do post no LinkedIn](${imgPath})\n\n`;
    }
  }

  fs.writeFileSync(filePath, postMarkdown, 'utf-8');
  console.log(`✅ Criado post: src/content/posts/${fileName}`);
  existingFiles.push(fileName);
  return { status: 'created', fileName, filePath };
}

async function main() {
  const args = process.argv.slice(2);
  let jsonPath = DEFAULT_JSON;

  const inputIdx = args.indexOf('--input');
  if (inputIdx !== -1 && args[inputIdx + 1]) {
    jsonPath = path.resolve(args[inputIdx + 1]);
  }

  if (!fs.existsSync(jsonPath)) {
    console.error(`Erro: arquivo de dados não encontrado em: ${jsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const posts = JSON.parse(raw);

  if (args.includes('--listar')) {
    console.log(`\n📋 ${posts.length} posts disponíveis em ${jsonPath}:\n`);
    posts.forEach((p, i) => {
      const tipo = p.is_shared ? '[REPOST]' : '[AUTORAL]';
      console.log(`[${String(i + 1).padStart(2, '0')}] ${tipo} ${p.date} (${p.time_text})`);
      console.log(`     Título: ${p.title}`);
      console.log(`     Link: ${p.url}\n`);
    });
    return;
  }

  const dryRun = args.includes('--dry-run');
  const includeReposts = args.includes('--incluir-reposts');

  let selectedIndices = [];
  if (args.includes('--todos') || args.includes('--apenas-novos')) {
    selectedIndices = posts.map((_, i) => i);
  } else {
    const idxArg = args.find((a) => a.startsWith('--indices=') || a.startsWith('-i='));
    let val = '';
    if (idxArg) {
      val = idxArg.split('=')[1];
    } else {
      const pIdx = args.indexOf('--indices');
      if (pIdx !== -1 && args[pIdx + 1]) val = args[pIdx + 1];
    }

    if (val) {
      selectedIndices = val
        .split(',')
        .map((s) => parseInt(s.trim(), 10) - 1)
        .filter((n) => !isNaN(n) && n >= 0 && n < posts.length);
    }
  }

  if (selectedIndices.length === 0) {
    console.log('Nenhum índice válido selecionado.');
    console.log('Use --indices 1,3,5 ou --todos para importar.');
    return;
  }

  const existingFiles = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : [];
  console.log(`\n🚀 Processando ${selectedIndices.length} posts (${dryRun ? 'MODO DRY-RUN' : 'MODO IMPORTAÇÃO'})...\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const idx of selectedIndices) {
    const p = posts[idx];
    const res = await importPost(p, existingFiles, { dryRun, includeReposts });
    if (res.status === 'created' || res.status === 'dry-run') createdCount++;
    else skippedCount++;
  }

  console.log(`\n✨ Processamento concluído: ${createdCount} novos, ${skippedCount} pulados (já existentes ou reposts).`);
}

main().catch((err) => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
