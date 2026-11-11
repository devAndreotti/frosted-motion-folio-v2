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
      <radialGradient id="ss-ambient" cx="50%" cy="42%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.35" />
        <stop offset="50%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.07" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ss-wave-a" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="var(--accent, #3b82f6)" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <linearGradient id="ss-sun-core" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
      <pattern id="ss-dot-grid" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="11" cy="11" r="1.1" fill="rgba(255, 255, 255, 0.07)" />
      </pattern>
    </defs>

    {/* Canvas Background */}
    <rect width="360" height="480" fill="#060913" />
    <rect width="360" height="480" fill="url(#ss-dot-grid)" />
    <circle cx="180" cy="195" r="165" fill="url(#ss-ambient)" />

    {/* Header Status Badge */}
    <g transform="translate(28, 30)">
      <rect width="144" height="26" rx="13" fill="rgba(59, 130, 246, 0.15)" stroke="rgba(59, 130, 246, 0.35)" />
      <circle cx="14" cy="13" r="4" fill="#38bdf8" />
      <text x="26" y="17" fill="#bfdbfe" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.08em">
        SYNCED · 25:00 MIN
      </text>
    </g>

    {/* Energy Battery Indicator (Top Right) */}
    <g transform="translate(304, 38)">
      <rect x="-14" y="0" width="28" height="15" rx="4" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" />
      <rect x="14" y="4" width="2.5" height="7" rx="1" fill="rgba(255, 255, 255, 0.25)" />
      <rect x="-11" y="3" width="18" height="9" rx="2" fill="#38bdf8" />
    </g>

    {/* 24-Hour Circadian Orbital Dial */}
    <g transform="translate(180, 195)">
      {/* Outer telemetry ticks */}
      <circle r="122" stroke="rgba(59, 130, 246, 0.18)" strokeWidth="1" strokeDasharray="2 6" />
      <circle r="102" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />

      {/* 24-hour hour markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="0"
          y1="-102"
          x2="0"
          y2={deg % 90 === 0 ? "-90" : "-95"}
          stroke={deg % 90 === 0 ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.2)"}
          strokeWidth={deg % 90 === 0 ? "2" : "1.2"}
          transform={`rotate(${deg})`}
        />
      ))}

      {/* Hour Labels */}
      <text x="0" y="-76" textAnchor="middle" fill="rgba(255, 255, 255, 0.5)" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">12:00</text>
      <text x="76" y="3" textAnchor="middle" fill="rgba(255, 255, 255, 0.5)" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">18:00</text>
      <text x="0" y="82" textAnchor="middle" fill="rgba(255, 255, 255, 0.5)" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">00:00</text>
      <text x="-76" y="3" textAnchor="middle" fill="rgba(255, 255, 255, 0.5)" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">06:00</text>

      {/* Active Focus Session Sector Arc (10h to 13h) */}
      <path
        d="M 0 -102 A 102 102 0 0 1 72 -72 L 0 0 Z"
        fill="rgba(56, 189, 248, 0.12)"
        stroke="rgba(56, 189, 248, 0.4)"
        strokeWidth="1.5"
      />

      {/* Radiant Sun Indicator (Solar Peak) */}
      <circle cx="0" cy="-122" r="9" fill="url(#ss-sun-core)" />
      <circle cx="0" cy="-122" r="16" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

      {/* Moon Phase Indicator (Nocturnal Rest) */}
      <path
        d="M -5 120 A 7 7 0 0 0 5 129 A 5 5 0 0 1 -5 120"
        fill="#93c5fd"
        stroke="#60a5fa"
        strokeWidth="0.8"
      />

      {/* Central Hexagonal Focus Reactor Core */}
      <polygon points="0,-45 39,-22 39,22 0,45 -39,22 -39,-22" fill="rgba(15, 23, 42, 0.9)" stroke="#60a5fa" strokeWidth="2.2" />
      <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="rgba(59, 130, 246, 0.25)" stroke="#38bdf8" strokeWidth="1" />
      <circle r="12" fill="#ffffff" />
      <circle r="5" fill="var(--accent, #3b82f6)" />
      {/* Reactor Pulses */}
      <circle r="54" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3 5" />
    </g>

    {/* Harmonic Energy Waveform */}
    <path
      d="M 28 318 C 72 265, 115 365, 168 290 C 215 220, 265 345, 332 278"
      stroke="url(#ss-wave-a)"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    <path
      d="M 28 335 C 72 295, 115 385, 168 318 C 215 250, 265 375, 332 305"
      stroke="rgba(56, 189, 248, 0.3)"
      strokeWidth="1.6"
      strokeDasharray="4 4"
      strokeLinecap="round"
    />

    {/* Interactive Planner Progress HUD (Bottom) */}
    <g transform="translate(28, 355)">
      <rect width="304" height="66" rx="16" fill="rgba(15, 23, 42, 0.88)" stroke="rgba(59, 130, 246, 0.3)" />
      <rect width="304" height="66" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

      {/* Task Checkmark Badge */}
      <rect x="18" y="18" width="28" height="28" rx="8" fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M 24 32 L 29 37 L 38 26" stroke="#93c5fd" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Task Text Details */}
      <text x="56" y="30" fill="#f8fafc" fontSize="13" fontFamily="var(--font-sans, sans-serif)" fontWeight="600">
        Sprint Review & Architecture
      </text>
      <text x="56" y="47" fill="rgba(148, 163, 184, 0.8)" fontSize="10.5" fontFamily="var(--font-mono, monospace)">
        HABIT STREAK · 28 DAYS
      </text>

      {/* Completion Pill */}
      <g transform="translate(236, 20)">
        <rect width="52" height="24" rx="12" fill="rgba(56, 189, 248, 0.16)" stroke="rgba(56, 189, 248, 0.3)" />
        <text x="26" y="16" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
          92%
        </text>
      </g>
    </g>
  </svg>
);
