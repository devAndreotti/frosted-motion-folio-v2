import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BacklightLevel } from '@/lib/notebook3d/logic';
import type { ViewName } from '@/lib/notebook3d/scene';
import SegmentedControl from './SegmentedControl';

const LEVELS: BacklightLevel[] = [0, 1, 2];
const VIEW_NAMES: Exclude<ViewName, 'fechada'>[] = ['frente', 'tampa', 'base'];

export type ScreenMode = 'vivo' | 'imagem';

interface NotebookControlsProps {
  light: BacklightLevel;
  onLight: (level: BacklightLevel) => void;
  view: ViewName;
  onView: (view: ViewName) => void;
  /** Null when the device shows only screenshots (touch or narrow screens). */
  screen: ScreenMode | null;
  onScreen: (mode: ScreenMode) => void;
  lidOpen: boolean;
  onLid: () => void;
  sound: boolean;
  onSound: () => void;
}

/** The laptop's switches: keyboard light, camera view, what the screen shows, the lid and the key sounds. */
const NotebookControls = (p: NotebookControlsProps) => {
  const { t } = useLanguage();
  const nb = t.projects.more.notebook;
  return (
    <>
      <div className="nb3d-tools">
        <span className="nb3d-lbl">{nb.light}</span>
        <SegmentedControl layoutId="nb3d-light" ariaLabel={nb.light} value={String(p.light)} onChange={(v) => p.onLight(Number(v) as BacklightLevel)}
          options={LEVELS.map((v) => ({ value: String(v), label: nb.lightLevels[v] }))} />
        <span className="nb3d-lbl">{nb.view}</span>
        <SegmentedControl layoutId="nb3d-view" ariaLabel={nb.view} value={p.view} onChange={p.onView}
          options={VIEW_NAMES.map((v) => ({ value: v, label: nb.views[v] }))} />
        {p.screen && (
          <>
            <span className="nb3d-lbl">{nb.screen}</span>
            <SegmentedControl layoutId="nb3d-screen" ariaLabel={nb.screen} value={p.screen} onChange={p.onScreen}
              options={[{ value: 'vivo' as const, label: nb.screenModes[0] }, { value: 'imagem' as const, label: nb.screenModes[1] }]} />
          </>
        )}
      </div>
      <div className="nb3d-acts">
        <button type="button" className="btn btn-gh btn-sm" onClick={p.onLid}>
          {p.lidOpen ? nb.lidClose : nb.lidOpen}
        </button>
        <button type="button" className="btn btn-gh btn-sm" aria-pressed={p.sound} onClick={p.onSound}>
          {p.sound ? <Volume2 className="ic s" /> : <VolumeX className="ic s" />}
          {nb.sound}
        </button>
      </div>
    </>
  );
};

export default NotebookControls;
