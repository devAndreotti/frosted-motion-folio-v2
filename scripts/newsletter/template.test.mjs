import { describe, expect, it } from 'vitest';
import { HUE_WEIGHTS, palette, pickHue, renderNewsletter, toRgb } from './template.mjs';
import { SAMPLE } from './sample.mjs';

describe('pickHue', () => {
  it('is the same for the same week, and the weights add up to 100', () => {
    expect(Object.values(HUE_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
    expect(pickHue(43)).toBe(pickHue(43));
  });

  it('gives the default colour about half of the time and every other colour some', () => {
    const count = {};
    for (let week = 1; week <= 5000; week++) count[pickHue(week)] = (count[pickHue(week)] ?? 0) + 1;
    expect(count.black / 5000).toBeGreaterThan(0.45);
    expect(count.black / 5000).toBeLessThan(0.6);
    for (const hue of ['blue', 'purple', 'orange', 'red', 'green', 'yellow']) expect(count[hue]).toBeGreaterThan(200);
  });
});

describe('toRgb', () => {
  it('turns the site hsl tokens into hex and rgba, which every mail client reads', () => {
    expect(toRgb('hsl(0 0% 100%)')).toBe('#ffffff');
    expect(toRgb('hsl(0 0% 0% / 0.5)')).toBe('rgba(0,0,0,0.5)');
    expect(toRgb('#3b82f6')).toBe('#3b82f6');
  });

  it('leaves no hsl() in any palette', () => {
    for (const hue of ['black', 'blue', 'purple', 'orange', 'red', 'green', 'yellow']) {
      for (const mode of ['light', 'dark']) expect(JSON.stringify(palette(hue, mode))).not.toContain('hsl(');
    }
  });
});

describe('renderNewsletter', () => {
  const { html, text, hue } = renderNewsletter(SAMPLE.pt, { hue: 'blue' });

  it('has a light base and a dark scheme, with the chosen accent', () => {
    expect(hue).toBe('blue');
    expect(html).toContain('prefers-color-scheme: dark');
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain('#2563eb'); // blue accent, light
    expect(html).toContain('#3b82f6'); // blue accent, dark
    expect(html).not.toContain('hsl(');
  });

  it('shows the posts, the behind-the-scenes note, the links and the unsubscribe link', () => {
    expect(html).toContain('A memória do projeto não deveria ser refém do provedor de IA');
    expect(html).toContain('Bastidores');
    expect(html).toContain('Exemplo de link curado');
    expect(html).toContain(SAMPLE.pt.unsubscribeUrl);
    expect(text).toContain(SAMPLE.pt.unsubscribeUrl);
    expect(text).toContain('https://devandreotti.com/blog/ai-memory-memoria-do-projeto/');
  });

  it('escapes what comes from posts and links', () => {
    const out = renderNewsletter({ ...SAMPLE.pt, posts: [{ title: '<b>x</b> & "y"', description: '', minutes: 1, tags: [], url: 'https://a.example/?a=1&b=2' }] }, { hue: 'black' });
    expect(out.html).toContain('&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;');
    expect(out.html).toContain('a=1&amp;b=2');
  });

  it('leaves out the sections that have nothing in them, and speaks English when asked', () => {
    const out = renderNewsletter({ ...SAMPLE.pt, lang: 'en', behind: undefined, links: [] }, { hue: 'red' });
    expect(out.html).not.toContain('Behind the scenes');
    expect(out.html).not.toContain('Worth reading this week');
    expect(out.html).toContain('lang="en"');
    expect(out.html).toContain('Unsubscribe');
  });
});
