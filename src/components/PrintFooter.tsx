import { useLanguage } from '@/contexts/LanguageContext';

/** Hidden on screen. In print it is fixed, so the browser repeats the tiny line on every page. */
const PrintFooter = () => {
  const { t } = useLanguage();
  return (
    <p className="print-foot" aria-hidden="true">
      {t.easter.printNote}
    </p>
  );
};

export default PrintFooter;
