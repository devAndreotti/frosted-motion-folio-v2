import { memo, useId } from 'react';

const ACC = 'var(--accent, #a855f7)';
const LIT = 'color-mix(in oklab, var(--accent, #a855f7) 62%, #fff)';
const MONO = 'var(--font-mono, monospace)';
const RULER = Array.from({ length: 40 }, (_, i) => `M${i * 8} ${i % 5 ? 37 : 33} V40`).join('');
const SANS = 'var(--font-sans, sans-serif)';
const CX = 180, CY = 196;

// PCB traces from the monogram frame out to the card edges (45° bends, pads at the ends)
const TRACES = [
  [[118, 170], [96, 170], [78, 152], [22, 152]],
  [[118, 222], [96, 222], [78, 240], [22, 240]],
  [[242, 170], [264, 170], [282, 152], [338, 152]],
  [[242, 222], [264, 222], [282, 240], [338, 240]],
  [[152, 134], [152, 118], [136, 102], [136, 72]],
  [[208, 258], [208, 268], [224, 284], [224, 300]],
];
// orbital nodes at the cardinal angles (0° = right, clockwise)
const NODES = [[0, 280, 196, 292, 199, 'start'], [90, 180, 296, 192, 299, 'start'], [180, 80, 196, 68, 199, 'end'], [270, 180, 96, 192, 99, 'start']] as const;

