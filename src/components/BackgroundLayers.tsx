import { useLayoutEffect, useRef, useState } from 'react';
import { buildHueTheme } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface LayerContent {
  bg: string;
  glow1: string;
  glow2: string;
  glow3: string;
}

export function tokensFor(hue: ReturnType<typeof useTheme>['hue'], theme: ReturnType<typeof useTheme>['theme']): LayerContent {
  const tokens = buildHueTheme(hue)[theme];
  return { bg: tokens.bg, glow1: tokens.glow1, glow2: tokens.glow2, glow3: tokens.glow3 };
}

/**
 * Renders the page-wide gradient wash + ambient blobs behind everything,
 * once, above the router — so both the home page and the 404 page pick up
 * the selected hue/theme. Two stacked layers ping-pong so a color/theme
 * change crossfades instead of snapping: `background-image` (what a CSS
 * gradient is) doesn't animate via a plain `transition`, so the fade has to
 * happen in JS by swapping which layer is visible.
 */
const BackgroundLayers = () => {
  const { hue, theme } = useTheme();
  const current = tokensFor(hue, theme);

  const [front, setFront] = useState<'a' | 'b'>('a');
  const [contentA, setContentA] = useState<LayerContent>(current);
  const [contentB, setContentB] = useState<LayerContent>(current);
  const isFirstRun = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    // Update the currently-hidden layer first (invisible, no flash), then
    // flip which layer is front so the swap crossfades. useLayoutEffect (not
    // useEffect) + a double rAF guarantees the hidden layer has actually
    // painted with its new content before we start animating its opacity —
    // skip either step and the browser can coalesce the two paints and the
    // fade never visibly starts.
    if (front === 'a') {
      setContentB(current);
    } else {
      setContentA(current);
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setFront((prev) => (prev === 'a' ? 'b' : 'a'));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.bg]);

  const renderLayer = (content: LayerContent, visible: boolean) => (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
      style={{ opacity: visible ? 1 : 0, background: content.bg }}
    >
      <div
        className="absolute inset-0 animate-blob-breathe"
        style={{
          background: `radial-gradient(circle at 20% 80%, ${content.glow1} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${content.glow2} 0%, transparent 50%), radial-gradient(circle at 40% 40%, ${content.glow3} 0%, transparent 45%)`,
        }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      {renderLayer(contentA, front === 'a')}
      {renderLayer(contentB, front === 'b')}
    </div>
  );
};

export default BackgroundLayers;
