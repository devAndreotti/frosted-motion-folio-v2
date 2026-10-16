import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { contact } from "@/data/personal";
import NotFoundGame from "@/components/NotFoundGame";

// The app's root on either deploy ("/" on devandreotti.com, "/frosted-motion-folio-v2/" on GitHub Pages).
const HOME = import.meta.env.BASE_URL;
const SECTIONS = ['projects', 'now', 'contact'] as const;

/** Unknown route: shows what was asked for and points back into the site. */
const NotFound = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const n = t.notFound;

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="nf">
      <header className="nf-top">
        <a className="brand" href={HOME}>
          <span className="mono-b">RA</span>
          <span>Ricardo Andreotti</span>
        </a>
        <span className="nf-host">{window.location.host}</span>
      </header>

      <main className="wrap nf-main">
        <div>
          <p className="eyebrow">
            <span className="chip">
              <span className="dot" style={{ background: 'var(--accent)' }} />
              {n.badge}
            </span>
            {n.kicker}
          </p>
          <h1 className="nf-h">
            {n.title} <span>{n.titleAccent}</span>
          </h1>
          <p className="lead">{n.body}</p>
          <div className="nf-path glass">
            <p className="k">{n.tried}</p>
            <p className="nf-url">
              {window.location.host}
              {HOME.slice(0, -1)}
              <s>{pathname}</s>
            </p>
            <p className="nf-code">{n.code}</p>
          </div>
          <div className="acts">
            <a className="btn btn-pri" href={HOME}>
              <ArrowLeft className="ic" />
              {n.backHome}
            </a>
            <a className="btn btn-gh" href={`${HOME}#projects`}>
              {n.seeProjects}
            </a>
          </div>
        </div>

        <div className="nf-side">
          <nav className="nf-sug" aria-label={n.suggest}>
            <span className="nf-big" aria-hidden="true">404</span>
            <p className="k">{n.suggest}</p>
            {SECTIONS.map((id, i) => (
              <a key={id} className="nf-s glass" href={`${HOME}#${id}`}>
                <span className="nf-n">0{i + 1}</span>
                <span>
                  <span className="nf-st">{n.sections[id].title}</span>
                  <span className="nf-sd">{n.sections[id].note}</span>
                </span>
                <ArrowUpRight className="ic" />
              </a>
            ))}
          </nav>
          <NotFoundGame />
        </div>
      </main>

      <footer className="nf-foot">
        <span>© {new Date().getFullYear()} Ricardo A. Gonçalves</span>
        <span>
          {n.broken} <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </span>
      </footer>
    </div>
  );
};

export default NotFound;
