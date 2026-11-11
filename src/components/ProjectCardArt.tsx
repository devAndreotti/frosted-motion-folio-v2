import type { ReactNode } from 'react';

/**
 * High-fidelity vector artwork for the CardStack hero cards.
 * Designed to replace blurry UI screenshots with crisp, theme-reactive SVGs
 * that respond dynamically to the active palette via CSS custom properties.
 */

export const GoldPortfolioCardArt = () => (
  <svg
    viewBox="0 0 360 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="card-art-svg"
    role="img"
    aria-label="Gold Portfolio Analyzer Graphic"
  >
    <defs>
      <radialGradient id="gp-glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.25" />
        <stop offset="50%" stopColor="var(--accent, #eab308)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gp-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#eab308" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="gp-curve" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="var(--accent, #eab308)" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="gp-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--accent, #eab308)" stopOpacity="0" />
      </linearGradient>
      <pattern id="gp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
      </pattern>
    </defs>

    {/* Background */}
    <rect width="360" height="480" fill="#0d0c07" />
    <rect width="360" height="480" fill="url(#gp-grid)" />
    <circle cx="180" cy="200" r="160" fill="url(#gp-glow)" />

    {/* Ambient Rings */}
    <circle cx="180" cy="190" r="130" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1" strokeDasharray="4 6" />
    <circle cx="180" cy="190" r="95" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

    {/* Metric Badge Top */}
    <g transform="translate(32, 36)">
      <rect width="118" height="24" rx="12" fill="rgba(234, 179, 8, 0.12)" stroke="rgba(234, 179, 8, 0.3)" />
      <circle cx="12" cy="12" r="4" fill="var(--accent, #eab308)" />
      <text x="24" y="16" fill="#fef08a" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="600" letterSpacing="0.08em">
        YIELD +18.4%
      </text>
    </g>

    {/* Candlesticks Matrix */}
    <g opacity="0.65" transform="translate(40, 110)">
      <line x1="20" y1="20" x2="20" y2="90" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="1" />
      <rect x="15" y="38" width="10" height="35" rx="2" fill="url(#gp-gold)" />

      <line x1="55" y1="10" x2="55" y2="85" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" />
      <rect x="50" y="24" width="10" height="44" rx="2" fill="#22c55e" opacity="0.8" />

      <line x1="90" y1="30" x2="90" y2="105" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="1" />
      <rect x="85" y="48" width="10" height="28" rx="2" fill="url(#gp-gold)" />

      <line x1="230" y1="15" x2="230" y2="75" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1" />
      <rect x="225" y="22" width="10" height="36" rx="2" fill="#22c55e" opacity="0.8" />
    </g>

    {/* Ascending Investment Yield Area & Curve */}
    <path
      d="M 32 300 Q 90 290 140 240 T 250 160 T 328 100 L 328 340 L 32 340 Z"
      fill="url(#gp-fill)"
    />
    <path
      d="M 32 300 Q 90 290 140 240 T 250 160 T 328 100"
      stroke="url(#gp-curve)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Data Points */}
    <circle cx="140" cy="240" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="250" cy="160" r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="328" cy="100" r="6" fill="#ffffff" stroke="var(--accent, #eab308)" strokeWidth="2.5" />

    {/* 3D Gold Bullion Ingot Centerpiece */}
    <g transform="translate(180, 205)">
      {/* Top face */}
      <polygon points="0,-32 58,-14 0,6 -58,-14" fill="#fef08a" opacity="0.95" />
      {/* Right face */}
      <polygon points="58,-14 58,16 0,36 0,6" fill="#ca8a04" />
      {/* Left face */}
      <polygon points="-58,-14 0,6 0,36 -58,16" fill="#854d0e" />
      {/* Highlights */}
      <line x1="0" y1="6" x2="0" y2="36" stroke="#fef08a" strokeWidth="1.5" opacity="0.6" />
      {/* Monogram Stamp */}
      <text x="0" y="-10" textAnchor="middle" fill="#854d0e" fontSize="8" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.1em">
        AU 999.9
      </text>
    </g>

    {/* Technical telemetry bottom overlay */}
    <g transform="translate(32, 360)">
      <rect width="296" height="58" rx="14" fill="rgba(20, 18, 12, 0.75)" stroke="rgba(234, 179, 8, 0.25)" />
      <text x="18" y="24" fill="rgba(255, 255, 255, 0.5)" fontSize="10" fontFamily="var(--font-mono, monospace)">
        PORTFOLIO RISK
      </text>
      <text x="18" y="44" fill="#fef08a" fontSize="14" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        SHARPE 2.45
      </text>

      <line x1="148" y1="12" x2="148" y2="46" stroke="rgba(255, 255, 255, 0.1)" />

      <text x="166" y="24" fill="rgba(255, 255, 255, 0.5)" fontSize="10" fontFamily="var(--font-mono, monospace)">
        ALLOCATION
      </text>
      <text x="166" y="44" fill="var(--accent, #eab308)" fontSize="14" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        BALANCED
      </text>
    </g>
  </svg>
);

