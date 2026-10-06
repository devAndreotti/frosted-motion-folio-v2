import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { HUE_THEMES } from '@/lib/theme';
import ColorSwatchPicker from './ColorSwatchPicker';

/**
 * Desktop nav entry for the accent picker: one 34 px pill showing the
 * current color, opening the 7 swatches in a popover -- the inline row of
 * dots used to be the widest thing in the bar.
 */
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.colorPicker.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        className="glass h-[34px] pl-2.5 pr-2 rounded-full flex items-center gap-1.5 text-[11px] font-semibold"
        style={{ color: 'var(--fg-3)' }}
      >
        <span className="w-3.5 h-3.5 rounded-full" style={{ background: HUE_THEMES[hue].swatch, boxShadow: '0 0 0 2px var(--border-2)' }} />
        <span className="hidden lg:inline">{t.colorPicker.hueNames[hue]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50">
          <ColorSwatchPicker onPick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default ColorPickerPopover;
