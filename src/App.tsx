import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import BackgroundLayers from "@/components/BackgroundLayers";
import DebugOverlay from "@/components/DebugOverlay";
import { useSecretKeys } from "@/hooks/useSecretKeys";
import HauntedMode from "@/components/HauntedMode";
import PrintFooter from "@/components/PrintFooter";
import Index from "./pages/Index";

// Only reached by unknown paths, so it is split out of the first screen's bundle.
const NotFound = lazy(() => import("./pages/NotFound"));
// The blog is its own pages (prerendered at build time, see vite-plugins/blog.ts); its chunks load on demand.
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Uses = lazy(() => import("./pages/Uses"));
const Novidades = lazy(() => import("./pages/Novidades"));
const Agora = lazy(() => import("./pages/Agora"));

const SecretKeys = () => {
  useSecretKeys();
  return null;
};

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <SecretKeys />
      <BackgroundLayers />
      <DebugOverlay />
      <HauntedMode />
      <PrintFooter />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Suspense fallback={null}><Blog /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogPost /></Suspense>} />
          <Route path="/privacidade" element={<Suspense fallback={null}><Privacy /></Suspense>} />
          <Route path="/uses" element={<Suspense fallback={null}><Uses /></Suspense>} />
          <Route path="/novidades" element={<Suspense fallback={null}><Novidades /></Suspense>} />
          <Route path="/agora" element={<Suspense fallback={null}><Agora /></Suspense>} />
          {/* a case opens over the home page: the same page as /, with the popup of that project (unknown slugs: 404) */}
          <Route path="/projetos/:slug" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Suspense fallback={null}><NotFound /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
