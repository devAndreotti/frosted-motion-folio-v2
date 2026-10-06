import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FEEDBACK_MS = 1800;

/** "Copiar e-mail" button -- a fallback for anyone without a mail client set up; flips to "Copiado!" for a moment. */
const CopyEmailButton = ({ email, className = 'btn btn-gh', withIcon = true }: { email: string; className?: string; withIcon?: boolean }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      // Clipboard API unavailable (no permission, insecure context) — nothing to fall back to.
    }
  };

  return (
    <button type="button" onClick={handleCopy} className={className} aria-live="polite">
      {withIcon && (copied ? <Check className="ic s" /> : <Copy className="ic s" />)}
      <span>{copied ? t.common.emailCopied : t.common.copyEmail}</span>
    </button>
  );
};

export default CopyEmailButton;