export const SelfSyncCardArt = () => (
  <svg
    viewBox="0 0 360 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="card-art-svg"
    role="img"
    aria-label="Self-Sync Daily Graphic"
  >
    <defs>
      <radialGradient id="ss-glow" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.3" />
        <stop offset="60%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ss-wave" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="var(--accent, #3b82f6)" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <pattern id="ss-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="1" fill="rgba(255, 255, 255, 0.08)" />
      </pattern>
    </defs>

    {/* Background */}
    <rect width="360" height="480" fill="#080c16" />
    <rect width="360" height="480" fill="url(#ss-grid)" />
    <circle cx="180" cy="210" r="160" fill="url(#ss-glow)" />

    {/* Header Status */}
    <g transform="translate(32, 36)">
      <rect width="132" height="24" rx="12" fill="rgba(59, 130, 246, 0.15)" stroke="rgba(59, 130, 246, 0.3)" />
      <circle cx="14" cy="12" r="4" fill="#38bdf8" />
      <text x="26" y="16" fill="#bfdbfe" fontSize="10" fontFamily="var(--font-mono, monospace)" fontWeight="600" letterSpacing="0.08em">
        FOCUS 25:00 MIN
      </text>
    </g>

    {/* 24-Hour Circadian Orbital Dial */}
    <g transform="translate(180, 200)">
      <circle r="115" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" strokeDasharray="3 6" />
      <circle r="92" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

      {/* Degree ticks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="0"
          y1="-92"
          x2="0"
          y2="-84"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.5"
          transform={`rotate(${deg})`}
        />
      ))}

      {/* Sun marker at top (12h) */}
      <circle cx="0" cy="-115" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

      {/* Moon marker at bottom (00h) */}
      <path d="M -4 112 A 6 6 0 0 0 4 120 A 4 4 0 0 1 -4 112" fill="#93c5fd" />

      {/* Central Hexagonal Focus Core */}
      <polygon points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21" fill="rgba(30, 58, 138, 0.6)" stroke="#60a5fa" strokeWidth="2" />
      <polygon points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14" fill="rgba(59, 130, 246, 0.35)" />
      <circle r="10" fill="#ffffff" />
      <circle r="4" fill="var(--accent, #3b82f6)" />
    </g>

    {/* Harmonic Energy Waveform */}
    <path
      d="M 28 320 C 70 280, 110 350, 160 300 C 210 250, 260 340, 332 290"
      stroke="url(#ss-wave)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M 28 335 C 70 310, 120 370, 170 325 C 220 280, 270 355, 332 315"
      stroke="rgba(56, 189, 248, 0.35)"
      strokeWidth="1.5"
      strokeDasharray="4 4"
    />

    {/* Planner Progress Checklist */}
    <g transform="translate(32, 370)">
      <rect width="296" height="52" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(59, 130, 246, 0.25)" />
      {/* Task 1 */}
      <rect x="18" y="16" width="18" height="18" rx="5" fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" />
      <path d="M 22 25 L 25 28 L 32 20" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="29" fill="#f1f5f9" fontSize="12" fontFamily="var(--font-sans, sans-serif)" fontWeight="500">
        Deep Work Session
      </text>

      {/* Progress pill */}
      <rect x="216" y="16" width="64" height="20" rx="10" fill="rgba(56, 189, 248, 0.15)" />
      <text x="248" y="30" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        84%
      </text>
    </g>
  </svg>
);

