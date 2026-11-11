import { memo, useId } from 'react';

const ACC = 'var(--accent, #eab308)';
const LIT = 'color-mix(in oklab, var(--accent, #eab308) 62%, #fff)';
const MONO = 'var(--font-mono, monospace)';
const RULER = Array.from({ length: 40 }, (_, i) => `M${i * 8} ${i % 5 ? 37 : 33} V40`).join('');
type Stop = [number, string, number?];
const stops = (list: Stop[]) => list.map(([o, c, a = 1], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a} />);

// 2:1 isometric projection: x runs down-right, y down-left, z up.
const iso = (x: number, y: number, z: number) => `${+(0.866 * (x - y)).toFixed(1)},${+(0.5 * (x + y) - z).toFixed(1)}`;
const L = 96, W = 44, H = 20, IN = 7; // bar length, width, height, top-face inset (trapezoid ingot)
type P3 = [number, number, number];
const face = (pts: P3[], y0: number, z0: number) => pts.map(([x, y, z]) => iso(x, y + y0, z + z0)).join(' ');
const TOP: P3[] = [[IN, IN, H], [L - IN, IN, H], [L - IN, W - IN, H], [IN, W - IN, H]];
const SIDE: P3[] = [[0, W, 0], [L, W, 0], [L - IN, W - IN, H], [IN, W - IN, H]];
const END: P3[] = [[L, 0, 0], [L, W, 0], [L - IN, W - IN, H], [L - IN, IN, H]];
const EDGE: P3[] = [[IN, W - IN, H], [L - IN, W - IN, H], [L - IN, IN, H]];
const FOOT: P3[] = [[-3, -2, 0], [L + 2, -2, 0], [L + 2, W + 6, 0], [-3, W + 6, 0]];

// efficient frontier (two cubic segments) and a seeded Monte Carlo cloud of portfolios inside its bullet
const FRONTIER = 'M60 190 C60 168 105 156 140 136 C190 108 260 100 326 96';
const bez = (t: number, a: number, b: number, c: number, d: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;
const EDGE_PTS = Array.from({ length: 41 }, (_, i) => (i < 21 ? [bez(i / 20, 60, 60, 105, 140), bez(i / 20, 190, 168, 156, 136)] : [bez((i - 20) / 20, 140, 190, 260, 326), bez((i - 20) / 20, 136, 108, 100, 96)]));
const rand = (i: number) => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); };
const CLOUD = Array.from({ length: 48 }, (_, i) => {
  const x = 66 + rand(i + 1) * 142;
  const fy = EDGE_PTS.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b))[1];
  const d = rand(i + 101) ** 1.5;
  return [+x.toFixed(1), +(fy + 5 + d * (232 - fy) * 0.66).toFixed(1), d] as const;
});
// x, open, close, high, low (svg y: smaller is higher), volume
const CANDLES = [[218, 196, 182, 176, 204, 9], [242, 184, 192, 178, 198, 6], [266, 190, 166, 160, 194, 12], [290, 168, 156, 148, 174, 8], [314, 158, 134, 126, 162, 15]];
const dot = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const CLOUD_TIERS = [[0, 0.2, 1.8, 0.62], [0.2, 0.55, 1.4, 0.42], [0.55, 1.01, 1.1, 0.24]].map(([lo, hi, r, a]) =>
  [CLOUD.filter(([, , d]) => d >= lo && d < hi).map(([x, y]) => dot(x, y, r)).join(''), a] as const);
const box = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const UP = CANDLES.filter(c => c[2] < c[1]), DOWN = CANDLES.filter(c => c[2] >= c[1]);
const wicks = (cs: number[][]) => cs.map(([x, , , hi, lo]) => `M${x} ${hi}V${lo}`).join('');
const bodies = (cs: number[][], dx = 0, dy = 0) => cs.map(([x, o, c]) => box(x - 5 + dx, Math.min(o, c) + dy, 10, Math.abs(o - c))).join('');
const R = 19, C = 2 * Math.PI * R;
type U = (n: string) => string;

