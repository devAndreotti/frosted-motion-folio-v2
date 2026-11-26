import { memo, useId } from 'react';

const ACC = 'var(--accent, #a855f7)';
const LIT = 'color-mix(in oklab, var(--accent, #a855f7) 62%, #fff)';
const MONO = 'var(--font-mono, monospace)';
const RULER = Array.from({ length: 40 }, (_, i) => `M${i * 8} ${i % 5 ? 37 : 33} V40`).join('');
const CX = 180, CY = 196;
const FEAT = '#38bdf8', FIX = '#fbbf24';

const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${+(CX + r * Math.cos(a)).toFixed(1)},${+(CY + r * Math.sin(a)).toFixed(1)}`;
};
const square = (r: number, rot: number) => [0, 90, 180, 270].map(a => polar(a + rot, r)).join(' ');
// the rune ring is inscribed with this repo's own commit hashes
const RUNES = '29621d9 · 327b3ad · d1ffe96 · 97b60b6 · 6adc30c · ceb4e09 · de79cf0 · b2803cd · 76c7c42 · 585854a · ';
const SPARKS = [[-30, -14, 1.4], [26, -22, 1.1], [34, 10, 1.6], [-18, 28, 1.2], [12, 36, 0.9], [-38, 6, 1], [40, -6, 0.8], [-8, -34, 1.3], [22, 22, 1], [-26, -30, 0.8], [30, 30, 0.7], [-34, 20, 0.9]];
const STAR = 'M0 -30 L2.2 -2.2 L30 0 L2.2 2.2 L0 30 L-2.2 2.2 L-30 0 L-2.2 -2.2 Z';

const Tag = ({ x, y, w, label, color }: { x: number; y: number; w: number; label: string; color: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height="14" rx="7" fill="#0c0618" />
    <rect width={w} height="14" rx="7" fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.5" />
    <text x={w / 2} y="10" textAnchor="middle" fill={color} fontSize="7.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.04em">{label}</text>
  </g>
);
const Commit = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <g><circle cx={x} cy={y} r="5.5" fill="#0c0618" stroke={color} strokeWidth="2" /><circle cx={x} cy={y} r="1.8" fill={color} /></g>
);

export const GitWizardCardArt = memo(function GitWizardCardArt() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `gw${k}${n}`;
  const u = (n: string) => `url(#gw${k}${n})`;
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-art-svg" role="img"
      aria-label="Git Wizard Commander: commit graph merging inside a rune circle, with a terminal" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id('amb')} cx="180" cy="196" r="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ACC} stopOpacity="0.34" /><stop offset="0.5" stopColor={ACC} stopOpacity="0.08" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vig')} cx="50%" cy="42%" r="72%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={id('halo')}>
          <stop offset="0" stopColor={ACC} stopOpacity="0.85" /><stop offset="0.4" stopColor={ACC} stopOpacity="0.3" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('seal')}>
          <stop offset="0" stopColor={ACC} stopOpacity="0.16" /><stop offset="1" stopColor={ACC} stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id={id('main')} x1="0" y1="92" x2="0" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LIT} stopOpacity="0" /><stop offset="0.12" stopColor={LIT} /><stop offset="0.5" stopColor={LIT} /><stop offset="0.88" stopColor={LIT} /><stop offset="1" stopColor={LIT} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('hl')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.4" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={id('ring')} d={`M${CX - 94} ${CY} a94 94 0 1 1 188 0 a94 94 0 1 1 -188 0`} />
        <pattern id={id('tex')} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0 H0 V22" stroke="#a855f7" strokeOpacity="0.08" strokeWidth="0.8" />
        </pattern>
      </defs>

      <rect width="360" height="480" fill="#07030f" />
      <rect width="360" height="480" fill={u('tex')} />
      <rect width="360" height="480" fill={u('amb')} />

      {/* header: branch pill + diff stat (seen on the tall deck card) */}
      <g transform="translate(24 26)" fontFamily={MONO} fontWeight="700">
        <rect width="150" height="26" rx="13" fill={ACC} fillOpacity="0.14" stroke={LIT} strokeOpacity="0.35" />
        <circle cx="14" cy="13" r="7" fill={u('halo')} /><circle cx="14" cy="13" r="3.2" fill={LIT} />
        <text x="26" y="17" fill="#f3e8ff" fontSize="10.5" letterSpacing="0.04em">BRANCH · MAIN (v2.4)</text>
        <text x="312" y="17" textAnchor="end" fontSize="10.5"><tspan fill="#4ade80">+128</tspan><tspan fill="#f87171"> −42</tspan></text>
      </g>

      {/* arcane astrolabe: dotted orbit, hash inscription, octagram seal */}
      <circle cx={CX} cy={CY} r="104" stroke={LIT} strokeOpacity="0.38" strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="99" stroke="#fff" strokeOpacity="0.08" />
      <text fill={LIT} fillOpacity="0.5" fontSize="7" fontFamily={MONO} letterSpacing="1.6">
        <textPath href={`#${id('ring')}`}>{RUNES}</textPath>
      </text>
      <circle cx={CX} cy={CY} r="86" fill={u('seal')} stroke="#fff" strokeOpacity="0.14" />
      <polygon points={square(86, 0)} stroke={LIT} strokeOpacity="0.24" strokeLinejoin="round" />
      <polygon points={square(86, 45)} stroke={LIT} strokeOpacity="0.24" strokeLinejoin="round" />
      <circle cx={CX} cy={CY} r="61" stroke="#fff" strokeOpacity="0.09" strokeDasharray="2 4" />
      <path d={[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const [x, y] = polar(a, 86).split(','); return `M${x} ${+y - 3.5}l3.5 3.5l-3.5 3.5l-3.5 -3.5Z`; }).join('')} fill={LIT} fillOpacity="0.7" />

      {/* commit DAG: main (accent), feat (cyan), fix (amber) */}
      <path d="M180 92 V300" stroke={u('main')} strokeOpacity="0.28" strokeWidth="9" />
      <path d="M180 92 V300" stroke={u('main')} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M180 108 C180 126 236 120 236 140 V166 C236 186 180 176 180 196" stroke={FEAT} strokeOpacity="0.18" strokeWidth="8" />
      <path d="M180 108 C180 126 236 120 236 140 V166 C236 186 180 176 180 196" stroke={FEAT} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M180 214 C180 230 126 222 126 240 C126 258 180 250 180 266" stroke={FIX} strokeWidth="2.4" strokeLinecap="round" />
      <Commit x={180} y={108} color={LIT} /><Commit x={180} y={152} color={LIT} /><Commit x={180} y={266} color={LIT} />
      <Commit x={236} y={140} color={FEAT} /><Commit x={236} y={166} color={FEAT} /><Commit x={126} y={240} color={FIX} />
      <Tag x={132} y={101} w={40} label="main" color={LIT} />
      <Tag x={246} y={146} w={58} label="feat/spells" color={FEAT} />
      <Tag x={66} y={233} w={50} label="fix/typo" color={FIX} />

      {/* stellar merge node */}
      <circle cx={CX} cy={CY} r="46" fill={u('halo')} />
      <circle cx={CX} cy={CY} r="28" stroke="#fff" strokeOpacity="0.12" />
      <circle cx={CX} cy={CY} r="21" stroke={LIT} strokeOpacity="0.55" strokeDasharray="2 3" />
      <circle cx={CX} cy={CY} r="13" stroke={LIT} strokeWidth="1.5" />
      <path d={SPARKS.map(([dx, dy, r]) => `M${CX + dx - r} ${CY + dy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('')} fill="#fff" fillOpacity="0.75" />
      <path d={STAR} transform={`translate(${CX} ${CY})`} fill="#fff" fillOpacity="0.9" />
      <path d={STAR} transform={`translate(${CX} ${CY}) rotate(45) scale(0.45)`} fill="#fff" fillOpacity="0.6" />
      <circle cx={CX} cy={CY} r="7.5" fill="#fff" />
      <circle cx={CX} cy={CY} r="3" fill={ACC} />

      <rect width="360" height="480" fill={u('vig')} />

      <g className="card-art-hud" transform="translate(24 410)" fontFamily={MONO} fontSize="8" letterSpacing="0.14em">
        <rect width="312" height="1" fill={u('hl')} opacity="0.5" />
        <text y="24" fill="#fff" fillOpacity="0.36">04 — CLI SPELLBOOK</text>
        <text x="312" y="24" textAnchor="end" fill={LIT} fillOpacity="0.7">DAG · FF-ONLY</text>
        <path d={RULER} stroke="#fff" strokeOpacity="0.16" />
      </g>

      {/* macOS terminal */}
      <g className="card-art-hud" transform="translate(24 306)" fontFamily={MONO}>
        <rect width="312" height="76" rx="14" fill="#0d0818" fillOpacity="0.92" stroke={LIT} strokeOpacity="0.3" />
        <path d="M0 14 A14 14 0 0 1 14 0 H298 A14 14 0 0 1 312 14 V22 H0 Z" fill="#fff" fillOpacity="0.045" />
        <rect x="20" width="272" height="1" fill={u('hl')} />
        <path d="M0 22.5 H312" stroke="#fff" strokeOpacity="0.08" />
        <circle cx="16" cy="11" r="4" fill="#ff5f57" /><circle cx="29" cy="11" r="4" fill="#febc2e" /><circle cx="42" cy="11" r="4" fill="#28c840" />
        <text x="156" y="14" textAnchor="middle" fill="#fff" fillOpacity="0.4" fontSize="8">git-wizard — zsh</text>
        <text x="18" y="45" fontSize="11.5" fontWeight="700"><tspan fill={LIT}>❯</tspan><tspan fill="#f5f3ff"> git wizard merge --ff</tspan></text>
        <rect x="182" y="35" width="6.5" height="12" rx="1" fill={LIT} fillOpacity="0.8" />
        <text x="18" y="63" fontSize="9.5"><tspan fill="#4ade80">✔ Fast-forward (0 conflicts)</tspan><tspan fill="#fff" fillOpacity="0.45"> 29621d9..327b3ad</tspan></text>
      </g>
    </svg>
  );
});
