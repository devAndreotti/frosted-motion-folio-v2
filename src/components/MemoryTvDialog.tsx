import { useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { NowProject } from '@/data/now';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import MemoryTv from './MemoryTv';

interface MemoryTvDialogProps {
  project: NowProject;
  onClose: () => void;
}

/** Memory Apartment's card: the site's usual dialog around a TV that shows the error screen and the bridge. No link out. */
const MemoryTvDialog = ({ project, onClose }: MemoryTvDialogProps) => {
  const { lang, t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useFocusTrap(true, dialogRef, onClose);

  return (
    <div className="ov" onClick={onClose}>
      <div ref={dialogRef} className="dlg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.now.tv.dialogAria(project.title)}>
        <div className="dlg-h">
          <span className="chip">
            <span className="dot" />
            <span>{project.status[lang]}</span>
          </span>
          <button type="button" className="np sq" aria-label={t.caseModal.closeAria} onClick={onClose}>
            <X className="ic" />
          </button>
        </div>
        <MemoryTv />
        <h3>{project.title}</h3>
        <p className="dlg-p">{project.pitch[lang]}</p>
        <div className="tags" style={{ marginTop: 22 }}>
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryTvDialog;
