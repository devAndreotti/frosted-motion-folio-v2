import { lazy, Suspense, type ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import Projects from '@/components/Projects';
import ScrollProgress from '@/components/ScrollProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSectionKeyboardNav } from '@/hooks/useSectionKeyboardNav';

// Everything below the hero loads as its own chunk, after the first paint.
const NowSection = lazy(() => import('@/components/NowSection'));
const Skills = lazy(() => import('@/components/Skills'));
const GithubActivityFeed = lazy(() => import('@/components/GithubActivityFeed'));
const Timeline = lazy(() => import('@/components/Timeline'));
const Footer = lazy(() => import('@/components/Footer'));

/**
 * A lazy section inside a wrapper that owns the anchor id (#now, #skills...),
 * so nav links and keyboard jumps always find a target. The fallback reserves
 * roughly the section's desktop height (measured), so the page does not jump when it arrives.
 */
const LazySection = ({ id, minHeight, children }: { id: string; minHeight: number; children: ReactNode }) => (
  <div id={id} className="sec-anchor">
    <Suspense fallback={<div aria-hidden="true" style={{ minHeight }} />}>{children}</Suspense>
  </div>
);

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
      {/* clip, not hidden: trims the hero glow and the cards' flight at the
          viewport edge without becoming a scroll container (that would
          break the sticky nav). */}
      <div className="min-h-screen relative [overflow-x:clip]">
        <Navigation />
        <main>
          <Header />
          <LazySection id="now" minHeight={1450}>
            <NowSection />
          </LazySection>
          <Projects />
          <LazySection id="skills" minHeight={920}>
            <Skills />
          </LazySection>
          <LazySection id="github-activity" minHeight={700}>
            <GithubActivityFeed />
          </LazySection>
          <LazySection id="timeline" minHeight={430}>
            <Timeline />
          </LazySection>
          <LazySection id="contact" minHeight={750}>
            <Footer />
          </LazySection>
        </main>
      </div>
    </>
  );
};

export default Index;
