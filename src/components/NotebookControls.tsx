import { ChevronLeft, ChevronRight, Keyboard, Laptop, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BacklightLevel } from '@/lib/notebook3d/logic';
import type { ViewName } from '@/lib/notebook3d/scene';

const VIEW_NAMES: Exclude<ViewName, 'fechada'>[] = ['frente', 'tampa', 'base'];
const pad = (n: number) => String(n).padStart(2, '0');

interface NotebookControlsProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  light: BacklightLevel;
  /** Steps the keyboard light to the next level (off, low, high, off...), like Fn+Space. */
  onLight: () => void;
  view: ViewName;
  onView: (view: ViewName) => void;
  lidOpen: boolean;
  onLid: () => void;
  sound: boolean;
  onSound: () => void;
}

/**
 * The bar over the laptop: the project arrows, the camera views and the laptop's switches (keyboard light, lid, key
 * sounds). On a wide screen it floats over the bottom of the stage; on a phone it sits under it, in two rows.
 */
const NotebookControls = (p: NotebookControlsProps) => {
  const { t } = useLanguage();
  const nb = t.projects.more.notebook;
  const lightLabel = `${nb.light}: ${nb.lightLevels[p.light]}`;
  return (
    <div className="nb3d-dock" role="toolbar" aria-label={nb.controls}>
      <div className="nb3d-dock-nav">
        <button type="button" className="nb3d-ib is-nav" aria-label={nb.prev} onClick={p.onPrev}>
          <ChevronLeft className="ic s" aria-hidden="true" />
        </button>
        <span className="nb3d-count" aria-live="polite">
          {pad(p.index + 1)} / {pad(p.total)}
        </span>
        <button type="button" className="nb3d-ib is-nav" aria-label={nb.next} onClick={p.onNext}>
          <ChevronRight className="ic s" aria-hidden="true" />
        </button>
      </div>
      <span className="nb3d-sep" aria-hidden="true" />
      <div className="nb3d-views" role="group" aria-label={nb.view}>
        {VIEW_NAMES.map((v) => (
          <button key={v} type="button" className="nb3d-pill" aria-pressed={p.view === v} onClick={() => p.onView(v)}>
            {nb.views[v]}
          </button>
        ))}
      </div>
      <span className="nb3d-sep" aria-hidden="true" />
      <div className="nb3d-toggles">
        <button type="button" className={`nb3d-ib${p.light > 0 ? ' is-on' : ''}`} data-level={p.light} aria-label={lightLabel} title={lightLabel} onClick={p.onLight}>
          <Keyboard className="ic s" aria-hidden="true" />
        </button>
        <button type="button" className={`nb3d-ib${p.lidOpen ? ' is-on' : ''}`} aria-label={p.lidOpen ? nb.lidClose : nb.lidOpen} title={p.lidOpen ? nb.lidClose : nb.lidOpen} onClick={p.onLid}>
          <Laptop className="ic s" aria-hidden="true" />
        </button>
        <button type="button" className={`nb3d-ib${p.sound ? ' is-on' : ''}`} aria-label={nb.sound} title={nb.sound} aria-pressed={p.sound} onClick={p.onSound}>
          {p.sound ? <Volume2 className="ic s" aria-hidden="true" /> : <VolumeX className="ic s" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export default NotebookControls;
