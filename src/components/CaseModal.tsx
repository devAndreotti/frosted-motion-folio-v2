import { useEffect } from 'react';
import { X, Github, ExternalLink } from 'lucide-react';
import { CuratedProject } from '@/data/curatedProjects';

interface CaseModalProps {
  project: CuratedProject;
  onClose: () => void;
}

/** Full case-study detail for a project, opened from the featured card or a ranked row. */
const CaseModal = ({ project, onClose }: CaseModalProps) => {
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-6 md:p-10" onClick={onClose}>
      <div
        className="glass-strong w-full max-w-3xl max-h-full overflow-auto rounded-3xl p-8 md:p-11"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do projeto ${project.title}`}
      >
        <div className="flex items-start justify-between mb-5">
          <span
            className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide"
            style={{ background: project.tint }}
          >
            {project.type}
          </span>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="glass w-8 h-8 rounded-lg flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="text-[28px] md:text-[32px] font-extrabold mb-4">{project.title}</h3>
        <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--fg-2)' }}>
          {project.long}
        </p>

        <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--fg-4)' }}>
          O que eu fiz
        </div>
        <div className="flex flex-col gap-2.5 mb-7">
          {project.points.map((point) => (
            <div key={point} className="flex gap-2.5 items-start text-sm leading-relaxed" style={{ color: 'var(--fg-2)' }}>
              <span className="w-[5px] h-[5px] mt-2 rounded-full flex-shrink-0" style={{ background: project.tint }} />
              {point}
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-7">
          {project.technologies.map((tech) => (
            <span key={tech} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-2)' }}>
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: project.tint, color: '#08080a' }}
            >
              <Github className="w-4 h-4" />
              Ver repositório
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Ver ao vivo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseModal;
