import { ArrowUp } from 'lucide-react';
import { personalInfo } from '@/data/personal';
import { useLanguage } from '@/contexts/LanguageContext';
import NovidadesBadge from './NovidadesBadge';

/** The bottom bar shared by the home, the blog and "uses": copyright on the left, "back to top" inside the same pill. */
const SiteBottomBar = () => {
  const { t } = useLanguage();
  // the space below the pill is padding on the zone, not margin: a margin would collapse into the page and leave the pill flush with its end
  return (
    <div className="ft-zone">
      <footer className="ft">
        <span className="ft-c">
          <span>{t.footer.copyright(personalInfo.name)}</span>
          <NovidadesBadge />
        </span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {t.footer.backToTop}
          <ArrowUp className="ic s" />
        </button>
      </footer>
    </div>
  );
};

export default SiteBottomBar;
