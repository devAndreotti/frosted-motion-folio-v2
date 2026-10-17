// The case pages: /projetos/<slug>/ is a page only when the build wrote it. The build lists the slugs in
// projetos/index.json (vite-plugins/projects.ts); a minute per isolate is kept, as likes.js does for blog/index.json.

export const PROJECT_PAGE = /^\/projetos\/([a-z0-9-]+)\/$/;
const SLUGS_TTL_MS = 60_000;

let published = { at: 0, slugs: new Set() };

/** The slugs of the published case pages. */
export async function publishedProjectSlugs(request, env, now = Date.now()) {
  if (now - published.at < SLUGS_TTL_MS) return published.slugs;
  let slugs = new Set();
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/projetos/index.json', request.url)));
    if (res.ok) slugs = new Set((await res.json()).slugs ?? []);
  } catch {
    // no list = every /projetos/<slug>/ is a 404, until the next try
  }
  published = { at: now, slugs };
  return slugs;
}
