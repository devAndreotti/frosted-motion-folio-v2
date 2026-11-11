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
      <polygon points="0,-32 58,-14 0,6 -58,-14" fill="#fef08a" opacity="0.95" />
      <polygon points="58,-14 58,16 0,36 0,6" fill="#ca8a04" />
      <polygon points="-58,-14 0,6 0,36 -58,16" fill="#854d0e" />
      <line x1="0" y1="6" x2="0" y2="36" stroke="#fef08a" strokeWidth="1.5" opacity="0.6" />
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
