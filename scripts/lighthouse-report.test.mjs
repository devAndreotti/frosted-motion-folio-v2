import { describe, expect, it } from 'vitest';
import { BUDGET, MARKER, renderReport, summarize } from './lighthouse-report.mjs';

const lhr = (url, form, perf, lcp, cls = 0, tbt = 0) => ({
  requestedUrl: url,
  configSettings: { emulatedFormFactor: form },
  categories: {
    performance: { score: perf },
    accessibility: { score: 1 },
    'best-practices': { score: 1 },
    seo: { score: 1 },
  },
  audits: {
    'largest-contentful-paint': { numericValue: lcp },
    'cumulative-layout-shift': { numericValue: cls },
    'total-blocking-time': { numericValue: tbt },
  },
});

describe('relatório do Lighthouse', () => {
  it('usa a mediana das execuções de cada página e formato', () => {
    const rows = summarize([
      lhr('http://localhost:9001/', 'mobile', 0.8, 1000),
      lhr('http://localhost:9001/', 'mobile', 0.9, 3000),
      lhr('http://localhost:9001/', 'mobile', 1.0, 2000),
      lhr('http://localhost:9001/blog/', 'desktop', 0.95, 1500),
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ page: '/', form: 'mobile', runs: 3, performance: 90, lcpMs: 2000 });
    expect(rows[1]).toMatchObject({ page: '/blog/', form: 'desktop', runs: 1, performance: 95 });
  });

  it('marca só com ⚠️ o que passa do orçamento, sem falhar', () => {
    const rows = summarize([lhr('http://x/', 'mobile', 0.5, 4000, 0.3, 500)]);
    const report = renderReport(rows, { commit: 'abcdef123456', runs: 1 });
    expect(report.startsWith(MARKER)).toBe(true);
    expect(report).toContain('commit `abcdef1`');
    expect(report).toContain(`desempenho ≥ ${BUDGET.performance}`);
    expect(report).toContain('50 ⚠️');
    expect(report).toContain('4,0 s ⚠️');
    expect(report).toContain('0,30 ⚠️');
    expect(report).toContain('500 ms ⚠️');
    expect(report).toContain('| 100 | 100 | 100 |');
  });
});
