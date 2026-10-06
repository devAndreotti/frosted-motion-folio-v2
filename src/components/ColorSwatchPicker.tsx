import { HUE_ORDER, useTheme } from '@/contexts/ThemeContext';
import { HUE_THEMES } from '@/lib/theme';
import { useLanguage } from '@/contexts/LanguageContext';

/** The 7 accent swatches -- shared by the desktop popover and the mobile menu sheet. */
const ColorSwatchPicker = ({ onPick }: { onPick?: () => void }) => {
  const { hue, setHue } = useTheme();
  const { t } = useLanguage();

  return (
    <>
      {HUE_ORDER.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => {
            setHue(option);
            onPick?.();
          }}
          aria-label={t.colorPicker.hueLabel(t.colorPicker.hueNames[option])}
          aria-pressed={hue === option}
          className={`sw${hue === option ? ' on' : ''}`}
          style={{ background: HUE_THEMES[option].swatch }}
        />
      ))}
    </>
  );
};

export default ColorSwatchPicker;
