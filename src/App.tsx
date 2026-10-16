import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import BackgroundLayers from "@/components/BackgroundLayers";
import HauntedMode from "@/components/HauntedMode";
import PrintFooter from "@/components/PrintFooter";
import Index from "./pages/Index";

// Only reached by unknown paths, so it is split out of the first screen's bundle.
const NotFound = lazy(() => import("./pages/NotFound"));
// The blog is its own pages (prerendered at build time, see vite-plugins/blog.ts); its chunks load on demand.
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Privacy = lazy(() => import("./pages/Privacy"));

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <BackgroundLayers />
      <HauntedMode />
      <PrintFooter />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Suspense fallback={null}><Blog /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={null}><BlogPost /></Suspense>} />
          <Route path="/privacidade" element={<Suspense fallback={null}><Privacy /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Suspense fallback={null}><NotFound /></Suspense>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
