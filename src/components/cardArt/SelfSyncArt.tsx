import { memo, useId } from 'react';

const ACC = 'var(--accent, #3b82f6)';
const LIT = 'color-mix(in oklab, var(--accent, #3b82f6) 62%, #fff)';
const MONO = 'var(--font-mono, monospace)';
const RULER = Array.from({ length: 40 }, (_, i) => `M${i * 8} ${i % 5 ? 37 : 33} V40`).join('');
const SANS = 'var(--font-sans, sans-serif)';
const CX = 180, CY = 196;

// 24 h dial: 12:00 at the top, hours run clockwise (15° each)
const ang = (h: number) => (((h - 12) * 15 - 90) * Math.PI) / 180;
const pt = (h: number, r: number) => `${+(CX + r * Math.cos(ang(h))).toFixed(1)} ${+(CY + r * Math.sin(ang(h))).toFixed(1)}`;
const arc = (r: number, h1: number, h2: number) => `M${pt(h1, r)} A${r} ${r} 0 0 1 ${pt(h2, r)}`;
const ticks = (keep: (i: number) => boolean, r1: number) =>
  Array.from({ length: 96 }, (_, i) => i).filter(keep).map(i => `M${pt(i / 4, r1)} L${pt(i / 4, 90)}`).join('');
const hex = (r: number, rot = 0) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i + rot - 90) * Math.PI) / 180;
    return `${+(CX + r * Math.cos(a)).toFixed(1)},${+(CY + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
// biological energy: alert peaks and recovery troughs, period 180 px
const wave = (amp: number, shift: number) =>
  Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${i * 6} ${+(CY - amp * Math.sin((2 * Math.PI * (i * 6 + shift)) / 180)).toFixed(1)}`).join('');
const BLOCKS = [[14, 16, 'rgba(255,255,255,0.38)'], [20, 21, '#a78bfa']] as const;
const C17 = 2 * Math.PI * 17;

