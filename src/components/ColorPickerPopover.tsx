import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { HUE_THEMES } from '@/lib/theme';
import ColorSwatchPicker from './ColorSwatchPicker';

/** Desktop accent picker: a pill showing the current color, opening the 7 swatches in a popover. */
const ColorPickerPopover = () => {
  const { hue } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEscapeKey(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="acc-w">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.colorPicker.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        className="np"
      >
        <span className="acc-dot" style={{ background: HUE_THEMES[hue].swatch }} />
        <span>{t.colorPicker.hueNames[hue]}</span>
        <ChevronDown className="ic" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <div className="pop glass-strong">
          <ColorSwatchPicker onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default ColorPickerPopover;
