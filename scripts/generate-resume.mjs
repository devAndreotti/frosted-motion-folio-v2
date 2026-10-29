#!/usr/bin/env node

/**
 * scripts/generate-resume.mjs
 *
 * Automated ATS-compliant PDF résumé generator using Playwright chromium headless.
 * Zero new npm dependencies (uses existing @playwright/test & esbuild).
 *
 * Generates:
 *   - public/curriculo.pdf (Portuguese)
 *   - public/resume.pdf (English)
 *   - docs/screenshots/resume/curriculo-ats-pt.png
 *   - docs/screenshots/resume/resume-ats-en.png
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const screenshotsDir = path.join(rootDir, 'docs', 'screenshots', 'resume');

/**
 * Load canonical project data from TypeScript sources via esbuild.
 */
async function loadCanonicalData() {
  const bundle = await esbuild.build({
    stdin: {
      contents: `
        export { personalInfo, contact } from './src/data/personal.ts';
        export { STACK_AREAS, STACK_TIERS, ALSO_KNOWN } from './src/data/skills.ts';
        export { pt } from './src/lib/i18n.pt.ts';
        export { en } from './src/lib/i18n.en.ts';
        export { CASES } from './src/data/cases.ts';
        export { NOW_PROJECTS } from './src/data/now.ts';
        export { projects } from './src/data/projects.ts';
      `,
      resolveDir: rootDir,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    alias: { '@': path.resolve(rootDir, './src') },
    external: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'three'],
  });

  const base64Code = Buffer.from(bundle.outputFiles[0].text).toString('base64');
  return import(`data:text/javascript;base64,${base64Code}`);
}

/**
 * Build HTML document for ATS standard single-column résumé.
 */