export const SelfSyncCardArt = memo(function SelfSyncCardArt() {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `ss${k}${n}`;
  const u = (n: string) => `url(#ss${k}${n})`;
  return (
    <svg viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="card-art-svg" role="img"
      aria-label="Self-Sync Daily: 24-hour circadian dial with a focus reactor and energy waves" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id('amb')} cx="180" cy="196" r="230" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ACC} stopOpacity="0.34" /><stop offset="0.5" stopColor={ACC} stopOpacity="0.08" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vig')} cx="50%" cy="42%" r="72%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={id('disk')} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#131c3d" stopOpacity="0.97" /><stop offset="1" stopColor="#060918" stopOpacity="0.98" />
        </radialGradient>
        <linearGradient id={id('day')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACC} stopOpacity="0.2" /><stop offset="0.5" stopColor={ACC} stopOpacity="0.03" /><stop offset="0.5" stopColor="#000" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={id('focus')} cx={CX} cy={CY} r="74" gradientUnits="userSpaceOnUse">
          <stop offset="0.3" stopColor={ACC} stopOpacity="0" /><stop offset="1" stopColor={ACC} stopOpacity="0.42" />
        </radialGradient>
        <radialGradient id={id('halo')}>
          <stop offset="0" stopColor={ACC} stopOpacity="0.75" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('sunhalo')}>
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.55" /><stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('moonhalo')}>
          <stop offset="0" stopColor="#c7d2fe" stopOpacity="0.4" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('sun')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7cc" /><stop offset="0.45" stopColor="#fbbf24" /><stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <radialGradient id={id('core')}>
          <stop offset="0" stopColor="#fff" /><stop offset="0.45" stopColor={LIT} /><stop offset="1" stopColor={ACC} />
        </radialGradient>
        <linearGradient id={id('waveA')} x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" /><stop offset="0.5" stopColor={LIT} /><stop offset="1" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id={id('wavefill')} x1="0" y1="160" x2="0" y2="276" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ACC} stopOpacity="0.16" /><stop offset="1" stopColor={ACC} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('hl')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.4" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={id('tex')} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.9" fill="#fff" fillOpacity="0.08" />
        </pattern>
      </defs>

      <rect width="360" height="480" fill="#050812" />
      <rect width="360" height="480" fill={u('tex')} />
      <rect width="360" height="480" fill={u('amb')} />

      {/* header: sync pill + 7-day habit streak (seen on the tall deck card) */}
      <g transform="translate(24 26)">
        <rect width="150" height="26" rx="13" fill={ACC} fillOpacity="0.14" stroke={LIT} strokeOpacity="0.35" />
        <circle cx="14" cy="13" r="7" fill={u('halo')} /><circle cx="14" cy="13" r="3.2" fill="#7dd3fc" />
        <text x="26" y="17" fill="#e0f2fe" fontSize="10.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.04em">SYNCED · 25:00 MIN</text>
      </g>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={252 + i * 12} y="34.5" width="9" height="9" rx="2.5" fill={i < 6 ? LIT : 'none'} fillOpacity={0.25 + i * 0.12}
          stroke={i < 6 ? 'none' : LIT} strokeOpacity="0.7" />
      ))}

      {/* energy waves pass behind the dial's glass */}
      <path d={`${wave(28, 5)} V280 H0 Z`} fill={u('wavefill')} />
      <path d={wave(16, 65)} stroke="#fff" strokeOpacity="0.32" strokeWidth="1.4" strokeDasharray="1 4" strokeLinecap="round" />
      <path d={wave(28, 5)} stroke={u('waveA')} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="168" r="12" fill={u('halo')} /><circle cx="40" cy="168" r="3.2" fill="#fff" />
      <text x="40" y="153" textAnchor="middle" fill={LIT} fontSize="7.5" fontFamily={MONO} fontWeight="700" letterSpacing="0.12em">ALERT</text>
      <circle cx="310" cy="224" r="3" fill="#0b1226" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
      <text x="310" y="243" textAnchor="middle" fill="#fff" fillOpacity="0.5" fontSize="7.5" fontFamily={MONO} letterSpacing="0.12em">REST</text>

      {/* astrolabe */}
      <circle cx={CX} cy={CY} r="100" stroke={LIT} strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="92" fill={u('disk')} stroke="#fff" strokeOpacity="0.16" strokeWidth="1.2" />
      <path d={arc(91, 8, 16)} stroke="#fff" strokeOpacity="0.22" />
      <circle cx={CX} cy={CY} r="74" fill={u('day')} stroke="#fff" strokeOpacity="0.07" />
      <rect x="106" y="195.5" width="148" height="1" fill={u('hl')} />
      <path d={`M${CX} ${CY} L${pt(9, 74)} A74 74 0 0 1 ${pt(11.5, 74)} Z`} fill={u('focus')} />
      <path d={ticks(i => i % 4 !== 0, 86)} stroke="#fff" strokeOpacity="0.16" strokeWidth="0.8" />
      <path d={ticks(i => i % 4 === 0 && i % 24 !== 0, 81)} stroke="#fff" strokeOpacity="0.42" strokeWidth="1.2" />
      <path d={ticks(i => i % 24 === 0, 78)} stroke={LIT} strokeWidth="1.8" strokeLinecap="round" />
      {BLOCKS.map(([a, b, c]) => <path key={a} d={arc(87, a, b)} stroke={c} strokeWidth="5" strokeLinecap="round" />)}
      <path d={arc(87, 9, 11.5)} stroke={ACC} strokeOpacity="0.35" strokeWidth="12" strokeLinecap="round" />
      <path d={arc(87, 9, 11.5)} stroke={LIT} strokeWidth="5" strokeLinecap="round" />
      <g fontFamily={MONO} fontSize="8" fill="#fff" fillOpacity="0.55" textAnchor="middle" letterSpacing="0.04em">
        <text x={CX} y="135">12:00</text><text x="242" y="199">18:00</text><text x={CX} y="263">00:00</text><text x="118" y="199">06:00</text>
      </g>

      <g fontFamily={MONO} fontSize="7" fill="#fff" fillOpacity="0.38" textAnchor="middle">
        {[3, 9, 15, 21].map(h => <text key={h} x={pt(h, 110).split(' ')[0]} y={+pt(h, 110).split(' ')[1] + 2.5}>{String(h).padStart(2, '0')}</text>)}
      </g>

      {/* orbital hand at 10:24, inside the focus block */}
      <path d={`M${pt(10.4, 44)} L${pt(10.4, 80)}`} stroke={LIT} strokeWidth="1.8" strokeLinecap="round" />
      <g transform={`translate(${pt(10.4, 87)})`}><circle r="15" fill={u('halo')} /><circle r="4.5" fill="#fff" /></g>

      {/* hexagonal focus reactor */}
      <circle cx={CX} cy={CY} r="50" stroke={ACC} strokeOpacity="0.12" />
      <circle cx={CX} cy={CY} r="45" stroke={LIT} strokeOpacity="0.2" />
      <polygon points={hex(40)} fill="#0a1028" stroke={LIT} strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points={hex(36.5)} stroke="#fff" strokeOpacity="0.08" />
      <polygon points={hex(27, 30)} fill={ACC} fillOpacity="0.14" stroke={ACC} strokeDasharray="3 3" />
      <path d={hex(40).split(' ').map((p, i) => `M${hex(16).split(' ')[i]} L${p}`).join('')} stroke="#fff" strokeOpacity="0.12" />
      <circle cx={CX} cy={CY} r="24" fill={u('halo')} />
      <polygon points={hex(16)} fill={u('core')} stroke="#fff" strokeOpacity="0.6" strokeLinejoin="round" />
      <circle cx={CX} cy={CY} r="4.5" fill="#fff" />

      {/* sun at noon, crescent moon at midnight */}
      <circle cx={CX} cy="104" r="24" fill={u('sunhalo')} />
      <path d={Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6, r2 = i % 2 ? 13 : 16; return `M${+(CX + 10 * Math.cos(a)).toFixed(1)} ${+(104 + 10 * Math.sin(a)).toFixed(1)} L${+(CX + r2 * Math.cos(a)).toFixed(1)} ${+(104 + r2 * Math.sin(a)).toFixed(1)}`; }).join('')}
        stroke="#fcd34d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={CX} cy="104" r="7.5" fill={u('sun')} />
      <circle cx={CX} cy="288" r="18" fill={u('moonhalo')} />
      <path d="M182.5 280.4 A8 8 0 1 0 182.5 295.6 A9 9 0 0 1 182.5 280.4 Z" fill="#e0e7ff" />

      <rect width="360" height="480" fill={u('vig')} />

      <g transform="translate(24 410)" fontFamily={MONO} fontSize="8" letterSpacing="0.14em">
        <rect width="312" height="1" fill={u('hl')} opacity="0.5" />
        <text y="24" fill="#fff" fillOpacity="0.36">02 — CIRCADIAN PLANNER</text>
        <text x="312" y="24" textAnchor="end" fill={LIT} fillOpacity="0.7">24H · 96 SLOTS</text>
        <path d={RULER} stroke="#fff" strokeOpacity="0.16" />
      </g>

      {/* habit HUD */}
      <g transform="translate(24 312)">
        <rect width="312" height="66" rx="16" fill="#0a1024" fillOpacity="0.86" stroke={LIT} strokeOpacity="0.3" />
        <rect x="20" width="272" height="1" fill={u('hl')} />
        <rect x="16" y="17" width="32" height="32" rx="10" fill={ACC} fillOpacity="0.2" stroke={LIT} strokeOpacity="0.55" />
        <path d="M24.5 33.5 L30 39 L40.5 27.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="31" fill="#f8fafc" fontSize="14.5" fontFamily={SANS} fontWeight="600">Deep Work Session</text>
        <text x="60" y="48" fill="#fff" fillOpacity="0.5" fontSize="8.5" fontFamily={MONO} letterSpacing="0.06em">DONE · 25:00 · STREAK 28D</text>
        <g transform="translate(276 33)">
          <circle r="17" stroke="#fff" strokeOpacity="0.1" strokeWidth="4" />
          <circle r="17" transform="rotate(-90)" stroke={LIT} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${0.92 * C17} ${C17}`} />
          <text y="3.5" textAnchor="middle" fill="#fff" fontSize="9.5" fontFamily={MONO} fontWeight="700">92%</text>
        </g>
      </g>
    </svg>
  );
});
