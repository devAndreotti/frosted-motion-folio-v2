import { useId, useRef } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { CuratedProject } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import ImageCarousel from './ImageCarousel';
import { projectAsset } from '@/lib/projects/asset';

export { resolveSwipeDelta } from './ImageCarousel';

interface CaseModalProps {
  project: CuratedProject;
  onClose: () => void;
}

/**
 * Full detail for a project, opened from the featured card, a ranked row or a card of the gallery. The ones in the
 * gallery have no "what I did" list (empty points), so that block is left out for them.
 */
const CaseModal = ({ project, onClose }: CaseModalProps) => {
  const { lang, t } = useLanguage();
  const images = (project.images.length > 0 ? project.images : [project.image]).map(projectAsset);
  const points = project.points[lang];

  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useScrollLock(true);
  useFocusTrap(true, dialogRef, onClose);

  return (
    <div className="ov" onClick={onClose}>
      <div ref={dialogRef} className="dlg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dlg-h">
          <span className="chip">
            <span className="dot" style={{ background: project.tint }} />
            <span>{project.type[lang]}</span>
          </span>
          <button type="button" className="np sq" aria-label={t.caseModal.closeAria} onClick={onClose}>
            <X className="ic" />
          </button>
        </div>

        <ImageCarousel images={images} title={project.title} tint={project.tint} />

        <h3 id={titleId}>{project.title}</h3>
        <p className="dlg-p">{project.long[lang]}</p>
        {points.length > 0 && (
          <>
            <p className="k">{t.caseModal.whatIDid}</p>
            <ul className="pts">
              {points.map((point) => (
                <li key={point}>
                  <Check className="ic s" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="tags" style={{ marginTop: 22 }}>
          {project.technologies.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </div>
        <div className="acts">
          {project.liveUrl && (
            <a className="btn btn-pri btn-sm" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              {t.caseModal.viewLive}
              <ArrowUpRight className="ic s" />
            </a>
          )}
          {project.githubUrl && (
            <a className="btn btn-gh btn-sm" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              {t.caseModal.viewRepo}
              <ArrowUpRight className="ic s" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseModal;
