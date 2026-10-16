import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { CASES } from '../src/data/cases';
import { extendSitemapWithCases, projectsIndex, renderCasePage } from '../src/lib/projects/page';

// The case pages: after a build, writes projetos/<slug>/index.html for every case (the popup's
// projects, see src/data/cases.ts), projetos/index.json (the slugs the Worker accepts) and the
// sitemap entries. Same pattern as vite-plugins/blog.ts.

function write(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function projectsPlugin(): Plugin {
  let isBuild = false;
  let outDir = '';
  let base = '/';
  return {
    name: 'projects-pages',
    configResolved(config) {
      isBuild = config.command === 'build';
      outDir = path.resolve(config.root, config.build.outDir);
      base = config.base;
    },
    closeBundle() {
      if (!isBuild) return;
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      for (const project of CASES) write(path.join(outDir, 'projetos', project.slug, 'index.html'), renderCasePage(template, project, base));
      write(path.join(outDir, 'projetos/index.json'), projectsIndex(CASES));
      const sitemap = path.join(outDir, 'sitemap.xml');
      if (fs.existsSync(sitemap)) write(sitemap, extendSitemapWithCases(fs.readFileSync(sitemap, 'utf8'), CASES));
    },
  };
}