export const ChefAiCardArt = () => (
  <svg
    viewBox="0 0 360 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="card-art-svg"
    role="img"
    aria-label="Chef AI Graphic"
  >
    <defs>
      <radialGradient id="ca-glow" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #22c55e)" stopOpacity="0.28" />
        <stop offset="55%" stopColor="var(--accent, #22c55e)" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ca-knife" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0fdf4" />
        <stop offset="50%" stopColor="#86efac" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
      <pattern id="ca-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(34, 197, 94, 0.06)" strokeWidth="1" />
      </pattern>
    </defs>

    {/* Background */}
    <rect width="360" height="480" fill="#051009" />
    <rect width="360" height="480" fill="url(#ca-grid)" />
    <circle cx="180" cy="200" r="160" fill="url(#ca-glow)" />

    {/* Header Status */}
    <g transform="translate(32, 36)">
      <rect width="138" height="24" rx="12" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.35)" />
      <circle cx="14" cy="12" r="4" fill="#4ade80" />
      <text x="26" y="16" fill="#bbf7d0" fontSize="10" fontFamily="var(--font-mono, monospace)" fontWeight="600" letterSpacing="0.08em">
        MODEL: GEMINI AI
      </text>
    </g>

    {/* Synaptic Neural Network Constellation */}
    <g opacity="0.45" stroke="rgba(74, 222, 128, 0.35)" strokeWidth="1.2">
      <line x1="60" y1="120" x2="110" y2="160" />
      <line x1="110" y1="160" x2="180" y2="140" />
      <line x1="180" y1="140" x2="250" y2="160" />
      <line x1="250" y1="160" x2="300" y2="120" />
      <line x1="110" y1="160" x2="140" y2="230" />
      <line x1="250" y1="160" x2="220" y2="230" />
      <line x1="140" y1="230" x2="180" y2="280" />
      <line x1="220" y1="230" x2="180" y2="280" />
    </g>
    {[
      [60, 120], [110, 160], [180, 140], [250, 160], [300, 120],
      [140, 230], [220, 230], [180, 280]
    ].map(([x, y], idx) => (
      <circle key={idx} cx={x} cy={y} r="3" fill="#86efac" />
    ))}

    {/* Stylized Cloche (Covered Dish) & AI Spark Core */}
    <g transform="translate(180, 205)">
      {/* Dish base plate */}
      <ellipse cx="0" cy="42" rx="76" ry="12" fill="rgba(22, 101, 52, 0.6)" stroke="#4ade80" strokeWidth="1.8" />
      <line x1="-80" y1="44" x2="80" y2="44" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />

      {/* Cloche Dome */}
      <path
        d="M -60 38 C -60 -20, 60 -20, 60 38 Z"
        fill="rgba(34, 197, 94, 0.2)"
        stroke="#86efac"
        strokeWidth="2.2"
      />
      {/* Dome Handle */}
      <circle cx="0" cy="-24" r="7" fill="#86efac" stroke="#15803d" strokeWidth="2" />

      {/* Floating Chef Knife in negative space */}
      <g transform="translate(0, 12) rotate(-35)">
        <path d="M 0,-32 L 8,-30 L 10,16 L 0,20 Z" fill="url(#ca-knife)" />
        <rect x="-2" y="20" width="6" height="18" rx="2" fill="#14532d" />
      </g>

      {/* AI Sparkles */}
      <path d="M -35,-8 Q -30,-8 -30,-14 Q -30,-8 -25,-8 Q -30,-8 -30,-2 Q -30,-8 -35,-8 Z" fill="#bbf7d0" />
      <path d="M 32,5 Q 36,5 36,0 Q 36,5 40,5 Q 36,5 36,10 Q 36,5 32,5 Z" fill="#bbf7d0" />
    </g>

    {/* Recipe Generation Prompt Terminal Card */}
    <g transform="translate(32, 360)">
      <rect width="296" height="58" rx="14" fill="rgba(8, 28, 16, 0.85)" stroke="rgba(74, 222, 128, 0.3)" />
      <text x="18" y="24" fill="rgba(187, 247, 208, 0.6)" fontSize="10" fontFamily="var(--font-mono, monospace)">
        INPUT INGREDIENTS
      </text>
      <text x="18" y="44" fill="#f0fdf4" fontSize="13" fontFamily="var(--font-mono, monospace)" fontWeight="600">
        TOMATO · BASIL · PASTA
      </text>

      <g transform="translate(242, 18)">
        <rect width="40" height="22" rx="6" fill="#22c55e" />
        <text x="20" y="15" textAnchor="middle" fill="#052e16" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
          GEN
        </text>
      </g>
    </g>
  </svg>
);

