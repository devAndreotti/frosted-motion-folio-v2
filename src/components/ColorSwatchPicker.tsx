import { HUES, HUE_ORDER, useTheme } from '@/contexts/ThemeContext';

const HUE_LABELS: Record<string, string> = {
  black: 'Preto',
  blue: 'Azul',
  purple: 'Roxo',
  orange: 'Laranja',
  red: 'Vermelho',
  green: 'Verde',
  yellow: 'Amarelo',
};

/** The 7-dot color picker — swaps the accent hue used across buttons, glows and highlights. */
const ColorSwatchPicker = () => {
  const { hue, setHue } = useTheme();

  return (
    <div className="glass flex items-center gap-1.5 px-2.5 py-1.5 rounded-full">
      {HUE_ORDER.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setHue(option)}
          aria-label={`Cor de destaque: ${HUE_LABELS[option]}`}
          aria-pressed={hue === option}
          className="w-3.5 h-3.5 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            background: HUES[option].swatch,
            borderColor: hue === option ? 'var(--fg-1)' : 'transparent',
          }}
        />
      ))}
    </div>
  );
};

export default ColorSwatchPicker;
