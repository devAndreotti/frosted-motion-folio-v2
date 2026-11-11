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
        <stop offset="0%" stopColor="var(--accent, #3b82f6)" stopOpacity="0.35" />
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

      <circle cx="0" cy="-115" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
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
      <rect x="18" y="16" width="18" height="18" rx="5" fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" />
      <path d="M 22 25 L 25 28 L 32 20" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="44" y="29" fill="#f1f5f9" fontSize="12" fontFamily="var(--font-sans, sans-serif)" fontWeight="500">
        Deep Work Session
      </text>
      <rect x="216" y="16" width="64" height="20" rx="10" fill="rgba(56, 189, 248, 0.15)" />
      <text x="248" y="30" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        84%
      </text>
    </g>
  </svg>
);