export const PersonalCardArt = memo(function PersonalCardArt() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `pa${k}${n}`;
  const u = (n: string) => `url(#pa${k}${n})`;
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-art-svg" role="img"
      aria-label="Ricardo Andreotti: RA monogram in a glass frame on a circuit lattice" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id('amb')} cx="180" cy="196" r="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ACC} stopOpacity="0.38" /><stop offset="0.5" stopColor={ACC} stopOpacity="0.08" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vig')} cx="50%" cy="42%" r="72%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={id('halo')}>
          <stop offset="0" stopColor={ACC} stopOpacity="0.75" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#000" stopOpacity="0.7" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.03" /><stop offset="1" stopColor={ACC} stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={id('border')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" /><stop offset="0.45" stopColor={LIT} /><stop offset="1" stopColor={ACC} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('ink')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor={LIT} />
        </linearGradient>
        <linearGradient id={id('hl')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.5" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('frame')}><rect x="118" y="134" width="124" height="124" rx="30" /></clipPath>
        <pattern id={id('tex')} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" stroke="#fff" strokeOpacity="0.045" strokeWidth="0.8" />
          <circle cx="12" cy="12" r="1.1" fill="#fff" fillOpacity="0.09" />
        </pattern>
      </defs>

      <rect width="360" height="480" fill="#07060c" />
      <rect width="360" height="480" fill={u('tex')} />
      <rect width="360" height="480" fill={u('amb')} />

      {/* header: availability seal + hex id (seen on the tall deck card) */}
      <g transform="translate(24 26)" fontFamily={MONO} fontWeight="700">
        <rect width="184" height="26" rx="13" fill={ACC} fillOpacity="0.14" stroke={LIT} strokeOpacity="0.35" />
        <circle cx="14" cy="13" r="9" stroke="#22c55e" strokeOpacity="0.22" />
        <circle cx="14" cy="13" r="6" stroke="#22c55e" strokeOpacity="0.45" />
        <circle cx="14" cy="13" r="3.2" fill="#22c55e" />
        <text x="28" y="17" fill="#f4f4f5" fontSize="10" letterSpacing="0.06em">AVAILABLE FOR PROJECTS</text>
        <text x="312" y="17" textAnchor="end" fill="#fff" fillOpacity="0.45" fontSize="9.5">ID 0x5241</text>
      </g>

      {/* circuit lattice + orbit */}
      <g stroke={LIT} strokeOpacity="0.32" strokeWidth="1.2" strokeLinejoin="round">
        {TRACES.map(t => <polyline key={t.join()} points={t.join(' ')} />)}
        <path d="M118 196 H80 M242 196 H280 M180 134 V96 M180 258 V296" strokeOpacity="0.5" />
      </g>
      <path d={TRACES.map(t => `M${t[3][0] - 2.6} ${t[3][1]}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0`).join('')} fill="#07060c" stroke={LIT} strokeOpacity="0.6" />
      <path d={TRACES.flatMap(t => t.slice(1, 3)).map(([x, y]) => `M${x - 1.7} ${y}a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0`).join('')} fill={LIT} fillOpacity="0.55" />
      {[[60, 152], [300, 240], [136, 92]].map(([x, y]) => (
        <g key={x}><circle cx={x} cy={y} r="7" fill={u('halo')} /><circle cx={x} cy={y} r="1.8" fill="#fff" /></g>
      ))}
      <circle cx={CX} cy={CY} r="114" stroke="#fff" strokeOpacity="0.06" />
      <circle cx={CX} cy={CY} r="100" stroke={LIT} strokeOpacity="0.32" strokeDasharray="2 6" strokeLinecap="round" />
      {NODES.map(([deg, x, y, tx, ty, anchor]) => (
        <g key={deg}>
          <circle cx={x} cy={y} r="14" fill={u('halo')} />
          <circle cx={x} cy={y} r="6" fill="#0b0a12" stroke={LIT} strokeWidth="1.5" />
          <circle cx={x} cy={y} r="2.4" fill="#fff" />
          <text x={tx} y={ty} textAnchor={anchor} fill="#fff" fillOpacity="0.45" fontSize="7.5" fontFamily={MONO}>{deg}°</text>
        </g>
      ))}

      {/* bevelled glass monogram */}
      <ellipse cx={CX} cy="270" rx="78" ry="12" fill={u('shadow')} />
      <circle cx={CX} cy={CY} r="96" fill={u('halo')} opacity="0.45" />
      <rect x="118" y="134" width="124" height="124" rx="30" fill="#0e0c16" fillOpacity="0.88" />
      <rect x="118" y="134" width="124" height="124" rx="30" fill={u('glass')} stroke={u('border')} strokeWidth="2" />
      <rect x="125" y="141" width="110" height="110" rx="24" fill="#05040a" fillOpacity="0.35" stroke="#fff" strokeOpacity="0.1" />
      <rect x="146" y="134.5" width="68" height="1.2" fill={u('hl')} />
      <g clipPath={u('frame')}>
        <path d="M118 134 H186 L118 214 Z" fill="#fff" fillOpacity="0.06" />
      </g>
      <path d="M142 168 H134 V226 H142 M218 168 H226 V226 H218" stroke={LIT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x={CX} y="215" textAnchor="middle" fill="#000" fillOpacity="0.45" fontSize="52" fontFamily={SANS} fontWeight="800" letterSpacing="-0.04em" dy="2">RA</text>
      <text x={CX} y="215" textAnchor="middle" fill={u('ink')} fontSize="52" fontFamily={SANS} fontWeight="800" letterSpacing="-0.04em">RA</text>
      <text x={CX} y="244" textAnchor="middle" fill="#fff" fillOpacity="0.38" fontSize="6.5" fontFamily={MONO} letterSpacing="0.3em">DEV · ANDREOTTI</text>

      <rect width="360" height="480" fill={u('vig')} />

      <g className="card-art-hud" transform="translate(24 410)" fontFamily={MONO} fontSize="8" letterSpacing="0.14em">
        <rect width="312" height="1" fill={u('hl')} opacity="0.5" />
        <text y="24" fill="#fff" fillOpacity="0.36">05 — IDENTITY</text>
        <text x="312" y="24" textAnchor="end" fill={LIT} fillOpacity="0.7">SYS · GFX · WEB</text>
        <path d={RULER} stroke="#fff" strokeOpacity="0.16" />
      </g>

      {/* identity HUD */}
      <g className="card-art-hud" transform="translate(24 306)">
        <rect width="312" height="76" rx="16" fill="#100e18" fillOpacity="0.88" stroke={LIT} strokeOpacity="0.3" />
        <rect x="20" width="272" height="1" fill={u('hl')} />
        <text x="20" y="29" fill="#fff" fontSize="17" fontFamily={SANS} fontWeight="700" letterSpacing="-0.01em">Ricardo Andreotti</text>
        <text x="292" y="28" textAnchor="end" fill="#fff" fillOpacity="0.35" fontSize="8" fontFamily={MONO}>devandreotti.com</text>
        <text x="20" y="48" fill={LIT} fontSize="9.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.06em">FULL STACK · WEBGL · RUST &amp; GODOT 4</text>
        <text x="20" y="65" fill="#fff" fillOpacity="0.55" fontSize="10.5" fontFamily={SANS}>Técnico &amp; Ciência da Computação (UNIP)</text>
      </g>
    </svg>
  );
});
