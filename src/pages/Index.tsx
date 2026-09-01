
import { ThemeProvider } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Footer from '@/components/Footer';
import BackgroundParticles from '@/components/BackgroundParticles';

const Index = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen relative">
        <BackgroundParticles />
        
        <div className="relative z-10">
          <Header />
          <About />
          <Skills />
          <Projects />
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
