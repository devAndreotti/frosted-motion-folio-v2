import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import BackgroundLayers from "@/components/BackgroundLayers";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <BackgroundLayers />
      <BrowserRouter basename="/frosted-motion-folio-v2">
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
