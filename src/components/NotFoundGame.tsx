import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDodgeGame } from '@/hooks/useDodgeGame';

/** Mini game for the 404 page: dodge the falling bugs, score = seconds survived. */
const NotFoundGame = () => {
  const { t } = useLanguage();
  const g = t.notFound.game;
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { view, begin, onPointerDown, onPointerMove, onPointerUp, onKeyDown, onKeyUp } = useDodgeGame(fieldRef, canvasRef, reduced);

  return (
    <section className="nf-game glass" aria-label={g.aria}>
      <div className="nf-game-head">
        <span className="k">{g.title}</span>
        <span className="nf-game-score">
          {g.score(view.score)} · {g.best(view.best)}
        </span>
      </div>
      <div
        ref={fieldRef}
        className="nf-game-field"
        role="group"
        aria-label={g.aria}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        <canvas ref={canvasRef} className="nf-game-canvas" aria-hidden="true" />
        {view.status === 'ready' && (
          <div className="nf-game-over">
            <button type="button" className="btn btn-pri btn-sm" onClick={begin}>
              {g.start}
            </button>
            <p className="nf-game-note">{g.pressToStart}</p>
          </div>
        )}
        {view.status === 'over' && (
          <div className="nf-game-over" role="status">
            <p className="nf-game-msg">
              {g.over} · {g.score(view.score)}
            </p>
            <button type="button" className="btn btn-pri btn-sm" onClick={begin}>
              {g.restart}
            </button>
            <p className="nf-game-note">{g.restartHint}</p>
          </div>
        )}
      </div>
      <p className="nf-game-note">{g.hint}</p>
    </section>
  );
};

export default NotFoundGame;