const Bar = ({ y0, z0, u, mark }: { y0: number; z0: number; u: U; mark?: boolean }) => (
  <g strokeLinejoin="round">
    <polygon points={face(SIDE, y0, z0)} fill={u('side')} stroke="#4a2e03" strokeWidth="0.6" />
    <polygon points={face(END, y0, z0)} fill={u('end')} stroke="#3d2602" strokeWidth="0.6" />
    <polygon points={face(END, y0, z0)} fill={u('rim')} />
    <polygon points={face(TOP, y0, z0)} fill={u('top')} stroke="#fff6d6" strokeOpacity="0.55" strokeWidth="0.6" />
    <polyline points={face(EDGE, y0, z0)} stroke="#fffbeb" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
    {mark && (
      <g transform={`matrix(0.866 0.5 -0.866 0.5 ${-0.866 * y0} ${0.5 * y0 - z0 - H})`} fontFamily={MONO} fontWeight="800" textAnchor="middle">
        <rect x={IN + 7} y={IN + 3.5} width={L - 2 * IN - 14} height={W - 2 * IN - 7} rx="3" stroke="#8a5a08" strokeOpacity="0.55" strokeWidth="0.8" />
        <text x={L / 2} y={W / 2 - 0.4} fontSize="6.4" letterSpacing="0.1em" fill="#fff8dc" opacity="0.6">FINE GOLD</text>
        <text x={L / 2} y={W / 2 - 1} fontSize="6.4" letterSpacing="0.1em" fill="#7a4d06">FINE GOLD</text>
        <text x={L / 2} y={W / 2 + 7.6} fontSize="6.4" letterSpacing="0.14em" fill="#7a4d06">999.9</text>
      </g>
    )}
  </g>
);

const Glint = ({ x, y, s = 1, u }: { x: number; y: number; s?: number; u: U }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r="13" fill={u('glint')} />
    <path d="M0 -11 L1.3 -1.3 L11 0 L1.3 1.3 L0 11 L-1.3 1.3 L-11 0 L-1.3 -1.3 Z" fill="#fff" />
  </g>
);