function buildResumeHtml({ lang, data }) {
  const isPt = lang === 'pt';
  const { personalInfo, contact } = data;

  const t = {
    docTitle: isPt ? `Currículo - ${personalInfo.name}` : `Resume - ${personalInfo.name}`,
    roleTitle: isPt ? personalInfo.title.pt : personalInfo.title.en,
    location: isPt ? personalInfo.location : 'São Paulo, Brazil',
    summaryHeading: isPt ? 'RESUMO PROFISSIONAL' : 'PROFESSIONAL SUMMARY',
    summaryText: isPt
      ? 'Desenvolvedor Full Stack com sólida formação em Ciência da Computação (UNIP) e experiência prática na entrega de aplicações web completas com React, TypeScript, Node.js e IA aplicada. Foco em arquitetura limpa, automação de fluxos, alta performance e garantia de qualidade com testes automatizados contínuos.'
      : 'Full Stack Developer with a strong Computer Science foundation (UNIP) and hands-on experience delivering end-to-end web applications using React, TypeScript, Node.js, and applied AI. Focused on clean architecture, workflow automation, high performance, and continuous automated testing.',
    experienceHeading: isPt ? 'EXPERIÊNCIA PROFISSIONAL' : 'PROFESSIONAL EXPERIENCE',
    educationHeading: isPt ? 'FORMAÇÃO ACADÊMICA' : 'EDUCATION',
    certificationsHeading: isPt ? 'CERTIFICAÇÕES' : 'CERTIFICATIONS',
    skillsHeading: isPt ? 'HABILIDADES TÉCNICAS' : 'TECHNICAL SKILLS',
    projectsHeading: isPt ? 'PROJETOS RELEVANTES' : 'KEY PROJECTS',
    skillsLang: isPt ? 'Linguagens & Frontend' : 'Languages & Frontend',
    skillsBack: isPt ? 'Backend & Banco de Dados' : 'Backend & Databases',
    skillsDevOps: isPt ? 'DevOps, Ferramentas & Mobile' : 'DevOps, Tools & Mobile',
  };

  const experiences = isPt
    ? [
        {
          title: 'Desenvolvedor Full Stack Júnior',
          company: 'Projeto de Cliente',
          period: '2025 - Presente',
          bullets: [
            'Desenvolvimento full stack ponta a ponta de aplicações web reativas com React, TypeScript, Node.js e Tailwind CSS.',
            'Integração de inteligência artificial aplicada (LLMs) e automação de fluxos operacionais para clientes.',
            'Práticas de excelência em engenharia: suítes de testes automatizados, acessibilidade e esteiras de CI/CD.',
          ],
        },
        {
          title: 'Jovem Aprendiz',
          company: 'Pulse Client Experts',
          period: '2024 - 2025',
          bullets: [
            'Manutenção técnica e atualização contínua do website institucional da empresa.',
            'Organização, modelagem e automação de dados operacionais utilizando Microsoft Excel.',
            'Execução de rotinas administrativas, despacho de correspondências e auditorias de conformidade interna.',
          ],
        },
      ]
    : [
        {
          title: 'Junior Full Stack Developer',
          company: 'Client Project',
          period: '2025 - Present',
          bullets: [
            'End-to-end full stack web application development using React, TypeScript, Node.js, and Tailwind CSS.',
            'Integration of applied artificial intelligence (LLMs) and operational process automation for clients.',
            'Engineering excellence: automated testing suites, accessibility standards, and CI/CD quality pipelines.',
          ],
        },
        {
          title: 'Youth Apprentice',
          company: 'Pulse Client Experts',
          period: '2024 - 2025',
          bullets: [
            'Technical maintenance and continuous updates for the company institutional website.',
            'Structured data management and workflow automation using advanced Microsoft Excel.',
            'Executed administrative routines, postal dispatch logistics, and internal policy compliance audits.',
          ],
        },
      ];

  const education = isPt
    ? [
        {
          degree: 'Bacharelado em Ciência da Computação',
          institution: 'UNIP (Universidade Paulista)',
          period: '2023 - 2027',
          details: 'Formação em algoritmos, estruturas de dados, arquitetura de sistemas, redes e engenharia de software.',
        },
        {
          degree: 'Curso Técnico em Informática',
          institution: 'Formação Profissionalizante',
          period: '2021',
          details: 'Lógica de programação, desenvolvimento web e móvel com HTML, CSS, JavaScript e React Native.',
        },
      ]
    : [
        {
          degree: 'B.S. in Computer Science',
          institution: 'UNIP (Universidade Paulista)',
          period: '2023 - 2027',
          details: 'Coursework in algorithms, data structures, systems architecture, computer networks, and software engineering.',
        },
        {
          degree: 'Technical Diploma in Information Technology',
          institution: 'Vocational Training',
          period: '2021',
          details: 'Software engineering fundamentals, programming logic, web and mobile development with HTML, CSS, JavaScript, and React Native.',
        },
      ];

  const certifications = isPt
    ? [
        {
          title: 'CyberOps Associate',
          issuer: 'Cisco',
          period: '2026',
          details: 'Operações e monitoramento de segurança cibernética (SOC), análise de tráfego de rede e resposta a incidentes.',
        },
      ]
    : [
        {
          title: 'CyberOps Associate',
          issuer: 'Cisco',
          period: '2026',
          details: 'Cybersecurity operations, SOC monitoring, network traffic analysis, vulnerability assessment, and incident response.',
        },
      ];

  const topProjects = isPt
    ? [
        {
          name: 'Git Wizard Commander',
          tech: 'React, TypeScript, Tailwind CSS, Git',
          desc: 'Plataforma interativa para ensino prático e visual de Git, simulando árvores de commits, ramificações e exercícios interativos.',
        },
        {
          name: 'Gold Portfolio Analyzer',
          tech: 'React, TypeScript, Tailwind CSS, Recharts, Supabase',
          desc: 'Ferramenta analítica de otimização de carteiras de investimentos para o mercado brasileiro, com cálculo de risco e gráficos interativos.',
        },
        {
          name: 'Cook App',
          tech: 'React Native, Expo, Supabase, TypeScript',
          desc: 'Aplicativo mobile multiplataforma (iOS e Android) que sugere receitas culinárias baseadas nos ingredientes disponíveis na despensa.',
        },
        {
          name: 'Crumple',
          tech: 'WebGL2, TypeScript, GLSL',
          desc: 'Biblioteca gráfica WebGL2 sem dependências (~35 KB) que simula desdobramento de folha de papel amassado com shaders e iluminação dinâmica.',
        },
        {
          name: 'Memory Apartment',
          tech: 'Godot 4, GDScript, Blender',
          desc: 'Jogo 3D de terror psicológico e investigação em primeira pessoa, com manipulação ambiental dinâmica e modelagem de cenários.',
        },
      ]
    : [
        {
          name: 'Git Wizard Commander',
          tech: 'React, TypeScript, Tailwind CSS, Git',
          desc: 'Interactive platform for visual, hands-on Git learning, simulating commit trees, branching workflows, and interactive challenges.',
        },
        {
          name: 'Gold Portfolio Analyzer',
          tech: 'React, TypeScript, Tailwind CSS, Recharts, Supabase',
          desc: 'Smart portfolio optimization and analysis tool for the Brazilian market, calculating asset diversification and risk with interactive charts.',
        },
        {
          name: 'Cook App',
          tech: 'React Native, Expo, Supabase, TypeScript',
          desc: 'Cross-platform mobile application (iOS/Android) for recipe recommendations based on pantry ingredients, backed by Supabase RPC.',
        },
        {
          name: 'Crumple',
          tech: 'WebGL2, TypeScript, GLSL',
          desc: 'Zero-dependency WebGL2 graphics library (~35 KB) simulating paper unfolding physics with dynamic lighting, creases, and custom shaders.',
        },
        {
          name: 'Memory Apartment',
          tech: 'Godot 4, GDScript, Blender',
          desc: 'First-person 3D psychological horror and investigation game, featuring dynamic environmental anomalies and custom 3D modeling.',
        },
      ];

  return `<!DOCTYPE html>
<html lang="${isPt ? 'pt-BR' : 'en'}">
<head>
<meta charset="UTF-8">
<title>${t.docTitle}</title>
<style>
  @page {
    size: A4;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    background: #ffffff;
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.1pt;
    line-height: 1.36;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .resume-page {
    width: 210mm;
    min-height: 297mm;
    box-sizing: border-box;
    margin: 0 auto;
    padding: 15mm 20mm 14mm 20mm;
    background: #ffffff;
  }
  header {
    margin-bottom: 10px;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 6px;
  }
  h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
    line-height: 1.1;
  }
  .role-title {
    font-size: 11pt;
    font-weight: 600;
    color: #1d4ed8;
    margin-top: 2px;
  }
  .contacts {
    margin-top: 4px;
    font-size: 8.1pt;
    color: #475569;
    white-space: nowrap;
  }
  .contacts a {
    color: #0f172a;
    text-decoration: none;
  }
  .contacts .sep {
    margin: 0 4px;
    color: #94a3b8;
  }
  section {
    margin-bottom: 9.5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  h2 {
    font-size: 9.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    color: #0f172a;
    border-bottom: 1.5px solid #0f172a;
    padding-bottom: 2px;
    margin-bottom: 5.5px;
  }
  .summary-p {
    font-size: 8.85pt;
    color: #334155;
    line-height: 1.36;
  }
  .entry {
    margin-bottom: 5.5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.0pt;
  }
  .entry-title {
    font-weight: 700;
    color: #0f172a;
  }
  .entry-subtitle {
    font-weight: 600;
    color: #334155;
  }
  .entry-date {
    font-size: 8.6pt;
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .entry-desc {
    font-size: 8.6pt;
    color: #475569;
    margin-top: 1.5px;
    line-height: 1.34;
  }
  ul {
    margin-left: 16px;
    margin-top: 2px;
  }
  li {
    font-size: 8.6pt;
    margin-bottom: 2px;
    color: #334155;
    line-height: 1.34;
  }
  .skill-row {
    font-size: 8.7pt;
    margin-bottom: 2.5px;
    line-height: 1.36;
    color: #334155;
  }
  .skill-category {
    font-weight: 700;
    color: #0f172a;
  }
  .project-row {
    margin-bottom: 5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .project-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9.0pt;
  }
  .project-name {
    font-weight: 700;
    color: #0f172a;
  }
  .project-tech {
    font-size: 8.2pt;
    font-weight: 500;
    color: #64748b;
  }
  .project-desc {
    font-size: 8.5pt;
    color: #334155;
    margin-top: 1.5px;
    line-height: 1.34;
  }
</style>
</head>
<body>
  <div class="resume-page">
    <header>
      <h1>${personalInfo.name}</h1>
      <div class="role-title">${t.roleTitle}</div>
      <div class="contacts">
        <span>${t.location}</span>
        <span class="sep">•</span>
        <a href="mailto:${contact.email}">${contact.email}</a>
        <span class="sep">•</span>
        <a href="${contact.github}">github.com/devAndreotti</a>
        <span class="sep">•</span>
        <a href="${contact.linkedin}">linkedin.com/in/ricardo-andreotti</a>
      </div>
    </header>

    <section>
      <h2>${t.summaryHeading}</h2>
      <p class="summary-p">${t.summaryText}</p>
    </section>

    <section>
      <h2>${t.experienceHeading}</h2>
      ${experiences
        .map(
          (exp) => `
      <div class="entry">
        <div class="entry-header">
          <span><span class="entry-title">${exp.title}</span> <span class="entry-subtitle">· ${exp.company}</span></span>
          <span class="entry-date">${exp.period}</span>
        </div>
        <ul>
          ${exp.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.educationHeading}</h2>
      ${education
        .map(
          (edu) => `
      <div class="entry">
        <div class="entry-header">
          <span><span class="entry-title">${edu.degree}</span> <span class="entry-subtitle">· ${edu.institution}</span></span>
          <span class="entry-date">${edu.period}</span>
        </div>
        <p class="entry-desc">${edu.details}</p>
      </div>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.certificationsHeading}</h2>
      ${certifications
        .map(
          (cert) => `
      <div class="entry">
        <div class="entry-header">
          <span><span class="entry-title">${cert.title}</span> <span class="entry-subtitle">· ${cert.issuer}</span></span>
          <span class="entry-date">${cert.period}</span>
        </div>
        <p class="entry-desc">${cert.details}</p>
      </div>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.skillsHeading}</h2>
      <div class="skill-row"><span class="skill-category">${t.skillsLang}:</span> React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, WebGL2, Next.js, Vite</div>
      <div class="skill-row"><span class="skill-category">${t.skillsBack}:</span> Node.js, NestJS, Python, SQL, PostgreSQL, Supabase, RESTful APIs</div>
      <div class="skill-row"><span class="skill-category">${t.skillsDevOps}:</span> Docker, Git, CI/CD, GitHub Actions, Linux, React Native, Expo, n8n</div>
    </section>

    <section>
      <h2>${t.projectsHeading}</h2>
      ${topProjects
        .map(
          (p) => `
      <div class="project-row">
        <div class="project-meta">
          <span class="project-name">${p.name}</span>
          <span class="project-tech">${p.tech}</span>
        </div>
        <p class="project-desc">${p.desc}</p>
      </div>`
        )
        .join('')}
    </section>
  </div>
</body>
</html>`;
}

/**
 * Main generator execution.
 */
async function main() {
  console.log('[resume] Loading canonical data from repository sources...');
  const data = await loadCanonicalData();

  console.log('[resume] Launching Playwright chromium headless...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 850, height: 1200 });

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const targets = [
    {
      lang: 'pt',
      destPdf: path.join(publicDir, 'curriculo.pdf'),
      destShot: path.join(screenshotsDir, 'curriculo-ats-pt.png'),
    },
    {
      lang: 'en',
      destPdf: path.join(publicDir, 'resume.pdf'),
      destShot: path.join(screenshotsDir, 'resume-ats-en.png'),
    },
  ];

  for (const target of targets) {
    console.log(`[resume] Rendering ${target.lang.toUpperCase()} ATS résumé to ${target.destPdf}...`);
    const html = buildResumeHtml({ lang: target.lang, data });
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
      printBackground: true,
    });

    fs.writeFileSync(target.destPdf, pdfBuffer);

    // Count pages in PDF buffer
    const pageMatches = pdfBuffer.toString('latin1').match(/\/Type\s*\/Page\b/g);
    const pageCount = pageMatches ? pageMatches.length : 1;

    console.log(`[resume] Generated ${path.basename(target.destPdf)}: ${pdfBuffer.length} bytes, ${pageCount} page(s).`);

    const element = await page.$('.resume-page');
    if (element) {
      await element.screenshot({ path: target.destShot });
      console.log(`[resume] Saved visual snapshot to ${target.destShot}`);
    }
  }

  await browser.close();
  console.log('[resume] Done! All ATS PDFs and screenshots generated successfully.');
}

main().catch((err) => {
  console.error('[resume] Fatal error generating PDFs:', err);
  process.exit(1);
});
