import type { CuratedProject } from '../../data/curatedProjects';
import { applyHead, escapeHtml, injectRoot, SITE } from '../blog/page';
import { casePath } from './caseLink';

// Build-time only (see vite-plugins/projects.ts): one HTML page per case, /projetos/<slug>/, with its own
// head and a readable body. In a browser React replaces #root on mount and opens the same case in the popup.

export const caseUrl = (slug: string) => `${SITE}${casePath(slug)}`;

const assetUrl = (base: string, src: string) => `${base}${src.replace(/^\.\//, '')}`;

export function renderCasePage(template: string, project: CuratedProject, base: string): string {
  const url = caseUrl(project.slug);
  const title = `${project.title} — Ricardo A. Gonçalves`;
  const description = project.description.pt;
  const points = project.points.pt.map((point) => `<li>${escapeHtml(point)}</li>`).join('');
  const tags = project.technologies.map((tech) => `<li class="tag">${escapeHtml(tech)}</li>`).join('');
  const links = [
    project.liveUrl && `<a class="btn btn-pri btn-sm" href="${escapeHtml(project.liveUrl)}" rel="noopener noreferrer">Ver demo</a>`,
    project.githubUrl && `<a class="btn btn-gh btn-sm" href="${escapeHtml(project.githubUrl)}" rel="noopener noreferrer">Código no GitHub</a>`,
  ]
    .filter(Boolean)
    .join(' ');
  const markup =
    `<main class="wrap blog-main"><article class="post" lang="pt-BR">` +
    `<a class="post-back" href="${base}#projects">~/projetos</a>` +
    `<p class="post-meta">${escapeHtml(project.type.pt)}</p>` +
    `<h1 class="post-h">${escapeHtml(project.title)}</h1>` +
    `<p>${escapeHtml(project.long.pt)}</p>` +
    (points ? `<h2>O que eu fiz</h2><ul>${points}</ul>` : '') +
    `<ul class="tags">${tags}</ul>` +
    (links ? `<p class="acts">${links}</p>` : '') +
    `<img src="${escapeHtml(assetUrl(base, project.image))}" alt="${escapeHtml(`Screenshot 1 de ${project.title}`)}" /></article></main>`;
  const head = applyHead(template, {
    title,
    description,
    url,
    type: 'article',
    alternates: [
      { hreflang: 'pt-BR', href: url },
      { hreflang: 'en', href: `${url}?lang=en` },
      { hreflang: 'x-default', href: url },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description,
      url,
      inLanguage: 'pt-BR',
      keywords: project.technologies.join(', '),
      image: `${SITE}/${project.image.replace(/^\.\//, '')}`,
      ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
      author: { '@type': 'Person', name: 'Ricardo A. Gonçalves', url: `${SITE}/` },
    },
  });
  return injectRoot(head, markup);
}

/** The slugs the Worker accepts under /projetos/<slug>/ (projetos/index.json). */
export const projectsIndex = (cases: CuratedProject[]) => JSON.stringify({ slugs: cases.map((c) => c.slug) });

/** Adds every case page to the sitemap (public/sitemap.xml, copied into the build). */
export function extendSitemapWithCases(sitemap: string, cases: CuratedProject[]): string {
  if (!sitemap.includes('</urlset>')) throw new Error('projects: sitemap.xml has no </urlset>');
  const entries = cases
    .map((c) => `  <url>\n    <loc>${caseUrl(c.slug)}</loc>\n    <changefreq>yearly</changefreq>\n  </url>\n`)
    .join('');
  return sitemap.replace('</urlset>', `${entries}</urlset>`);
}
