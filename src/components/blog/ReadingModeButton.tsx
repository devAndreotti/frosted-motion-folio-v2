import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/** The post's reading-mode switch: a toggle button (aria-pressed), so the same control also turns it off. */
const ReadingModeButton = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => {
  const { t } = useLanguage();
  return (
    <button type="button" className="btn btn-gh btn-sm reading-btn" aria-pressed={on} onClick={onToggle}>
      <BookOpen className="ic s" aria-hidden="true" />
      <span>{t.blog.readingMode}</span>
    </button>
  );
};

export default ReadingModeButton;
