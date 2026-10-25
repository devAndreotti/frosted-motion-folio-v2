import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { CuratedProject } from '@/data/curatedProjects';
import { buildHueTheme } from '@/lib/theme';
import { projectAsset } from '@/lib/projects/asset';
import { track } from '@/lib/track';
import { hostOf, liveUrlFor, nextBacklight, parseBacklight, wrapIndex, type BacklightLevel } from '@/lib/notebook3d/logic';
import type { NotebookHandle, ViewName } from '@/lib/notebook3d/scene';
import NotebookControls, { type ScreenMode } from './NotebookControls';

const GLB = './models/notebook-loq.glb';
const POSTER = './models/notebook-loq.webp';
// keys that would scroll the page while the stage has focus
const NO_SCROLL = new Set(['Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

const load = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode: the choice just isn't remembered
  }
};

const webglOk = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
// the real pages go on the screen only with a mouse and room for them; touch and narrow screens keep the screenshots
const canLive = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches === true && window.innerWidth >= 900;

interface Notebook3DProps {
  projects: CuratedProject[];
  onOpen: (project: CuratedProject) => void;
}

/**
 * My real laptop (Lenovo LOQ 15IRH8, stickers and all) with the gallery's projects on its screen: the live page on desktop,
 * a screenshot elsewhere. three.js and the model load only when the stage gets near the screen; until then, and without
 * WebGL, a still picture stands in. The keyboard light takes the site's accent color and has the laptop's two levels;
 * the keys go down and click when pressed on the model or typed with the stage focused; the lid opens and closes.
 */
const Notebook3D = ({ projects, onOpen }: Notebook3DProps) => {
  const { lang, t } = useLanguage();
  const nb = t.projects.more.notebook;
  const { hue } = useTheme();
  // the dark variant's accent: on the black hue it is a near white, like the laptop's own white backlight
  const color = buildHueTheme(hue).dark.accent;
  const stage = useRef<HTMLDivElement>(null);
  const handle = useRef<NotebookHandle | null>(null);
  const [index, setIndex] = useState(0);
  const [light, setLight] = useState<BacklightLevel>(() => parseBacklight(load('nb.luz')));
  const [view, setView] = useState<ViewName>('frente');
  const [sound, setSound] = useState(() => load('nb.som') !== '0');
  const [desktop] = useState(canLive);
  const [screen, setScreen] = useState<ScreenMode>(() => (load('nb.tela') === 'imagem' ? 'imagem' : 'vivo'));
  const [lidOpen, setLidOpen] = useState(true);
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);
  // the canvas replaces the still picture only once the first project is on its screen
  const [shown, setShown] = useState(false);
  // load error or lost GL context: the still picture stays for good
  const [failed, setFailed] = useState(false);
  const project = projects[wrapIndex(index, projects.length)];

  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '400px 0px' });
    // a live page loads only once the stage is really on screen, not while scrolling past
    const io2 = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.4 });
    io.observe(el);
    io2.observe(el);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!near || !el || !webglOk()) return;
    let alive = true;
    import('@/lib/notebook3d/scene')
      .then(({ createNotebook }) => {
        if (!alive) return;
        handle.current = createNotebook(el, {
          glb: projectAsset(GLB),
          color,
          backlight: light,
          reducedMotion: reducedMotion(),
          sound,
          live: desktop,
          onReady: () => alive && setReady(true),
          onError: () => alive && setFailed(true),
          onSpace: () => setLight((l) => nextBacklight(l)),
          onLid: (open) => alive && setLidOpen(open),
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      handle.current?.dispose();
      handle.current = null;
      setReady(false);
      setShown(false);
    };
    // mounted once; color, light, sound and the slide reach the scene through the effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  useEffect(() => {
    if (!ready || !project) return;
    let alive = true;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (!alive) return;
      handle.current?.show({ image: img, host: hostOf(project.liveUrl ?? project.githubUrl) });
      requestAnimationFrame(() => alive && setShown(true));
    };
    img.src = projectAsset(project.image);
    // warm the next one so the arrow feels instant
    const next = projects[wrapIndex(index + 1, projects.length)];
    if (next) new Image().src = projectAsset(next.image);
    return () => {
      alive = false;
    };
  }, [ready, project, projects, index]);

  useEffect(() => {
    if (!ready || !project) return;
    const url = liveUrlFor(project.liveUrl, desktop && seen && screen === 'vivo');
    handle.current?.setLive(url, hostOf(project.liveUrl), nb.liveTitle(project.title));
  }, [ready, project, desktop, seen, screen, nb]);

  useEffect(() => {
    handle.current?.setBacklight(light, color);
    save('nb.luz', String(light));
  }, [light, color, ready]);

  useEffect(() => {
    handle.current?.setSound(sound);
    save('nb.som', sound ? '1' : '0');
  }, [sound, ready]);

  if (!project) return null;
  const go = (step: number) => setIndex((i) => wrapIndex(i + step, projects.length));
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.altKey || e.ctrlKey || e.metaKey) return;
    const pressed = handle.current?.pressCode(e.code) ?? false;
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || (pressed && NO_SCROLL.has(e.code))) e.preventDefault();
  };
  const toggleLid = () => {
    const open = !lidOpen;
    setLidOpen(open);
    handle.current?.setLid(open);
    track(open ? 'notebook-abrir' : 'notebook-fechar');
  };

  return (
    <div className="nb3d">
      <div ref={stage} className={`nb3d-stage${shown && !failed ? ' is-live' : ''}`} role="region" aria-label={nb.stageAria} tabIndex={0} onKeyDown={onKey}>
        <img className="nb3d-poster" src={projectAsset(POSTER)} alt={nb.poster} loading="lazy" decoding="async" />
      </div>
      <div className="nb3d-side">
        <p className="nb3d-count" aria-live="polite">
          {index + 1} / {projects.length}
        </p>
        <p className="nb3d-n">{project.title}</p>
        <p className="nb3d-d">{project.tagline[lang]}</p>
        <span className="tags">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </span>
        <div className="nb3d-nav">
          <button type="button" className="nb3d-arrow glass" aria-label={nb.prev} onClick={() => go(-1)}>
            <ChevronLeft className="ic s" />
          </button>
          <button type="button" className="btn btn-pri btn-sm" onClick={() => onOpen(project)}>
            {nb.open}
          </button>
          <button type="button" className="nb3d-arrow glass" aria-label={nb.next} onClick={() => go(1)}>
            <ChevronRight className="ic s" />
          </button>
        </div>
        <NotebookControls
          light={light}
          onLight={(l) => {
            setLight(l);
            track(`notebook-luz-${l}`);
          }}
          view={view}
          onView={(v) => {
            setView(v);
            handle.current?.view(v);
          }}
          screen={desktop ? screen : null}
          onScreen={(m) => {
            setScreen(m);
            save('nb.tela', m);
          }}
          lidOpen={lidOpen}
          onLid={toggleLid}
          sound={sound}
          onSound={() => setSound((s) => !s)}
        />
        <p className="nb3d-hint">{nb.hint}</p>
      </div>
    </div>
  );
};

export default Notebook3D;
