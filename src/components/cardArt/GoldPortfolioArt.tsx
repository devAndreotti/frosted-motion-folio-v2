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
      <radialGradient id="gp-ambient" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.32" />
        <stop offset="45%" stopColor="var(--accent, #eab308)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="gp-gleam" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="30%" stopColor="#fef08a" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gp-gold-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="35%" stopColor="#fef08a" />
        <stop offset="70%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="gp-gold-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ca8a04" />
        <stop offset="50%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>
      <linearGradient id="gp-gold-face" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="50%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="gp-curve-grad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#fde047" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="gp-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--accent, #eab308)" stopOpacity="0.24" />
        <stop offset="100%" stopColor="var(--accent, #eab308)" stopOpacity="0" />
      </linearGradient>
      <pattern id="gp-isometric-grid" width="30" height="17.32" patternUnits="userSpaceOnUse">
        <path d="M 0 8.66 L 15 0 L 30 8.66 L 15 17.32 Z" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" />
      </pattern>
    </defs>

    {/* Canvas Background */}
    <rect width="360" height="480" fill="#0b0a06" />
    <rect width="360" height="480" fill="url(#gp-isometric-grid)" />
    <circle cx="180" cy="190" r="165" fill="url(#gp-ambient)" />

    {/* Concentric Telemetry Orbit Rings */}
    <circle cx="180" cy="180" r="138" stroke="rgba(234, 179, 8, 0.16)" strokeWidth="1" strokeDasharray="3 6" />
    <circle cx="180" cy="180" r="105" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
    <circle cx="180" cy="180" r="75" stroke="rgba(234, 179, 8, 0.22)" strokeWidth="1" strokeDasharray="1 8" />

    {/* Top Header Badge */}
    <g transform="translate(28, 30)">
      <rect width="134" height="26" rx="13" fill="rgba(234, 179, 8, 0.12)" stroke="rgba(234, 179, 8, 0.35)" />
      <circle cx="14" cy="13" r="4" fill="var(--accent, #eab308)" />
      <text x="26" y="17" fill="#fef08a" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.08em">
        YIELD +18.42%
      </text>
    </g>

    {/* Asset Allocation Radial Mini Donut (Top Right) */}
    <g transform="translate(304, 43)">
      <circle r="18" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" />
      <circle r="18" fill="none" stroke="#eab308" strokeWidth="4" strokeDasharray="70 120" strokeDashoffset="25" />
      <circle r="18" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="35 120" strokeDashoffset="-45" />
      <text x="0" y="3" textAnchor="middle" fill="#fef08a" fontSize="8" fontFamily="var(--font-mono, monospace)" fontWeight="700">AU</text>
    </g>

    {/* Candlestick Analytics Matrix */}
    <g opacity="0.6" transform="translate(32, 90)">
      <line x1="0" y1="30" x2="296" y2="30" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 4" />
      <line x1="0" y1="70" x2="296" y2="70" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 4" />
      <line x1="0" y1="110" x2="296" y2="110" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="2 4" />

      <line x1="24" y1="15" x2="24" y2="95" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1.2" />
      <rect x="18" y="34" width="12" height="42" rx="2" fill="url(#gp-gold-top)" />

      <line x1="68" y1="8" x2="68" y2="80" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1.2" />
      <rect x="62" y="20" width="12" height="46" rx="2" fill="#22c55e" opacity="0.9" />

      <line x1="112" y1="25" x2="112" y2="105" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1.2" />
      <rect x="106" y="45" width="12" height="34" rx="2" fill="url(#gp-gold-face)" />

      <line x1="262" y1="12" x2="262" y2="78" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1.2" />
      <rect x="256" y="18" width="12" height="40" rx="2" fill="#22c55e" opacity="0.9" />
    </g>

    {/* Yield Area Gradient + Efficient Frontier Curve */}
    <path
      d="M 28 305 C 80 295, 120 280, 160 225 C 200 170, 250 145, 332 88 L 332 325 L 28 325 Z"
      fill="url(#gp-area-grad)"
    />
    <path
      d="M 28 305 C 80 295, 120 280, 160 225 C 200 170, 250 145, 332 88"
      stroke="url(#gp-curve-grad)"
      strokeWidth="3.2"
      strokeLinecap="round"
    />

    <circle cx="160" cy="225" r="5" fill="#fef08a" stroke="#a16207" strokeWidth="2" />
    <circle cx="260" cy="140" r="5.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
    <circle cx="332" cy="88" r="7" fill="#ffffff" stroke="var(--accent, #eab308)" strokeWidth="2.5" />
    <circle cx="332" cy="88" r="14" fill="url(#gp-gleam)" />

    {/* 3D Stack of Isometric Gold Bullion Bars */}
    <g transform="translate(180, 205)">
      <g transform="translate(-40, 20)">
        <polygon points="0,-16 48,-2 0,12 -48,-2" fill="url(#gp-gold-top)" opacity="0.8" />
        <polygon points="48,-2 48,16 0,30 0,12" fill="url(#gp-gold-side)" />
        <polygon points="-48,-2 0,12 0,30 -48,16" fill="url(#gp-gold-face)" />
      </g>
      <g transform="translate(40, 20)">
        <polygon points="0,-16 48,-2 0,12 -48,-2" fill="url(#gp-gold-top)" opacity="0.8" />
        <polygon points="48,-2 48,16 0,30 0,12" fill="url(#gp-gold-side)" />
        <polygon points="-48,-2 0,12 0,30 -48,16" fill="url(#gp-gold-face)" />
      </g>
      <g transform="translate(0, -6)">
        <polygon points="0,-24 64,-5 0,14 -64,-5" fill="url(#gp-gold-top)" />
        <polygon points="64,-5 64,18 0,37 0,14" fill="url(#gp-gold-side)" />
        <polygon points="-64,-5 0,14 0,37 -64,18" fill="url(#gp-gold-face)" />
        <line x1="0" y1="14" x2="0" y2="37" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
        <text x="0" y="-3" textAnchor="middle" fill="#713f12" fontSize="9" fontFamily="var(--font-mono, monospace)" fontWeight="800" letterSpacing="0.16em">
          FINE GOLD 999.9
        </text>
        <circle cx="64" cy="-5" r="9" fill="url(#gp-gleam)" />
      </g>
    </g>

    {/* Technical Telemetry Glass Card (Bottom) */}
    <g transform="translate(28, 355)">
      <rect width="304" height="66" rx="16" fill="rgba(20, 18, 12, 0.85)" stroke="rgba(234, 179, 8, 0.28)" />
      <rect width="304" height="66" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

      <text x="18" y="24" fill="rgba(255, 255, 255, 0.45)" fontSize="9.5" fontFamily="var(--font-mono, monospace)" letterSpacing="0.05em">
        MAX SHARPE
      </text>
      <text x="18" y="46" fill="#fef08a" fontSize="15" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        2.45
      </text>

      <line x1="105" y1="14" x2="105" y2="52" stroke="rgba(255, 255, 255, 0.1)" />

      <text x="122" y="24" fill="rgba(255, 255, 255, 0.45)" fontSize="9.5" fontFamily="var(--font-mono, monospace)" letterSpacing="0.05em">
        VOLATILITY
      </text>
      <text x="122" y="46" fill="#22c55e" fontSize="15" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        4.18%
      </text>

      <line x1="208" y1="14" x2="208" y2="52" stroke="rgba(255, 255, 255, 0.1)" />

      <text x="224" y="24" fill="rgba(255, 255, 255, 0.45)" fontSize="9.5" fontFamily="var(--font-mono, monospace)" letterSpacing="0.05em">
        FRONTIER
      </text>
      <text x="224" y="46" fill="var(--accent, #eab308)" fontSize="15" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        OPTIMAL
      </text>
    </g>
  </svg>
);
