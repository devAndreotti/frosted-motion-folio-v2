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
