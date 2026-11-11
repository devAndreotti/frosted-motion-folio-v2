import { memo, useId } from 'react';

const ACC = 'var(--accent, #22c55e)';
const LIT = 'color-mix(in oklab, var(--accent, #22c55e) 62%, #fff)';
const INK = 'var(--accent-text, #0a0a0a)';
const MONO = 'var(--font-mono, monospace)';
const RULER = Array.from({ length: 40 }, (_, i) => `M${i * 8} ${i % 5 ? 37 : 33} V40`).join('');
const SANS = 'var(--font-sans, sans-serif)';

// ingredient tokens are the network's input layer
const PILLS = [['BASIL', '#4ade80', 110], ['TOMATO', '#f87171', 148], ['PARMESAN', '#fde68a', 186]] as const;
const LATENT = [104, 132, 160, 188, 216];
const SYNAPSES = PILLS.flatMap(([, , y]) => LATENT.map(ly => `M104 ${y + 12} L136 ${ly}`)).join('');
const TO_OUT = LATENT.map(ly => `M136 ${ly} Q${170 + ly * 0.05} ${ly - 40} 222 124`).join('');
const BLADE = 'M0 -30 L126 -30 C150 -30 166 -19 174 -3 C150 1 60 2 0 0 Z';
const DAMASCUS = Array.from({ length: 9 }, (_, i) => {
  const y = -27 + i * 3.3, d = (i % 3) * 9;
  return `M${-6 + d} ${y} C${28 + d} ${y - 4} ${52 + d} ${y + 4} ${86 + d} ${y} S${148 + d} ${y - 4} ${184} ${y + 1}`;
});
const TOMATOES = [[207, 224], [233, 221], [240, 228], [214, 230]];
const STEAM = ['M208 212 C202 202 214 194 208 184', 'M222 210 C216 198 230 190 222 176', 'M236 212 C230 203 242 196 236 186'];

