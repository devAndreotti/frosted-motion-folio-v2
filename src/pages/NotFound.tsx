import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10" style={{ color: 'var(--fg-1)' }}>
      <div className="text-center px-6">
        <h1 className="text-6xl font-extrabold mb-4" style={{ color: 'var(--accent)' }}>
          404
        </h1>
        <p className="text-lg mb-6" style={{ color: 'var(--fg-3)' }}>
          {t.notFound.message}
        </p>
        <a href="./" className="glass-button inline-block px-6 py-3 rounded-full font-semibold">
          {t.notFound.backHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
