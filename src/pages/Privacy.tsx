import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import PrivacyHero from '@/components/privacy/PrivacyHero';
import PrivacyNumbers from '@/components/privacy/PrivacyNumbers';
import PrivacyFichas from '@/components/privacy/PrivacyFichas';
import PrivacySimulation from '@/components/privacy/PrivacySimulation';
import PrivacyRights from '@/components/privacy/PrivacyRights';
import { PRIVACY } from '@/data/privacy';

// The text in src/data/privacy.ts has to match what worker/newsletter.js and worker/likes.js actually do:
// change one, change the other (and the tests in worker/ that hold the numbers).

/** /privacidade/ -- plain words about the newsletter and the likes, in the visitor's language. */
const Privacy = () => {
  const { lang } = useLanguage();
  const c = PRIVACY[lang];
  return (
    <BlogShell title={`${c.title} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main pv" lang={lang === 'en' ? 'en' : 'pt-BR'}>
        <PrivacyHero copy={c} />
        <PrivacyNumbers copy={c} />
        <PrivacyFichas copy={c} />
        <PrivacySimulation copy={c} />
        <PrivacyRights copy={c} />
        <p className="blog-note">{c.updated}</p>
      </main>
    </BlogShell>
  );
};

export default Privacy;
