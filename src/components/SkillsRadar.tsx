import { useState } from 'react';
import { CORE_SKILLS } from '@/data/skills';
import { radarPoint } from '@/lib/radar';
import { useLanguage } from '@/contexts/LanguageContext';

const CENTER = 170;
const MAX_R = 130;

const point = (index: number, level: number) => radarPoint(index, level, CORE_SKILLS.length, CENTER, MAX_R);

/** SVG radar chart plotting each core skill's 1-5 level around a hexagon. */
const SkillsRadar = () => {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);
  const dots = CORE_SKILLS.map((skill, i) => point(i, skill.level));
  const axesEnds = CORE_SKILLS.map((_, i) => point(i, 5));
  const labels = CORE_SKILLS.map((_, i) => point(i, 6.1));
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox="0 0 340 340"
      overflow="visible"
      className="w-full max-w-[280px] sm:max-w-[340px] h-auto"
      role="img"
      aria-label={t.skills.radarSvgAria}
    >
      {rings.map((f) => (
        <circle key={f} cx={CENTER} cy={CENTER} r={MAX_R * f} fill="none" stroke="var(--border-1)" strokeWidth={1} />
      ))}
      {CORE_SKILLS.map((skill, i) => (
        <g key={skill.name}>
          <line x1={CENTER} y1={CENTER} x2={axesEnds[i].x} y2={axesEnds[i].y} stroke="var(--border-2)" strokeWidth={1} />
          <text
            x={labels[i].x}
            y={labels[i].y}
            fill={hovered === i ? 'var(--accent)' : 'var(--fg-3)'}
            fontSize={12}
            fontWeight={600}
            textAnchor="middle"
            style={{ transition: 'fill 0.15s ease' }}
          >
            {skill.name}
          </text>
        </g>
      ))}
      <polygon
        points={dots.map((d) => `${d.x},${d.y}`).join(' ')}
        // rgba(var(--x), a) composed inside a bare SVG attribute (not a real
        // CSS declaration) doesn't reliably resolve the custom property in
        // every browser — it silently falls back to fill's initial value,
        // opaque black. A style prop is a genuine CSS declaration, so var()
        // resolves the same way it does everywhere else on the page.
        style={{ fill: 'rgb(var(--accent-rgb) / 0.2)', stroke: 'var(--accent)' }}
        strokeWidth={2}
      />
      {dots.map((d, i) => (
        <g
          key={CORE_SKILLS[i].name}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* Bigger invisible hit target — the visible dot (r=4) is too small to hover reliably */}
          <circle cx={d.x} cy={d.y} r={14} fill="transparent" />
          <circle cx={d.x} cy={d.y} r={hovered === i ? 6 : 4} fill="var(--accent)" style={{ transition: 'r 0.15s ease' }} />
          {hovered === i && (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={d.x - 20} y={d.y - 30} width={40} height={18} rx={5} fill="var(--surface-2)" stroke="var(--border-1)" />
              <text x={d.x} y={d.y - 17} fill="var(--fg-1)" fontSize={11} fontWeight={700} textAnchor="middle">
                {CORE_SKILLS[i].level}/5
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};

export default SkillsRadar;
