import { useEffect, useState, type CSSProperties, type FocusEvent } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAutoAdvance } from '@/hooks/useAutoAdvance';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const SWIPE_THRESHOLD = 60; // px of drag offset that counts as a deliberate swipe
const SWIPE_VELOCITY = 500; // px/s — a fast flick counts even if the offset is short
const SLIDE_MS = 2000; // how long each picture stays before the gallery moves on by itself

/** -1/1 = advance to prev/next, 0 = snap back without changing image. */
export function resolveSwipeDelta(offsetX: number, velocityX: number): -1 | 0 | 1 {
  if (offsetX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY) return 1;
  if (offsetX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) return -1;
  return 0;
}

interface ImageCarouselProps {
  images: string[];
  /** The project's name, for the pictures' alt text. */
  title: string;
  /** The project's color: it tints the stage behind the pictures. */
  tint?: string;
}

/**
 * The picture gallery of a project dialog: the whole shot in a frame over a stage that takes the project's color (and
 * a blurred copy of the picture itself), arrows, swipe, a progress bar per picture, and a slideshow that turns by itself
 * every SLIDE_MS with a crossfade. It stops while the pointer or the keyboard is on it, when the visitor pauses it, or
 * for anyone who asked their system for less motion; any move restarts the countdown (and the bar). One picture =
 * just the picture.
 */
const ImageCarousel = ({ images, title, tint }: ImageCarouselProps) => {
  const { t } = useLanguage();
  const [imgIdx, setImgIdx] = useState(0);
  const advance = (delta: number) => setImgIdx((prev) => (prev + delta + images.length) % images.length);
  const multi = images.length > 1;

  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const autoplay = multi && !reduceMotion;
  const held = hovered || focused;
  // `held` is part of the key: coming back from a hover starts a fresh countdown, in step with the bar that refills
  const playing = useAutoAdvance(() => advance(1), SLIDE_MS, autoplay && !userPaused, held, `${imgIdx}:${held}`);

  // load the other shots up front, so the first turn of the gallery never waits for the network
  useEffect(() => {
    images.forEach((src) => {
      new Image().src = src;
    });
  }, [images]);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const delta = resolveSwipeDelta(info.offset.x, info.velocity.x);
    if (delta !== 0) advance(delta);
  };

  const pictures = (
    <>
      {images.map((src, i) => (
        <img
          key={src}
          className={`dlg-img${i === imgIdx ? ' on' : ''}`}
          src={src}
          alt={i === imgIdx ? t.caseModal.imageAlt(title, i + 1) : ''}
          aria-hidden={i === imgIdx ? undefined : true}
          draggable={false}
        />
      ))}
    </>
  );

  // The hover/focus pause covers the whole gallery: the picture and the bar under it.
  return (
    <div className="dlg-gallery" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={onBlur}>
      <div className="dlg-media" style={tint ? ({ '--tint': tint } as CSSProperties) : undefined} aria-live={playing ? 'off' : 'polite'}>
        {images.map((src, i) => (
          <img key={src} className={`dlg-bg${i === imgIdx ? ' on' : ''}`} src={src} alt="" aria-hidden="true" draggable={false} />
        ))}
        {multi ? (
          <>
            <motion.div className="dlg-win cursor-grab active:cursor-grabbing" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6} onDragEnd={handleDragEnd}>
              {pictures}
            </motion.div>
            <button type="button" aria-label={t.caseModal.prevImageAria} onClick={() => advance(-1)} className="np sq dlg-nav" style={{ left: 12 }}>
              <ChevronLeft className="ic" />
            </button>
            <button type="button" aria-label={t.caseModal.nextImageAria} onClick={() => advance(1)} className="np sq dlg-nav" style={{ right: 12 }}>
              <ChevronRight className="ic" />
            </button>
          </>
        ) : (
          <div className="dlg-win">{pictures}</div>
        )}
      </div>
      {multi && (
        <div className="dlg-bar">
          <span className="dlg-count" aria-hidden="true">
            {imgIdx + 1} / {images.length}
          </span>
          <div className="dlg-dots" role="group" aria-label={t.caseModal.imagesAria}>
            {images.map((src, i) => (
              <button key={src} type="button" className="dlg-dot" aria-label={t.caseModal.goToImageAria(i + 1)} aria-current={i === imgIdx ? 'true' : undefined} onClick={() => setImgIdx(i)}>
                <span className="dlg-seg">
                  <i key={i === imgIdx ? `${imgIdx}-${playing}` : i} className={i < imgIdx || (i === imgIdx && !playing) ? 'done' : i === imgIdx ? 'run' : undefined} />
                </span>
              </button>
            ))}
          </div>
          {autoplay && (
            <button
              type="button"
              className="np sq dlg-pause"
              aria-label={userPaused ? t.caseModal.playAria : t.caseModal.pauseAria}
              aria-pressed={userPaused}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              {userPaused ? <Play className="ic s" /> : <Pause className="ic s" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
