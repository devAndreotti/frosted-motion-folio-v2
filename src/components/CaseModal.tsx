import { useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { X, Github, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { CuratedProject } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import ImageWithSkeleton from './ImageWithSkeleton';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-6 md:p-10" onClick={onClose}>
      <div
        ref={dialogRef}
        className="glass-strong w-full max-w-3xl max-h-full overflow-auto rounded-3xl p-8 md:p-11"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.caseModal.dialogAria(project.title)}
      >
        <div className="flex items-start justify-between mb-5">
          <span
            className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide"
            style={{ background: project.tint }}
          >
            {project.type[lang]}
          </span>
          <button
            type="button"
            aria-label={t.caseModal.closeAria}
            onClick={onClose}
            className="glass w-9 h-9 rounded-lg flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {images.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[16/9]" style={{ background: 'var(--surface-1)' }}>
            {images.length > 1 ? (
              <motion.div
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
              >
                <ImageWithSkeleton
                  src={images[imgIdx]}
                  alt={t.caseModal.imageAlt(project.title, imgIdx + 1)}
                  className="w-full h-full object-cover pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </motion.div>
            ) : (
              <ImageWithSkeleton src={images[imgIdx]} alt={t.caseModal.imageAlt(project.title, imgIdx + 1)} className="w-full h-full object-cover" loading="lazy" />
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t.caseModal.prevImageAria}
                  onClick={() => advance(-1)}
                  className="glass absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label={t.caseModal.nextImageAria}
                  onClick={() => advance(1)}
                  className="glass absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((src, i) => (
                    <span
                      key={src}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: i === imgIdx ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <h3 className="text-[28px] md:text-[32px] font-extrabold mb-4">{project.title}</h3>
        <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--fg-2)' }}>
          {project.long[lang]}
        </p>

        <div className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--fg-4)' }}>
          {t.caseModal.whatIDid}
        </div>
        <div className="flex flex-col gap-2.5 mb-7">
          {project.points[lang].map((point) => (
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
              {t.caseModal.viewRepo}
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
              {t.caseModal.viewLive}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseModal;
