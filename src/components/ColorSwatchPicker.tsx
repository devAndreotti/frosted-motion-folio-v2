import { HUE_ORDER, useTheme } from '@/contexts/ThemeContext';
import { HUE_THEMES } from '@/lib/theme';
import { useLanguage } from '@/contexts/LanguageContext';

/** The 7-dot color picker — swaps the accent hue used across buttons, glows and highlights. */
const ColorSwatchPicker = () => {
  const { hue, setHue } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="glass flex items-center px-1.5 py-1.5 rounded-full">
      {HUE_ORDER.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setHue(option)}
          aria-label={t.colorPicker.hueLabel(t.colorPicker.hueNames[option])}
          aria-pressed={hue === option}
          className="w-6 h-6 flex items-center justify-center flex-shrink-0"
        >
          <span
            className="w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: HUE_THEMES[option].swatch,
              borderColor: hue === option ? 'var(--fg-1)' : 'transparent',
            }}
          />
        </button>
      ))}
    </div>
  );
};

export default ColorSwatchPicker;