export const GitWizardCardArt = () => (
  <svg
    viewBox="0 0 360 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="card-art-svg"
    role="img"
    aria-label="Git Wizard Commander Graphic"
  >
    <defs>
      <radialGradient id="gw-glow" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #a855f7)" stopOpacity="0.32" />
        <stop offset="55%" stopColor="var(--accent, #a855f7)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <pattern id="gw-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(168, 85, 247, 0.08)" strokeWidth="1" />
      </pattern>
    </defs>

    {/* Background */}
    <rect width="360" height="480" fill="#0c0615" />
    <rect width="360" height="480" fill="url(#gw-grid)" />
    <circle cx="180" cy="190" r="160" fill="url(#gw-glow)" />

    {/* Header Status */}
    <g transform="translate(32, 36)">
      <rect width="138" height="24" rx="12" fill="rgba(168, 85, 247, 0.16)" stroke="rgba(168, 85, 247, 0.35)" />
      <circle cx="14" cy="12" r="4" fill="#c084fc" />
      <text x="26" y="16" fill="#f3e8ff" fontSize="10" fontFamily="var(--font-mono, monospace)" fontWeight="600" letterSpacing="0.08em">
        BRANCH: MAIN
      </text>
    </g>

    {/* Git Commit Tree DAG */}
    <g transform="translate(100, 110)">
      {/* Main Trunk Line */}
      <line x1="30" y1="20" x2="30" y2="200" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />

      {/* Feature Branch Arching Off */}
      <path
        d="M 30 60 C 90 60, 110 90, 110 120 C 110 150, 90 170, 30 170"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Commits on Main */}
      <circle cx="30" cy="20" r="8" fill="#c084fc" stroke="#581c87" strokeWidth="2.5" />
      <circle cx="30" cy="60" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="30" cy="115" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="30" cy="170" r="9" fill="#ffffff" stroke="var(--accent, #a855f7)" strokeWidth="3" />
      <circle cx="30" cy="200" r="6" fill="#c084fc" stroke="#581c87" strokeWidth="2" />

      {/* Commits on Feature */}
      <circle cx="110" cy="95" r="7" fill="#7dd3fc" stroke="#0369a1" strokeWidth="2" />
      <circle cx="110" cy="135" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

      {/* Commit hash labels */}
      <text x="46" y="24" fill="rgba(255, 255, 255, 0.45)" fontSize="9" fontFamily="var(--font-mono, monospace)">
        a4f89d init
      </text>
      <text x="126" y="100" fill="#38bdf8" fontSize="9" fontFamily="var(--font-mono, monospace)">
        feat: wizard
      </text>
      <text x="126" y="140" fill="#7dd3fc" fontSize="9" fontFamily="var(--font-mono, monospace)">
        tests pass
      </text>
      <text x="48" y="174" fill="#f3e8ff" fontSize="10" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        merge: #42
      </text>
    </g>

    {/* Wizard Rune Starburst Overlay */}
    <g transform="translate(240, 260)">
      <circle r="36" stroke="rgba(192, 132, 252, 0.25)" strokeWidth="1" strokeDasharray="3 5" />
      <polygon points="0,-24 16,-8 24,0 16,8 0,24 -16,8 -24,0 -16,-8" fill="rgba(168, 85, 247, 0.15)" stroke="#c084fc" strokeWidth="1.5" />
      <circle r="6" fill="#ffffff" />
    </g>

    {/* Terminal interactive prompt box */}
    <g transform="translate(32, 355)">
      <rect width="296" height="66" rx="14" fill="rgba(20, 10, 36, 0.85)" stroke="rgba(168, 85, 247, 0.3)" />
      {/* Mac window dots */}
      <circle cx="18" cy="18" r="3.5" fill="#ef4444" opacity="0.8" />
      <circle cx="28" cy="18" r="3.5" fill="#f59e0b" opacity="0.8" />
      <circle cx="38" cy="18" r="3.5" fill="#10b981" opacity="0.8" />

      <text x="18" y="42" fill="#c084fc" fontSize="12" fontFamily="var(--font-mono, monospace)" fontWeight="600">
        $ git wizard commit -m "clean"
      </text>
      <text x="18" y="56" fill="rgba(243, 232, 255, 0.6)" fontSize="9.5" fontFamily="var(--font-mono, monospace)">
        [OK] 4 files changed, 0 regressions
      </text>
    </g>
  </svg>
);

