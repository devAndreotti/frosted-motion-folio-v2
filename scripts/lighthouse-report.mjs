#!/usr/bin/env node
// Lighthouse CI report (roadmap item 12). Reads the LHR files that `lhci collect` writes to a folder and
// prints one Markdown table: the median of the runs of each page and form factor. The budget is a warning
// only (a ⚠️ mark), it never fails the job: the roadmap says to report first, enforce later.
//
// usage: node scripts/lighthouse-report.mjs --dir .lighthouseci --out lighthouse-report.md [--commit <sha>]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

export const MARKER = '<!-- lighthouse-ci-report -->';

/** The budget from docs/roadmap.md (item 12): performance and accessibility scores, LCP, CLS, TBT. */
export const BUDGET = { performance: 90, accessibility: 95, lcpMs: 2500, cls: 0.1, tbtMs: 200 };

const median = (values) => {
  const sorted = values.filter((v) => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** One row per (page, form factor): the medians of the runs. */
export function summarize(lhrs) {
  const groups = new Map();
  for (const lhr of lhrs) {
    const form = lhr.configSettings?.emulatedFormFactor === 'desktop' ? 'desktop' : 'mobile';
    const page = new URL(lhr.requestedUrl ?? lhr.finalUrl).pathname;
    const key = `${page}\u0000${form}`;
    if (!groups.has(key)) groups.set(key, { page, form, runs: [] });
    groups.get(key).runs.push(lhr);
  }
  return [...groups.values()]
    .sort((a, b) => a.page.localeCompare(b.page) || a.form.localeCompare(b.form))
    .map(({ page, form, runs }) => {
      const score = (cat) => median(runs.map((r) => (r.categories?.[cat]?.score ?? NaN) * 100));
      const audit = (id) => median(runs.map((r) => r.audits?.[id]?.numericValue));
      return {
        page,
        form,
        runs: runs.length,
        performance: score('performance'),
        accessibility: score('accessibility'),
        bestPractices: score('best-practices'),
        seo: score('seo'),
        lcpMs: audit('largest-contentful-paint'),
        cls: audit('cumulative-layout-shift'),
        tbtMs: audit('total-blocking-time'),
      };
    });
}

const num = (value, digits = 0) => (value === null ? '—' : value.toFixed(digits).replace('.', ','));
const flag = (bad) => (bad ? ' ⚠️' : '');

export function renderTable(rows) {
  const head = '| Página | Formato | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |';
  const sep = '|---|---|---:|---:|---:|---:|---:|---:|---:|';
  const lines = rows.map((r) =>
    [
      `\`${r.page}\``,
      r.form === 'desktop' ? 'desktop' : 'mobile',
      `${num(r.performance)}${flag(r.performance !== null && r.performance < BUDGET.performance)}`,
      `${num(r.accessibility)}${flag(r.accessibility !== null && r.accessibility < BUDGET.accessibility)}`,
      num(r.bestPractices),
      num(r.seo),
      `${r.lcpMs === null ? '—' : `${num(r.lcpMs / 1000, 1)} s`}${flag(r.lcpMs !== null && r.lcpMs > BUDGET.lcpMs)}`,
      `${num(r.cls, 2)}${flag(r.cls !== null && r.cls > BUDGET.cls)}`,
      `${num(r.tbtMs)} ms${flag(r.tbtMs !== null && r.tbtMs > BUDGET.tbtMs)}`,
    ].join(' | ')
  );
  return [head, sep, ...lines.map((line) => `| ${line} |`)].join('\n');
}

export function renderReport(rows, { commit, runs } = {}) {
  const budget = `desempenho ≥ ${BUDGET.performance}, acessibilidade ≥ ${BUDGET.accessibility}, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms`;
  return [
    MARKER,
    '### Lighthouse',
    '',
    `Mediana de ${runs ?? 'N'} execuções por página${commit ? `, commit \`${commit.slice(0, 7)}\`` : ''}. ` +
      `Orçamento (${budget}) só como aviso: ⚠️ marca o que está abaixo, o CI não falha por isso.`,
    '',
    renderTable(rows),
    '',
  ].join('\n');
}

/** Every lhr-*.json under the folder (the mobile and desktop runs keep their own sub-folders). */
function readLhrs(dir) {
  if (!fs.existsSync(dir)) throw new Error(`lighthouse-report: a pasta ${dir} não existe (o collect falhou?)`);
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((file) => /(^|[\\/])lhr-[^\\/]*\.json$/.test(file))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
}

function main() {
  const { values } = parseArgs({
    options: { dir: { type: 'string', default: '.lighthouseci' }, out: { type: 'string' }, commit: { type: 'string' } },
  });
  const lhrs = readLhrs(values.dir);
  if (lhrs.length === 0) throw new Error(`lighthouse-report: nenhum lhr-*.json em ${values.dir}`);
  const rows = summarize(lhrs);
  const runs = Math.max(...rows.map((r) => r.runs));
  const report = renderReport(rows, { commit: values.commit, runs });
  if (values.out) fs.writeFileSync(values.out, report);
  process.stdout.write(report);
}

if (process.argv[1]?.endsWith('lighthouse-report.mjs')) main();
