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
        <stop offset="0%" stopColor="var(--accent, #22c55e)" stopOpacity="0.32" />
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

    {/* Stylized Cloche & AI Spark Core */}
    <g transform="translate(180, 205)">
      <ellipse cx="0" cy="42" rx="76" ry="12" fill="rgba(22, 101, 52, 0.6)" stroke="#4ade80" strokeWidth="1.8" />
      <line x1="-80" y1="44" x2="80" y2="44" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M -60 38 C -60 -20, 60 -20, 60 38 Z"
        fill="rgba(34, 197, 94, 0.2)"
        stroke="#86efac"
        strokeWidth="2.2"
      />
      <circle cx="0" cy="-24" r="7" fill="#86efac" stroke="#15803d" strokeWidth="2" />
      <g transform="translate(0, 12) rotate(-35)">
        <path d="M 0,-32 L 8,-30 L 10,16 L 0,20 Z" fill="url(#ca-knife)" />
        <rect x="-2" y="20" width="6" height="18" rx="2" fill="#14532d" />
      </g>
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