export const PersonalCardArt = () => (
  <svg
    viewBox="0 0 360 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="card-art-svg"
    role="img"
    aria-label="Ricardo Andreotti Personal Card"
  >
    <defs>
      <radialGradient id="pa-glow" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor="var(--accent, #6366f1)" stopOpacity="0.35" />
        <stop offset="50%" stopColor="var(--accent, #6366f1)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <pattern id="pa-dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="rgba(255, 255, 255, 0.08)" />
      </pattern>
    </defs>

    {/* Background */}
    <rect width="360" height="480" fill="#090a12" />
    <rect width="360" height="480" fill="url(#pa-dots)" />
    <circle cx="180" cy="180" r="160" fill="url(#pa-glow)" />

    {/* Technical Frame Geometry */}
    <g transform="translate(180, 180)">
      <circle r="110" stroke="var(--accent, #6366f1)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 6" />
      <circle r="85" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" />

      {/* Monogram Box */}
      <rect x="-54" y="-54" width="108" height="108" rx="28" fill="rgba(255, 255, 255, 0.04)" stroke="var(--accent, #6366f1)" strokeWidth="2" />
      <text
        x="0"
        y="16"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="44"
        fontFamily="var(--font-sans, sans-serif)"
        fontWeight="800"
        letterSpacing="-0.04em"
      >
        RA
      </text>
    </g>

    {/* Identity Meta */}
    <g transform="translate(32, 335)">
      <rect width="296" height="88" rx="16" fill="rgba(18, 20, 32, 0.85)" stroke="rgba(255, 255, 255, 0.12)" />

      <text x="20" y="32" fill="#ffffff" fontSize="16" fontFamily="var(--font-sans, sans-serif)" fontWeight="700">
        Ricardo Andreotti
      </text>
      <text x="20" y="50" fill="var(--accent, #a855f7)" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="600">
        FULL STACK · WEBGL · RUST & IA
      </text>
      <text x="20" y="72" fill="rgba(255, 255, 255, 0.55)" fontSize="11" fontFamily="var(--font-sans, sans-serif)">
        Técnico & Ciência da Computação (UNIP)
      </text>
    </g>
  </svg>
);

export const getProjectCardSvg = (projectId: number): ReactNode => {
  switch (projectId) {
    case 9:
      return <GoldPortfolioCardArt />;
    case 26:
      return <SelfSyncCardArt />;
    case 2:
      return <ChefAiCardArt />;
    case 30:
      return <GitWizardCardArt />;
    default:
      return null;
  }
};
