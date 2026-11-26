import { describe, expect, it } from 'vitest';
import { activityId, cleanBody, dateFromActivity, findExisting, isJunkTitle, normalizePost, renderPost, titleFromBody } from './importar-linkedin.mjs';

// Card exatamente como o coletor entrega (headline, tempo relativo, "… mais", contadores e espaços invisíveis).
const CARD = [
  'Desenvolvedor Full-Stack | Python, React & TypeScript | Automação com n8n & IA | Estudante de CC - 8º semestre',
  '',
  '1 m •',
  '',
  '"Um grande fod*-se para os provedores de IA e o lock-in que eles tentam empurrar."',
  '',
  'Ontem, Fabio Akita esteve no Flow e falou sobre essa armadilha. Se você programa com IA, provavelmente já percebeu.',
  '',
  '#IA #MCP',
  '… mais',
  '',
  '7',
  '2',
  '​',
].join('\n');

const RAW = {
  id: 'urn:li:activity:7516483324803063808',
  url: 'https://www.linkedin.com/feed/update/urn:li:activity:7516483324803063808/',
  title: '1 m •',
  description: 'Desenvolvedor Full-Stack | Python, React & TypeScript | Automação com n8n & IA | Estudante de CC - 8º semestre 1 m •',
  date: '2026-11-25',
  content: CARD,
  images: [],
  is_shared: false,
  tags: ['inteligenciaartificial', 'MCP'],
};

describe('importar-linkedin', () => {
  it('extrai o id da atividade do URN e da URL', () => {
    expect(activityId(RAW.id)).toBe('7516483324803063808');
    expect(activityId(RAW.url)).toBe('7516483324803063808');
    expect(activityId('https://example.com')).toBeNull();
  });

  it('tira a data real do snowflake da atividade, não do dia da coleta', () => {
    expect(dateFromActivity('7516483324803063808')).toEqual({ date: '2026-10-15', time: '10:01' });
    expect(dateFromActivity(null)).toBeNull();
    expect(dateFromActivity('1')).toBeNull();
  });

  it('reconhece título lixo ("1 m •", "3 sem • Editado •")', () => {
    expect(isJunkTitle('1 m •')).toBe(true);
    expect(isJunkTitle('3 sem • Editado •')).toBe(true);
    expect(isJunkTitle('')).toBe(true);
    expect(isJunkTitle('Quality Gate: verificações locais')).toBe(false);
  });

  it('limpa headline, tempo relativo, "… mais", contadores e hashtags finais', () => {
    const body = cleanBody(CARD);
    expect(body.startsWith('"Um grande fod*-se')).toBe(true);
    expect(body).not.toMatch(/Desenvolvedor Full-Stack|1 m •|mais|#IA|​/);
    expect(body.endsWith('já percebeu.')).toBe(true);
  });

  it('título vem da primeira linha: citação inteira perde as aspas, aspas no meio ficam', () => {
    expect(titleFromBody('"Frase citada."\n\nresto')).toBe('Frase citada.');
    expect(titleFromBody('Vídeo chamado "X em C++"\nresto')).toBe('Vídeo chamado "X em C++"');
    expect(titleFromBody(`${'palavra '.repeat(20)}fim`).endsWith('...')).toBe(true);
  });

  it('normaliza o card cru num post com título, data e slug decentes', () => {
    const post = normalizePost(RAW);
    expect(post).toMatchObject({ id: '7516483324803063808', date: '2026-10-15', time: '10:01' });
    expect(post.title.startsWith('Um grande fod*-se')).toBe(true);
    expect(post.slug).not.toBe('1-m');
    expect(post.description).not.toMatch(/Desenvolvedor Full-Stack/);
    expect(post.tags).toEqual(['linkedin', 'inteligenciaartificial', 'mcp']);
  });

  it('dedup pelo id: post curado com `linkedin:` no front matter não volta', () => {
    const post = normalizePost(RAW);
    const curated = { file: '2026-10-15-ai-memory.md', content: '---\ntitle: Outro título\nlinkedin: urn:li:activity:7516483324803063808\n---\ntexto reescrito' };
    expect(findExisting(post, [curated])).toMatch(/atividade 7516483324803063808/);
  });

  it('o headline do perfil não faz posts diferentes parecerem iguais', () => {
    const a = normalizePost(RAW);
    const other = { file: 'x.md', content: renderPost(normalizePost({ ...RAW, id: 'urn:li:activity:7464637618132066304', url: 'u', content: CARD.replace(/"Um grande[\s\S]*percebeu\./, 'Outro post completamente diferente sobre supply chain no npm e extensões do VS Code.') })) };
    expect(findExisting(a, [other])).toBeNull();
  });

  it('dedup pelo texto quando o id não aparece', () => {
    const post = normalizePost(RAW);
    expect(findExisting(post, [{ file: 'y.md', content: post.body }])).toMatch(/texto coincide/);
  });

  it('renderiza front matter com linkedin e o link de origem', () => {
    const md = renderPost(normalizePost(RAW), ['/blog/x/midia-1.jpg']);
    expect(md).toMatch(/^---\ntitle: "/);
    expect(md).toContain('linkedin: urn:li:activity:7516483324803063808');
    expect(md).toContain('date: 2026-10-15\ntime: "10:01"');
    expect(md).toContain('em 15/10/2026');
    expect(md).toContain('![Mídia do post no LinkedIn](/blog/x/midia-1.jpg)');
  });
});
