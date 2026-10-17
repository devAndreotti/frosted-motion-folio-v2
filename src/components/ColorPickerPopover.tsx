import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { HUE_THEMES } from '@/lib/theme';
import ColorSwatchPicker from './ColorSwatchPicker';

/**
 * Desktop accent picker: a pill showing the current color, opening the 7 swatches in a non-modal dialog.
 * Opening moves focus to the current swatch; Escape or a pick closes it and gives focus back to the pill.
 */
const ColorPickerPopover = () => {
  const { hue } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popId = useId();

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEscapeKey(open, () => close(true));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const target = popRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? popRef.current?.querySelector<HTMLElement>('button');
    target?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="acc-w">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.colorPicker.trigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? popId : undefined}
        className="np"
      >
        <span className="acc-dot" style={{ background: HUE_THEMES[hue].swatch }} />
        <span>{t.colorPicker.hueNames[hue]}</span>
        <ChevronDown className="ic" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <div ref={popRef} id={popId} role="dialog" aria-label={t.colorPicker.trigger} className="pop glass-strong">
          <ColorSwatchPicker onPick={() => close(true)} />
        </div>
      )}
    </div>
  );
};

export default ColorPickerPopover;
