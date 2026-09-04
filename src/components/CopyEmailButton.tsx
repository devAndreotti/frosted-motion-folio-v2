import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FEEDBACK_MS = 1500;

/** Small icon button that copies an email to the clipboard — a fallback for anyone without a mail client configured. */
const CopyEmailButton = ({ email }: { email: string }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      // Clipboard API unavailable (no permission, insecure context) — nothing to fall back to.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? t.common.emailCopied : t.common.copyEmail}
      title={copied ? t.common.emailCopied : t.common.copyEmail}
      className="glass w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors flex-shrink-0"
    >
      {copied ? <Check className="w-4 h-4" style={{ color: 'var(--accent)' }} /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export default CopyEmailButton;
