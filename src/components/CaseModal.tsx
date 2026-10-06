import { useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CuratedProject } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';

const SWIPE_THRESHOLD = 60; // px of drag offset that counts as a deliberate swipe
const SWIPE_VELOCITY = 500; // px/s — a fast flick counts even if the offset is short

/** -1/1 = advance to prev/next, 0 = snap back without changing image. */
export function resolveSwipeDelta(offsetX: number, velocityX: number): -1 | 0 | 1 {
  if (offsetX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY) return 1;
  if (offsetX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) return -1;
  return 0;
}

interface CaseModalProps {
  project: CuratedProject;
  onClose: () => void;
}

/** Full case-study detail for a project, opened from the featured card or a ranked row. */
const CaseModal = ({ project, onClose }: CaseModalProps) => {
  const { lang, t } = useLanguage();
  const [imgIdx, setImgIdx] = useState(0);
  const images = project.images.length > 0 ? project.images : [project.image];
  const advance = (delta: number) => setImgIdx((prev) => (prev + delta + images.length) % images.length);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const delta = resolveSwipeDelta(info.offset.x, info.velocity.x);
    if (delta !== 0) advance(delta);
  };

  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useFocusTrap(true, dialogRef, onClose);

  const img = <img className="dlg-img" src={images[imgIdx]} alt={t.caseModal.imageAlt(project.title, imgIdx + 1)} draggable={false} />;

  return (
    <div className="ov" onClick={onClose}>
      <div ref={dialogRef} className="dlg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.caseModal.dialogAria(project.title)}>
        <div className="dlg-h">
          <span className="chip">
            <span className="dot" style={{ background: project.tint }} />
            <span>{project.type[lang]}</span>
          </span>
          <button type="button" className="np sq" aria-label={t.caseModal.closeAria} onClick={onClose}>
            <X className="ic" />
          </button>
        </div>

        <div className="dlg-media">
          {images.length > 1 ? (
            <>
              <motion.div className="cursor-grab active:cursor-grabbing" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={handleDragEnd}>
                {img}
              </motion.div>
              <button type="button" aria-label={t.caseModal.prevImageAria} onClick={() => advance(-1)} className="np sq dlg-nav" style={{ left: 12 }}>
                <ChevronLeft className="ic" />
              </button>
              <button type="button" aria-label={t.caseModal.nextImageAria} onClick={() => advance(1)} className="np sq dlg-nav" style={{ right: 12 }}>
                <ChevronRight className="ic" />
              </button>
            </>
          ) : (
            img
          )}
        </div>

        <h3>{project.title}</h3>
        <p className="dlg-p">{project.long[lang]}</p>
        <p className="k">{t.caseModal.whatIDid}</p>
        <ul className="pts">
          {project.points[lang].map((point) => (
            <li key={point}>
              <Check className="ic s" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
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
