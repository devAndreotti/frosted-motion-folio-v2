import { CORE_SKILLS } from '@/data/skills';
import { radarPoint } from '@/lib/radar';

const CENTER = 170;
const MAX_R = 130;

const point = (index: number, level: number) => radarPoint(index, level, CORE_SKILLS.length, CENTER, MAX_R);

/** SVG radar chart plotting each core skill's 1-5 level around a hexagon. */
const SkillsRadar = () => {
  const dots = CORE_SKILLS.map((skill, i) => point(i, skill.level));
  const axesEnds = CORE_SKILLS.map((_, i) => point(i, 5));
  const labels = CORE_SKILLS.map((_, i) => point(i, 6.1));
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width="340" height="340" viewBox="0 0 340 340" role="img" aria-label="Radar de proficiência nas tecnologias principais">
      {rings.map((f) => (
        <circle key={f} cx={CENTER} cy={CENTER} r={MAX_R * f} fill="none" stroke="var(--border-1)" strokeWidth={1} />
      ))}
      {CORE_SKILLS.map((skill, i) => (
        <g key={skill.name}>
          <line x1={CENTER} y1={CENTER} x2={axesEnds[i].x} y2={axesEnds[i].y} stroke="var(--border-2)" strokeWidth={1} />
          <text x={labels[i].x} y={labels[i].y} fill="var(--fg-3)" fontSize={12} fontWeight={600} textAnchor="middle">
            {skill.name}
          </text>
        </g>
      ))}
      <polygon
        points={dots.map((d) => `${d.x},${d.y}`).join(' ')}
        fill="rgba(var(--accent-rgb), 0.2)"
        stroke="var(--accent)"
        strokeWidth={2}
      />
      {dots.map((d, i) => (
        <circle key={CORE_SKILLS[i].name} cx={d.x} cy={d.y} r={4} fill="var(--accent)" />
      ))}
    </svg>
  );
};

export default SkillsRadar;
