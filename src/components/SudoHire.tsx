import { useLanguage } from '@/contexts/LanguageContext';
import { contact } from '@/data/personal';

const LINE_DELAY_MS = 220;

/** Output of `sudo hire ricardo`: the lines appear one after another through CSS delays (see styles/eggs.css), no timers. */
export const SudoHire = () => {
  const { t } = useLanguage();
  const lines = [...t.eggs.hireLines, t.eggs.hireContact(contact.email)];
  return (
    <div className="egg-hire font-mono text-emerald-400 space-y-0.5">
      {lines.map((line, i) => (
        <div key={line} className={`egg-hire-line${i === lines.length - 1 ? ' text-white/80 font-semibold' : ''}`} style={{ animationDelay: `${i * LINE_DELAY_MS}ms` }}>
          {line}
        </div>
      ))}
    </div>
  );
};

export default SudoHire;
