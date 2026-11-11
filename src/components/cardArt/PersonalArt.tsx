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
      <radialGradient id="pa-ambient" cx="50%" cy="36%" r="68%">
        <stop offset="0%" stopColor="var(--accent, #a855f7)" stopOpacity="0.38" />
        <stop offset="50%" stopColor="var(--accent, #a855f7)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="pa-box-border" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="50%" stopColor="var(--accent, #a855f7)" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <pattern id="pa-circuit-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
        <circle cx="12" cy="12" r="1.2" fill="rgba(255, 255, 255, 0.1)" />
      </pattern>
    </defs>

    {/* Canvas Background */}
    <rect width="360" height="480" fill="#08070d" />
    <rect width="360" height="480" fill="url(#pa-circuit-grid)" />
    <circle cx="180" cy="180" r="165" fill="url(#pa-ambient)" />

    {/* Header Status Badge */}
    <g transform="translate(28, 30)">
      <rect width="156" height="26" rx="13" fill="rgba(168, 85, 247, 0.16)" stroke="rgba(168, 85, 247, 0.35)" />
      <circle cx="14" cy="13" r="4" fill="#22c55e" />
      <text x="26" y="17" fill="#f3e8ff" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.08em">
        AVAILABLE FOR PROJECTS
      </text>
    </g>

    {/* Precision Architectural Monogram & Rings */}
    <g transform="translate(180, 185)">
      {/* Concentric Telemetry Orbital Rings */}
      <circle r="124" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="1" strokeDasharray="3 6" />
      <circle r="102" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.2" />
      <circle r="72" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="1" strokeDasharray="1 8" />

      {/* Orbiting Tech Nodes */}
      <circle cx="0" cy="-124" r="5" fill="#38bdf8" />
      <circle cx="124" cy="0" r="4" fill="var(--accent, #a855f7)" />
      <circle cx="-88" cy="88" r="4.5" fill="#fef08a" />

      {/* Futuristic Beveled Glass Monogram Frame */}
      <rect
        x="-56"
        y="-56"
        width="112"
        height="112"
        rx="30"
        fill="rgba(18, 16, 26, 0.85)"
        stroke="url(#pa-box-border)"
        strokeWidth="2.2"
      />
      <rect
        x="-46"
        y="-46"
        width="92"
        height="92"
        rx="22"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1"
      />

      {/* Bold Monogram Glyph */}
      <text
        x="0"
        y="17"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="48"
        fontFamily="var(--font-sans, sans-serif)"
        fontWeight="800"
        letterSpacing="-0.04em"
      >
        RA
      </text>
    </g>

    {/* Identity HUD Card (Bottom) */}
    <g transform="translate(28, 345)">
      <rect width="304" height="78" rx="18" fill="rgba(16, 14, 24, 0.88)" stroke="rgba(168, 85, 247, 0.32)" />
      <rect width="304" height="78" rx="18" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

      <text x="20" y="28" fill="#ffffff" fontSize="16" fontFamily="var(--font-sans, sans-serif)" fontWeight="700">
        Ricardo Andreotti
      </text>
      <text x="20" y="47" fill="var(--accent, #a855f7)" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        FULL STACK · WEBGL · RUST & GODOT 4
      </text>
      <text x="20" y="66" fill="rgba(255, 255, 255, 0.55)" fontSize="11" fontFamily="var(--font-sans, sans-serif)">
        Técnico & Ciência da Computação (UNIP)
      </text>
    </g>
  </svg>
);
