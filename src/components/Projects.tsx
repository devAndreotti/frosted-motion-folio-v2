import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/data/projects';
import { featuredProject, curatedProjects, CATEGORY_FILTERS, CuratedProject, ProjectCategory } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import CaseModal from './CaseModal';

const OTHERS_COUNT = projects.length - (curatedProjects.length + 1);

const Projects = () => {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<ProjectCategory | 'all'>('all');
  const [openProject, setOpenProject] = useState<CuratedProject | null>(null);

  const filtered = filter === 'all' ? curatedProjects : curatedProjects.filter((p) => p.cat === filter);

  return (
    <section id="projects" className="relative py-20 md:py-32 overflow-hidden">
      <div
        className="absolute -top-40 right-0 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-end justify-between gap-5 flex-wrap mb-3">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-7 h-0.5" style={{ background: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
                {t.projects.sectionLabel}
              </span>
            </div>
            <h2 className="text-[28px] md:text-[34px] font-extrabold max-w-2xl leading-tight">{t.projects.title}</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className="glass px-4 py-2.5 rounded-full text-[12.5px] font-semibold transition-colors"
                  style={{
                    background: active ? 'var(--accent)' : undefined,
                    color: active ? 'var(--accent-text)' : 'var(--fg-2)',
                  }}
                >
                  {t.projects.categoryFilters[f.key]}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-[14.5px] max-w-lg mb-10" style={{ color: 'var(--fg-4)' }}>
          {t.projects.subtitle}
        </p>

        {/* featured case */}
        <div className="glass-strong relative rounded-[28px] p-8 md:p-11 grid md:grid-cols-2 gap-10 items-center mb-6 overflow-hidden">
          <div
            className="absolute top-6 -right-12 w-44 text-center rotate-45 py-1.5 text-[11px] font-extrabold uppercase tracking-wide"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {t.projects.featuredBadge}
          </div>

          <div>
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-5" style={{ background: 'var(--surface-2)' }}>
              {t.projects.casePrincipalBadge}
            </span>
            <h3 className="text-[32px] md:text-[38px] font-extrabold mb-3.5">{featuredProject.title}</h3>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--fg-2)' }}>
              {featuredProject.long[lang]}
            </p>
            <div className="flex gap-2 flex-wrap mb-7">
              {featuredProject.technologies.map((tech) => (
                <span key={tech} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-2)' }}>
                  {tech}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5" style={{ borderTop: '1px solid var(--border-1)' }}>
              {[
                [t.projects.detailLabels.tipo, featuredProject.type[lang]],
                [t.projects.detailLabels.frente, 'Full Stack'],
                [t.projects.detailLabels.duracao, lang === 'pt' ? '3 meses' : '3 months'],
                [t.projects.detailLabels.status, lang === 'pt' ? 'Em produção' : 'In production'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--fg-4)' }}>
                    {label}
                  </div>
                  <div className="text-[13.5px] font-bold" style={{ color: label === t.projects.detailLabels.status ? 'var(--accent)' : undefined }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpenProject(featuredProject)}
              className="mt-7 flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              {t.projects.openCase}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpenProject(featuredProject)}
            className="glass rounded-2xl overflow-hidden text-left aspect-[4/3]"
            aria-label={t.projects.viewDetailsAria(featuredProject.title)}
          >
            <img src={featuredProject.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        </div>

        {/* ranked list */}
        <div style={{ borderTop: '1px solid var(--border-1)' }}>
          {filtered.map((project, i) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setOpenProject(project)}
              className="w-full grid grid-cols-[40px_6px_1fr_auto_24px] items-center gap-4 md:gap-5 py-6 px-3 rounded-2xl text-left border-b border-[var(--border-1)] transition-all hover:translate-x-1 hover:border hover:border-[var(--border-2)] hover:bg-[var(--surface-2)] hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] group"
            >
              <span className="text-2xl font-extrabold" style={{ color: 'var(--fg-4)' }}>
                {String(i + 2).padStart(2, '0')}
              </span>
              <span className="w-1.5 h-11 rounded-sm" style={{ background: project.tint }} />
              <span>
                <span className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span className="text-lg font-extrabold">{project.title}</span>
                  <span className="text-[10.5px] px-2.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'var(--surface-2)', color: 'var(--fg-3)' }}>
                    {project.type[lang]}
                  </span>
                </span>
                <span className="block text-[13.5px] leading-relaxed max-w-xl" style={{ color: 'var(--fg-3)' }}>
                  {project.description[lang]}
                </span>
              </span>
              <span className="hidden md:flex gap-1.5 flex-wrap justify-end max-w-[280px]">
                {project.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: 'var(--surface-1)', color: 'var(--fg-3)' }}>
                    {tech}
                  </span>
                ))}
              </span>
              <ArrowRight className="w-[18px] h-[18px] opacity-35 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--fg-4)' }}>
              {t.projects.emptyCategory}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://github.com/devAndreotti?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-block px-6 py-3 rounded-full text-[13px]"
            style={{ color: 'var(--fg-3)' }}
          >
            {t.projects.moreProjects(OTHERS_COUNT)}
          </a>
        </div>
      </div>

      {openProject && <CaseModal project={openProject} onClose={() => setOpenProject(null)} />}
    </section>
  );
};

export default Projects;
