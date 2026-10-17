import { useRef } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { contact, personalInfo } from '@/data/personal';
import { caseBySlug } from '@/data/cases';
import type { CuratedProject } from '@/data/curatedProjects';
import { casePath } from '@/lib/projects/caseLink';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import CopyEmailButton from './CopyEmailButton';

// The three cases worth opening first, in this order. Each opens its case page (/projetos/<slug>/).
const QUICK_SLUGS = ['git-wizard-commander', 'gold-portfolio-analyzer', 'cook-app'];
const QUICK = QUICK_SLUGS.map((slug) => caseBySlug(slug)).filter((p): p is CuratedProject => Boolean(p));

/** One-screen summary for recruiters: who, what, where to look first, how to reach out. Printable. */
const RecruiterModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useFocusTrap(true, dialogRef, onClose);

  return (
    <div className="ov" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dlg sm"
        role="dialog"
        aria-modal="true"
        aria-label={t.header.recruiterDialogAria}
        data-print-target="recruiter-summary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dlg-h">
          <p className="lbl">{t.header.recruiterLabel}</p>
          <button type="button" className="np sq" aria-label={t.common.close} onClick={onClose} data-print-hide>
            <X className="ic" />
          </button>
        </div>
        <h3 style={{ marginTop: 14 }}>{personalInfo.name}</h3>
        <p className="dlg-p" style={{ marginTop: 6 }}>
          {t.header.recruiterRole}
        </p>
        <ul className="pts" style={{ marginTop: 22 }}>
          {t.header.recruiterBullets.map((bullet) => (
            <li key={bullet}>
              <Check className="ic s" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <p className="k">{t.header.recruiterQuick}</p>
        <div className="quick">
          {QUICK.map((p) => (
            <a key={p.slug} href={casePath(p.slug)} target="_blank" rel="noopener noreferrer">
              {p.title}
              <ArrowUpRight className="ic s" />
            </a>
          ))}
        </div>
        <div className="acts" data-print-hide>
          <a className="btn btn-pri btn-sm" href={`mailto:${contact.email}`}>
            {t.common.sendEmail}
          </a>
          <CopyEmailButton email={contact.email} className="btn btn-gh btn-sm" withIcon={false} />
          {contact.resume && (
            <a className="btn btn-gh btn-sm" href={contact.resume} target="_blank" rel="noopener noreferrer">
              {t.footer.resume}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterModal;
