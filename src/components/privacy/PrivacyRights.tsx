import { useEffect, useRef, useState } from 'react';
import type { PrivacyCopy } from '@/data/privacy';
import { contact } from '@/data/personal';

const COPIED_MS = 1800;

/** The LGPD rights line and the contact: a mailto link, and a button that copies the address. */
const PrivacyRights = ({ copy }: { copy: PrivacyCopy }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // No clipboard permission or an insecure context: the mailto link still works.
    }
  };

  return (
    <section className="pv-card pv-rights" aria-labelledby="pv-rights-h">
      <h2 id="pv-rights-h" className="pv-h2">{copy.rights.title}</h2>
      <p>{copy.rights.text}</p>
      <span className="lbl">{copy.rights.contact}</span>
      <div className="pv-actions">
        <a className="pv-btn pv-btn-pri" href={`mailto:${contact.email}`}>{contact.email}</a>
        <button type="button" className="pv-btn" onClick={handleCopy} aria-live="polite">
          {copied ? copy.rights.copied : copy.rights.copy}
        </button>
      </div>
    </section>
  );
};

export default PrivacyRights;
