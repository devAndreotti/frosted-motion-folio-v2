import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import Marquee from '@/components/Marquee';
import GithubActivityFeed from '@/components/GithubActivityFeed';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Timeline from '@/components/Timeline';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionKeyboardNav } from '@/hooks/useSectionKeyboardNav';

const Index = () => {
  const { t } = useLanguage();
  useSectionKeyboardNav();

  return (
    <>
      <ScrollProgress />
      <a
        href="#header"
        className="fixed left-4 top-4 z-[100] -translate-y-24 focus:translate-y-0 transition-transform glass px-4 py-2 rounded-full text-sm font-semibold"
        style={{ color: 'var(--fg-1)' }}
      >
        {t.common.skipToContent}
      </a>
      <div className="min-h-screen relative">
        <Navigation />
        <main>
          <Header />
          <Marquee />
          <GithubActivityFeed />
          <Projects />
          <Skills />
          <Timeline />
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Index;
