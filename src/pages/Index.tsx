import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import Marquee from '@/components/Marquee';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Timeline from '@/components/Timeline';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <ThemeProvider>
      <a
        href="#header"
        className="fixed left-4 top-4 z-[100] -translate-y-24 focus:translate-y-0 transition-transform glass px-4 py-2 rounded-full text-sm font-semibold"
        style={{ color: 'var(--fg-1)' }}
      >
        Pular para o conteúdo
      </a>
      <div className="min-h-screen relative" style={{ background: 'var(--bg)' }}>
        <Navigation />
        <main>
          <Header />
          <Marquee />
          <Projects />
          <Skills />
          <Timeline />
          <Footer />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