export const ChefAiCardArt = memo(function ChefAiCardArt() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `ca${k}${n}`;
  const u = (n: string) => `url(#ca${k}${n})`;
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-art-svg" role="img"
      aria-label="Chef AI: ingredient tokens feed a neural network into a glass cloche, with a Damascus knife" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id('amb')} cx="200" cy="190" r="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ACC} stopOpacity="0.3" /><stop offset="0.5" stopColor={ACC} stopOpacity="0.07" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('emerald')}>
          <stop offset="0" stopColor="#10b981" stopOpacity="0.24" /><stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vig')} cx="50%" cy="42%" r="72%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={id('halo')}>
          <stop offset="0" stopColor={ACC} stopOpacity="0.7" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#000" stopOpacity="0.7" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.55" stopColor="#fff" stopOpacity="0.04" /><stop offset="1" stopColor={ACC} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={id('glare')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.6" stopColor="#fff" stopOpacity="0.75" /><stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={id('silver')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" /><stop offset="0.5" stopColor="#cbd5e1" /><stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id={id('base')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#334155" /><stop offset="0.35" stopColor="#cbd5e1" /><stop offset="0.6" stopColor="#94a3b8" /><stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={id('steel')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b5563" /><stop offset="0.25" stopColor="#9ca3af" /><stop offset="0.6" stopColor="#e5e7eb" /><stop offset="0.85" stopColor="#f9fafb" /><stop offset="1" stopColor="#d1d5db" />
        </linearGradient>
        <linearGradient id={id('wood')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3628" /><stop offset="0.5" stopColor="#2a1d15" /><stop offset="1" stopColor="#140d09" />
        </linearGradient>
        <linearGradient id={id('pesto')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a3e635" /><stop offset="1" stopColor="#3f6212" />
        </linearGradient>
        <linearGradient id={id('steam')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('btn')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIT} /><stop offset="1" stopColor={ACC} />
        </linearGradient>
        <linearGradient id={id('hl')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.4" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('blade')}><path d={BLADE} /></clipPath>
        <pattern id={id('tex')} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" stroke="#22c55e" strokeOpacity="0.07" strokeWidth="0.8" />
        </pattern>
      </defs>

      <rect width="360" height="480" fill="#040b07" />
      <rect width="360" height="480" fill={u('tex')} />
      <rect width="360" height="480" fill={u('amb')} />
      <circle cx="222" cy="206" r="120" fill={u('emerald')} />

      {/* header: model pill + temperature chip (seen on the tall deck card) */}
      <g transform="translate(24 26)" fontFamily={MONO} fontWeight="700">
        <rect width="150" height="26" rx="13" fill={ACC} fillOpacity="0.14" stroke={LIT} strokeOpacity="0.35" />
        <circle cx="14" cy="13" r="7" fill={u('halo')} /><circle cx="14" cy="13" r="3.2" fill="#4ade80" />
        <text x="26" y="17" fill="#dcfce7" fontSize="10.5" letterSpacing="0.04em">MODEL · GEMINI AI</text>
        <rect x="238" width="74" height="26" rx="13" stroke="#fff" strokeOpacity="0.16" />
        <text x="275" y="17" textAnchor="middle" fill="#fff" fillOpacity="0.65" fontSize="9.5">TEMP 0.7</text>
      </g>

      {/* neural graph: tokens -> latent layer -> cloche */}
      <path d={SYNAPSES} stroke={LIT} strokeOpacity="0.16" strokeWidth="0.8" />
      <path d={TO_OUT} stroke={LIT} strokeOpacity="0.22" strokeWidth="0.9" />
      <path d="M104 122 L136 132 Q176.6 92 222 124" stroke={LIT} strokeWidth="1.6" strokeLinecap="round" />
      {[[120, 127], [160.8, 114.5], [195.2, 111.3]].map(([x, y]) => (
        <g key={x}><circle cx={x} cy={y} r="7" fill={u('halo')} /><circle cx={x} cy={y} r="2" fill="#fff" /></g>
      ))}
      {LATENT.map((ly, i) => (
        <circle key={ly} cx="136" cy={ly} r="3.6" fill="#06140c" stroke={i === 1 ? '#fff' : LIT} strokeOpacity={i === 1 ? 1 : 0.6} strokeWidth="1.3" />
      ))}
      {PILLS.map(([name, dot, y]) => (
        <g key={name} transform={`translate(20 ${y})`} fontFamily={MONO}>
          <rect width="84" height="24" rx="12" fill="#fff" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.16" />
          <rect x="12" width="60" height="1" fill={u('hl')} />
          <circle cx="12" cy="12" r="3.5" fill={dot} />
          <text x="22" y="15.5" fill="#fff" fillOpacity="0.88" fontSize="8.5" fontWeight="700" letterSpacing="0.06em">{name}</text>
          <circle cx="84" cy="12" r="2.4" fill={LIT} />
        </g>
      ))}

      {/* cloche: silver plate, dish behind glass, dome highlights, knob */}
      <ellipse cx="222" cy="262" rx="104" ry="12" fill={u('shadow')} />
      <ellipse cx="222" cy="245" rx="88" ry="12" fill={u('base')} />
      <ellipse cx="222" cy="240" rx="86" ry="10" fill={u('silver')} />
      <ellipse cx="222" cy="240" rx="72" ry="7" fill="#0f172a" fillOpacity="0.55" />
      <ellipse cx="222" cy="234" rx="44" ry="6.5" fill="#e2e8f0" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
      <ellipse cx="222" cy="227" rx="27" ry="9" fill={u('pesto')} />
      <path d="M204 226 C212 220 232 220 240 226 M208 230 C216 226 230 226 236 230" stroke="#ecfccb" strokeOpacity="0.5" strokeWidth="1.1" />
      <path d={TOMATOES.map(([x, y]) => `M${x - 4.6} ${y}a4.6 3.6 0 1 0 9.2 0a4.6 3.6 0 1 0 -9.2 0`).join('')} fill="#ef4444" />
      <path d={TOMATOES.map(([x, y]) => `M${x - 2.6} ${y - 1.2}a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0`).join('')} fill="#fff" fillOpacity="0.7" />
      {[[216, 217, -24], [228, 223, 28]].map(([x, y, r]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0 C4 -5 12 -5 16 0 C12 5 4 5 0 0 Z" fill="#22c55e" /><path d="M1 0 H14" stroke="#14532d" strokeWidth="0.7" />
        </g>
      ))}
      <path d="M222 219 l2.5 -2 l2.5 2.4 z M211 222 l2 -1.6 l1.6 2 z" fill="#fef3c7" />
      {STEAM.map(d => <path key={d} d={d} stroke={u('steam')} strokeWidth="1.6" strokeLinecap="round" />)}
      <path d="M150 240 C150 180 184 152 222 152 C260 152 294 180 294 240 Z" fill={u('glass')} stroke="#fff" strokeOpacity="0.42" strokeWidth="1.2" />
      <path d="M164 228 C162 198 176 174 200 161" stroke={u('glare')} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M276 196 C279 206 281 216 281 228" stroke="#fff" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
      <path d="M290 222 C288 192 272 168 246 157" stroke={LIT} strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M192 216 V210 H198 M246 210 H252 V216 M252 234 V240 H246 M198 240 H192 V234" stroke={LIT} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="190" y="199.6" width="51" height="9" rx="2" fill="#06140c" fillOpacity="0.75" />
      <text x="192" y="206" fill={LIT} fontSize="6.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.08em">PESTO · 0.98</text>
      <ellipse cx="222" cy="240" rx="72" ry="7" stroke="#fff" strokeOpacity="0.3" />
      <rect x="218.5" y="143" width="7" height="10" rx="2" fill={u('silver')} />
      <ellipse cx="222" cy="142" rx="9" ry="6" fill={u('silver')} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" />
      <circle cx="222" cy="124" r="13" fill={u('halo')} />
      <circle cx="222" cy="124" r="5" fill="#06140c" stroke={LIT} strokeWidth="1.6" />
      <circle cx="222" cy="124" r="2" fill="#fff" />
      <path d="M222 130 V135" stroke={LIT} strokeOpacity="0.7" strokeDasharray="1.5 1.5" />

      {/* floating Damascus santoku */}
      <ellipse cx="172" cy="320" rx="114" ry="6" fill={u('shadow')} />
      <g transform="translate(120 303) rotate(-6)">
        <path d={BLADE} fill={u('steel')} />
        <g clipPath={u('blade')}>
          <path d={DAMASCUS.filter((_, i) => i % 2 === 0).join('')} stroke="#fff" strokeOpacity="0.3" strokeWidth="1.1" />
          <path d={DAMASCUS.filter((_, i) => i % 2).join('')} stroke="#1f2937" strokeOpacity="0.22" strokeWidth="1.1" />
          <path d="M44 -34 h18 l-28 40 h-18 Z M70 -34 h6 l-28 40 h-6 Z" fill={ACC} fillOpacity="0.32" />
        </g>
        <path d="M0 -9 C60 -7 140 -8 168 -9" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
        <path d="M2 -0.8 C60 1.4 150 0.4 172 -3" stroke="#fff" strokeOpacity="0.95" strokeWidth="0.9" />
        <path d="M0 -29.4 H126 C148 -29.4 163 -19 171 -5" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" />
        <path d={BLADE} stroke="#111827" strokeOpacity="0.5" strokeWidth="0.6" />
        <rect x="-9" y="-28" width="9" height="26" rx="2" fill={u('silver')} />
        <path d="M-1 -27 V-3" stroke={LIT} strokeWidth="1.2" />
        <path d="M-9 -26 L-78 -24 C-86 -23.5 -89 -19 -89 -15 C-89 -11 -86 -7 -78 -6.5 L-9 -4 Z" fill={u('wood')} stroke="#000" strokeOpacity="0.4" />
        <path d="M-14 -20 C-36 -18 -56 -21 -82 -18 M-14 -10 C-40 -12 -60 -9 -82 -11" stroke="#6b5240" strokeOpacity="0.5" strokeWidth="0.7" />
        {[-26, -48, -70].map(x => <circle key={x} cx={x} cy="-15" r="2.2" fill={u('silver')} stroke="#000" strokeOpacity="0.3" />)}
      </g>

      <rect width="360" height="480" fill={u('vig')} />

      <g transform="translate(24 410)" fontFamily={MONO} fontSize="8" letterSpacing="0.14em">
        <rect width="312" height="1" fill={u('hl')} opacity="0.5" />
        <text y="24" fill="#fff" fillOpacity="0.36">03 — GENERATIVE KITCHEN</text>
        <text x="312" y="24" textAnchor="end" fill={LIT} fillOpacity="0.7">GEMINI + N8N</text>
        <path d={RULER} stroke="#fff" strokeOpacity="0.16" />
      </g>

      {/* generation console */}
      <g transform="translate(24 312)">
        <rect width="312" height="66" rx="16" fill="#06140c" fillOpacity="0.88" stroke={LIT} strokeOpacity="0.3" />
        <rect x="20" width="272" height="1" fill={u('hl')} />
        <text x="18" y="22" fill="#fff" fillOpacity="0.45" fontSize="8" fontFamily={MONO} letterSpacing="0.1em">OUTPUT · RECIPE #042</text>
        <text x="18" y="42" fill="#f0fdf4" fontSize="15" fontFamily={SANS} fontWeight="700">Pesto di Pomodoro</text>
        <text x="18" y="56" fill="#86efac" fillOpacity="0.85" fontSize="8" fontFamily={MONO} letterSpacing="0.06em">3 TOKENS · 12 MIN · 98% MATCH</text>
        <ellipse cx="262" cy="33" rx="46" ry="24" fill={u('halo')} />
        <rect x="228" y="15" width="68" height="36" rx="12" fill={u('btn')} stroke="#fff" strokeOpacity="0.35" />
        <path d="M246 27 l1.6 4.4 l4.4 1.6 l-4.4 1.6 l-1.6 4.4 l-1.6 -4.4 l-4.4 -1.6 l4.4 -1.6 z" fill={INK} />
        <text x="270" y="37.5" textAnchor="middle" fill={INK} fontSize="12" fontFamily={MONO} fontWeight="800" letterSpacing="0.08em">GEN</text>
      </g>
    </svg>
  );
});