export const GoldPortfolioCardArt = memo(function GoldPortfolioCardArt() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `gp${k}${n}`;
  const u = (n: string) => `url(#gp${k}${n})`;
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-art-svg" role="img"
      aria-label="Gold Portfolio Analyzer: efficient frontier and an isometric stack of gold bars" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id('amb')} cx="180" cy="200" r="230" gradientUnits="userSpaceOnUse">{stops([[0, ACC, 0.3], [0.5, ACC, 0.07], [1, ACC, 0]])}</radialGradient>
        <radialGradient id={id('warm')}>{stops([[0, '#f59e0b', 0.32], [1, '#f59e0b', 0]])}</radialGradient>
        <radialGradient id={id('vig')} cx="50%" cy="44%" r="72%">{stops([[0.55, '#000', 0], [1, '#000', 0.7]])}</radialGradient>
        <radialGradient id={id('shadow')}>{stops([[0, '#000', 0.75], [1, '#000', 0]])}</radialGradient>
        <radialGradient id={id('glint')}>{stops([[0, '#fff', 0.9], [0.35, '#fde68a', 0.45], [1, '#f59e0b', 0]])}</radialGradient>
        <radialGradient id={id('halo')}>{stops([[0, ACC, 0.7], [1, ACC, 0]])}</radialGradient>
        <linearGradient id={id('top')} x1="0" y1="0" x2="1" y2="1">{stops([[0, '#fffbe6'], [0.3, '#fde68a'], [0.68, '#f2b52b'], [1, '#c27f0a']])}</linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0.6">{stops([[0, '#b97d0d'], [0.32, '#f7c94b'], [0.5, '#dca021'], [1, '#7c5006']])}</linearGradient>
        <linearGradient id={id('end')} x1="0" y1="0" x2="0" y2="1">{stops([[0, '#a16a0b'], [1, '#4f3204']])}</linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="1">{stops([[0.25, ACC, 0], [1, ACC, 0.32]])}</linearGradient>
        <linearGradient id={id('area')} x1="0" y1="0" x2="0" y2="1">{stops([[0, ACC, 0.26], [1, ACC, 0]])}</linearGradient>
        <linearGradient id={id('curve')} x1="0" y1="0" x2="1" y2="0">{stops([[0, '#fde68a', 0.5], [0.35, LIT], [1, '#fff']])}</linearGradient>
        <linearGradient id={id('cml')} x1="0" y1="0" x2="1" y2="0">{stops([[0, LIT, 0.9], [1, LIT, 0]])}</linearGradient>
        <linearGradient id={id('up')} x1="0" y1="0" x2="0" y2="1">{stops([[0, '#6ee7b7'], [1, '#059669']])}</linearGradient>
        <linearGradient id={id('vol')} x1="0" y1="0" x2="0" y2="1">{stops([[0, ACC, 0.4], [1, ACC, 0.05]])}</linearGradient>
        <linearGradient id={id('hl')} x1="0" y1="0" x2="1" y2="0">{stops([[0, '#fff', 0], [0.5, '#fff', 0.4], [1, '#fff', 0]])}</linearGradient>
        <pattern id={id('tex')} width="30" height="17.32" patternUnits="userSpaceOnUse">
          <path d="M0 8.66 L15 0 L30 8.66 L15 17.32 Z" stroke="#fff" strokeOpacity="0.05" strokeWidth="0.7" />
        </pattern>
      </defs>

      {/* backdrop: warm black, isometric lattice, accent ambience */}
      <rect width="360" height="480" fill="#0a0805" />
      <rect width="360" height="480" fill={u('tex')} />
      <rect width="360" height="480" fill={u('amb')} />
      <ellipse cx="182" cy="252" rx="150" ry="110" fill={u('warm')} />

      {/* header: yield pill + allocation donut (seen on the tall deck card) */}
      <g transform="translate(24 26)">
        <rect width="136" height="26" rx="13" fill="#eab308" fillOpacity="0.1" stroke="#eab308" strokeOpacity="0.32" />
        <circle cx="14" cy="13" r="7" fill={u('halo')} /><circle cx="14" cy="13" r="3.2" fill={LIT} />
        <text x="26" y="17" fill="#fde68a" fontSize="10.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.06em">YIELD +18.42%</text>
      </g>
      <g transform="translate(314 46)">
        <circle r={R} stroke="#fff" strokeOpacity="0.08" strokeWidth="5" />
        {([[0, 0.52, u('top')], [0.52, 0.28, ACC], [0.8, 0.2, 'rgba(255,255,255,0.5)']] as const).map(([s, f, c]) => (
          <circle key={s} r={R} transform="rotate(-90)" stroke={c} strokeWidth="5" strokeDasharray={`${f * C - 2.5} ${C}`} strokeDashoffset={-s * C} />
        ))}
        <text y="3" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontFamily={MONO} fontWeight="800">AU</text>
      </g>

      {/* risk/return plane */}
      <path d="M28 120 H332 M28 152 H332 M28 184 H332 M28 216 H332" stroke="#fff" strokeOpacity="0.07" strokeDasharray="2 4" />
      <path d="M28 98 V230 H332" stroke="#fff" strokeOpacity="0.16" />
      <path d={[60, 100, 140, 180, 220, 260, 300].map(x => `M${x} 230 v3`).join('')} stroke="#fff" strokeOpacity="0.3" />
      <text x="34" y="106" fill="#fff" fillOpacity="0.4" fontSize="8" fontFamily={MONO}>E[R]</text>
      <text x="330" y="244" textAnchor="end" fill="#fff" fillOpacity="0.4" fontSize="8" fontFamily={MONO}>σ RISK</text>

      {/* candlesticks with drop shadows and volume */}
      <path d={CANDLES.map(([x, , , , , v]) => box(x - 5, 226 - v, 10, v)).join('')} fill={u('vol')} />
      <path d={wicks(UP)} stroke="#34d399" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d={wicks(DOWN)} stroke="#eab308" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d={bodies(CANDLES, 2, 2.5)} fill="#000" fillOpacity="0.45" />
      <path d={bodies(UP)} fill={u('up')} strokeLinejoin="round" stroke="#6ee7b7" strokeOpacity="0.25" strokeWidth="0.6" />
      <path d={bodies(DOWN)} fill={u('side')} />

      {/* feasible set, efficient frontier, capital market line tangent at max Sharpe */}
      {CLOUD_TIERS.map(([d, a], i) => <path key={i} d={d} fill={i ? '#fff' : LIT} fillOpacity={a} />)}
      <path d={`${FRONTIER} V230 H60 Z`} fill={u('area')} />
      <path d="M60 190 C60 212 100 226 156 232" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="3 4" />
      <path d={FRONTIER} stroke={u('curve')} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="200" x2="214" y2="94" stroke={u('cml')} strokeWidth="1.3" strokeDasharray="5 4" />
      <rect x="25" y="197" width="6" height="6" fill="#fff" fillOpacity="0.8" />
      <text x="36" y="216" fill="#fff" fillOpacity="0.5" fontSize="8" fontFamily={MONO}>rf</text>
      <circle cx="60" cy="190" r="3.2" fill="#0a0805" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" />
      <text x="68" y="204" fill="#fff" fillOpacity="0.45" fontSize="7.5" fontFamily={MONO}>MVP</text>
      <circle cx="140" cy="136" r="26" fill={u('halo')} />
      <circle cx="140" cy="136" r="9" stroke={LIT} strokeWidth="1.4" />
      <circle cx="140" cy="136" r="4.5" fill="#fff" />
      <text x="128" y="122" textAnchor="end" fill={LIT} fontSize="9" fontFamily={MONO} fontWeight="700">T* 2.45</text>
      <circle cx="326" cy="96" r="3" fill="#fff" />

      {/* isometric ingot stack on a lit floor */}
      <ellipse cx="184" cy="296" rx="120" ry="16" fill={u('shadow')} />
      <ellipse cx="184" cy="298" rx="112" ry="14" fill={u('warm')} />
      <g transform="translate(178 204)">
        <Bar y0={0} z0={0} u={u} />
        <Bar y0={48} z0={0} u={u} />
        <polygon points={face(FOOT, 22, H)} fill="#2b1a02" fillOpacity="0.45" />
        <Bar y0={24} z0={H} u={u} mark />
      </g>
      <Glint x={202} y={239} u={u} />
      <Glint x={249} y={232} s={0.6} u={u} />

      <rect width="360" height="480" fill={u('vig')} />

      <g transform="translate(24 410)" fontFamily={MONO} fontSize="8" letterSpacing="0.14em">
        <rect width="312" height="1" fill={u('hl')} opacity="0.5" />
        <text y="24" fill="#fff" fillOpacity="0.36">01 — QUANT FINANCE</text>
        <text x="312" y="24" textAnchor="end" fill={LIT} fillOpacity="0.7">XAU · USD</text>
        <path d={RULER} stroke="#fff" strokeOpacity="0.16" />
      </g>

      {/* metrics HUD */}
      <g transform="translate(24 312)" fontFamily={MONO}>
        <rect width="312" height="66" rx="16" fill="#120e07" fillOpacity="0.82" stroke="#eab308" strokeOpacity="0.26" />
        <rect x="20" width="272" height="1" fill={u('hl')} />
        <g fontSize="8.5" fill="#fff" fillOpacity="0.48" letterSpacing="0.1em">
          <text x="18" y="25">MAX SHARPE</text><text x="122" y="25">VOLATILITY</text><text x="222" y="25">FRONTIER</text>
        </g>
        <g fontSize="16" fontWeight="700">
          <text x="18" y="49" fill="#fde68a">2.45</text><text x="122" y="49" fill="#4ade80">4.18%</text><text x="222" y="49" fill={LIT}>OPTIMAL</text>
        </g>
        <path d="M106 16 V50 M206 16 V50" stroke="#fff" strokeOpacity="0.1" />
      </g>
    </svg>
  );
});
