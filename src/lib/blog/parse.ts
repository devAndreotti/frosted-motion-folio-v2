import type { PostMeta } from './types';

// The front matter is a small YAML subset -- `key: value` lines, quoted or not,
// `[a, b]` lists and true/false -- which is all a post needs and keeps a YAML
// parser out of the build.
const FRONT = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;

type Value = string | string[] | boolean;

function unquote(text: string): string {
  const t = text.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t[t.length - 1] === t[0]) return t.slice(1, -1);
  return t;
}

function parseValue(raw: string): Value {
  const text = raw.trim();
  if (text === 'true' || text === 'false') return text === 'true';
  if (text.startsWith('[') && text.endsWith(']')) {
    return text
      .slice(1, -1)
      .split(',')
      .map(unquote)
      .filter(Boolean);
  }
  return unquote(text);
}

/** Splits `---` front matter from the Markdown body. No front matter = empty data. */
export function splitFrontmatter(raw: string): { data: Record<string, Value>; body: string } {
  const match = FRONT.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, Value> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon <= 0 || line.trimStart().startsWith('#')) continue;
    data[line.slice(0, colon).trim()] = parseValue(line.slice(colon + 1));
  }
  return { data, body: raw.slice(match[0].length) };
}

/** `2026-10-15-meu-post.md` -> `meu-post`: the date prefix only orders the files. */
export function slugFromPath(file: string): string {
  const name = file.split(/[\\/]/).pop() ?? '';
  return name.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function readingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function validDay(day: string): boolean {
  if (!DAY.test(day)) return false;
  const parsed = new Date(`${day}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(day);
}

/**
 * Reads one post file. A post the build can't publish correctly (no title, a bad
 * date, a slug that is not URL-safe) fails the build with the file's name, instead
 * of going out broken.
 */
export function parsePost(file: string, raw: string): { meta: PostMeta; body: string } {
  const { data, body } = splitFrontmatter(raw);
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : slugFromPath(file);
  const fail = (why: string) => new Error(`blog: ${file}: ${why}`);
  if (!SLUG.test(slug)) throw fail(`slug "${slug}" must be lower-case letters, digits and hyphens`);
  if (typeof data.title !== 'string' || !data.title) throw fail('missing "title"');
  if (typeof data.date !== 'string' || !validDay(data.date)) throw fail('"date" must be YYYY-MM-DD');
  const tags = Array.isArray(data.tags) ? data.tags : typeof data.tags === 'string' && data.tags ? [data.tags] : [];
  return {
    meta: {
      slug,
      title: data.title,
      date: data.date,
      description: typeof data.description === 'string' ? data.description : '',
      tags: tags.map((tag) => tag.toLowerCase()),
      minutes: readingMinutes(body),
      draft: data.draft === true,
    },
    body,
  };
}
