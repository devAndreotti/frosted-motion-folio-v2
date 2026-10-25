import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { CuratedProject } from '@/data/curatedProjects';
import { buildHueTheme } from '@/lib/theme';
import { projectAsset } from '@/lib/projects/asset';
import { track } from '@/lib/track';
import { hostOf, nextBacklight, parseBacklight, wrapIndex, type BacklightLevel } from '@/lib/notebook3d/logic';
import type { NotebookHandle, ViewName } from '@/lib/notebook3d/scene';
import SegmentedControl from './SegmentedControl';

const GLB = './models/notebook-loq.glb';
const POSTER = './models/notebook-loq.webp';
const LIGHT_KEY = 'nb.luz';
const LEVELS: BacklightLevel[] = [0, 1, 2];
const VIEW_NAMES: ViewName[] = ['frente', 'tampa', 'base'];

const savedLight = (): BacklightLevel => {
  try {
    return parseBacklight(localStorage.getItem(LIGHT_KEY));
  } catch {
    return 0;
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

interface Notebook3DProps {
  projects: CuratedProject[];
  onOpen: (project: CuratedProject) => void;
}

/**
 * My real laptop (Lenovo LOQ 15IRH8, stickers and all) with the gallery's projects on its screen. three.js and the
 * model load only when the stage gets near the screen; until then, and without WebGL, a still picture stands in.
 * The keyboard light takes the site's accent color and has the laptop's two levels; clicking the space bar on the
 * model cycles it like Fn+Space does.
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
  const [light, setLight] = useState<BacklightLevel>(savedLight);
  const [view, setView] = useState<ViewName>('frente');
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  // the canvas replaces the still picture only once the first project is on its screen
  const [live, setLive] = useState(false);
  const project = projects[wrapIndex(index, projects.length)];

  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
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
          onReady: () => alive && setReady(true),
          onSpace: () => setLight((l) => nextBacklight(l)),
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      handle.current?.dispose();
      handle.current = null;
      setReady(false);
      setLive(false);
    };
    // mounted once; color, light and the slide reach the scene through the effects below
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
      requestAnimationFrame(() => alive && setLive(true));
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
    handle.current?.setBacklight(light, color);
    try {
      localStorage.setItem(LIGHT_KEY, String(light));
    } catch {
      // private mode: the choice just isn't remembered
    }
  }, [light, color, ready]);

  if (!project) return null;
  const go = (step: number) => setIndex((i) => wrapIndex(i + step, projects.length));
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else return;
    e.preventDefault();
  };
  const pickLight = (v: string) => {
    setLight(Number(v) as BacklightLevel);
    track(`notebook-luz-${v}`);
  };
  const pickView = (v: ViewName) => {
    setView(v);
    handle.current?.view(v);
  };

  return (
    <div className="nb3d">
      <div ref={stage} className={`nb3d-stage${live ? ' is-live' : ''}`} role="region" aria-label={nb.stageAria} tabIndex={0} onKeyDown={onKey}>
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
        <div className="nb3d-tools">
          <span className="nb3d-lbl">{nb.light}</span>
          <SegmentedControl layoutId="nb3d-light" ariaLabel={nb.light} value={String(light)} onChange={pickLight}
            options={LEVELS.map((v) => ({ value: String(v), label: nb.lightLevels[v] }))} />
          <span className="nb3d-lbl">{nb.view}</span>
          <SegmentedControl layoutId="nb3d-view" ariaLabel={nb.view} value={view} onChange={pickView}
            options={VIEW_NAMES.map((v) => ({ value: v, label: nb.views[v] }))} />
        </div>
        <p className="nb3d-hint">{nb.hint}</p>
      </div>
    </div>
  );
};

export default Notebook3D;
