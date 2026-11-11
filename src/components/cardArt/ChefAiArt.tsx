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
      <radialGradient id="ca-ambient" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #22c55e)" stopOpacity="0.35" />
        <stop offset="50%" stopColor="var(--accent, #22c55e)" stopOpacity="0.07" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ca-blade-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0fdf4" />
        <stop offset="35%" stopColor="#86efac" />
        <stop offset="70%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#14532d" />
      </linearGradient>
      <linearGradient id="ca-glass-dome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#86efac" stopOpacity="0.35" />
        <stop offset="60%" stopColor="#22c55e" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#14532d" stopOpacity="0.4" />
      </linearGradient>
      <pattern id="ca-grid-fine" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(34, 197, 94, 0.05)" strokeWidth="0.8" />
      </pattern>
    </defs>

    {/* Canvas Background */}
    <rect width="360" height="480" fill="#040d07" />
    <rect width="360" height="480" fill="url(#ca-grid-fine)" />
    <circle cx="180" cy="190" r="165" fill="url(#ca-ambient)" />

    {/* Telemetry Rings */}
    <circle cx="180" cy="180" r="135" stroke="rgba(34, 197, 94, 0.18)" strokeWidth="1" strokeDasharray="3 6" />
    <circle cx="180" cy="180" r="95" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

    {/* Top Header Badge */}
    <g transform="translate(28, 30)">
      <rect width="144" height="26" rx="13" fill="rgba(34, 197, 94, 0.15)" stroke="rgba(34, 197, 94, 0.35)" />
      <circle cx="14" cy="13" r="4" fill="#4ade80" />
      <text x="26" y="17" fill="#bbf7d0" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.08em">
        MODEL · GEMINI AI
      </text>
    </g>

    {/* Neural Synapse Constellation Network */}
    <g opacity="0.55" stroke="rgba(74, 222, 128, 0.4)" strokeWidth="1.2">
      <line x1="45" y1="110" x2="105" y2="150" />
      <line x1="105" y1="150" x2="180" y2="120" />
      <line x1="180" y1="120" x2="255" y2="150" />
      <line x1="255" y1="150" x2="315" y2="110" />
      <line x1="105" y1="150" x2="135" y2="240" />
      <line x1="255" y1="150" x2="225" y2="240" />
      <line x1="135" y1="240" x2="180" y2="290" />
      <line x1="225" y1="240" x2="180" y2="290" />
    </g>
    {[
      [45, 110], [105, 150], [180, 120], [255, 150], [315, 110],
      [135, 240], [225, 240], [180, 290]
    ].map(([x, y], idx) => (
      <g key={idx} transform={`translate(${x}, ${y})`}>
        <circle r="4.5" fill="#4ade80" />
        <circle r="9" fill="none" stroke="rgba(74, 222, 128, 0.35)" strokeWidth="1" />
      </g>
    ))}

    {/* Gastronomic Centerpiece: Cloche & Floating Damascus Knife */}
    <g transform="translate(180, 195)">
      {/* Platter Base */}
      <ellipse cx="0" cy="50" rx="88" ry="15" fill="rgba(20, 83, 45, 0.7)" stroke="#4ade80" strokeWidth="2" />
      <line x1="-92" y1="52" x2="92" y2="52" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cloche Dome */}
      <path
        d="M -70 46 C -70 -26, 70 -26, 70 46 Z"
        fill="url(#ca-glass-dome)"
        stroke="#86efac"
        strokeWidth="2.4"
      />
      {/* Specular curved reflection on glass dome */}
      <path
        d="M -50 36 C -50 -10, -10 -20, 0 -22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Cloche Crown Handle */}
      <circle cx="0" cy="-30" r="8" fill="#86efac" stroke="#14532d" strokeWidth="2.2" />

      {/* Floating Santoku/Chef Knife */}
      <g transform="translate(0, 12) rotate(-32)">
        <path d="M -2,-38 L 10,-35 L 12,18 L -2,22 Z" fill="url(#ca-blade-grad)" stroke="#ffffff" strokeWidth="0.8" />
        {/* Damascus wave pattern lines on blade */}
        <path d="M 0,-25 Q 6,-20 2,-12 Q 8,-4 3,6" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        <rect x="-4" y="22" width="7" height="22" rx="2.5" fill="#0f291e" stroke="#22c55e" strokeWidth="1" />
      </g>

      {/* Generative AI Four-Point Starbursts */}
      <path d="M -40,-12 Q -33,-12 -33,-19 Q -33,-12 -26,-12 Q -33,-12 -33,-5 Q -33,-12 -40,-12 Z" fill="#bbf7d0" />
      <path d="M 38,4 Q 43,4 43,-2 Q 43,4 49,4 Q 43,4 43,10 Q 43,4 38,4 Z" fill="#bbf7d0" />
    </g>

    {/* Recipe Synthesis Terminal Card (Bottom) */}
    <g transform="translate(28, 355)">
      <rect width="304" height="66" rx="16" fill="rgba(8, 28, 16, 0.9)" stroke="rgba(74, 222, 128, 0.3)" />
      <rect width="304" height="66" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

      {/* Ingredient Tag Pills */}
      <g transform="translate(18, 16)">
        <rect width="52" height="18" rx="5" fill="rgba(34, 197, 94, 0.16)" stroke="rgba(74, 222, 128, 0.3)" />
        <text x="26" y="12.5" textAnchor="middle" fill="#86efac" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">BASIL</text>

        <rect x="58" width="56" height="18" rx="5" fill="rgba(34, 197, 94, 0.16)" stroke="rgba(74, 222, 128, 0.3)" />
        <text x="86" y="12.5" textAnchor="middle" fill="#86efac" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">TOMATO</text>

        <rect x="120" width="60" height="18" rx="5" fill="rgba(34, 197, 94, 0.16)" stroke="rgba(74, 222, 128, 0.3)" />
        <text x="150" y="12.5" textAnchor="middle" fill="#86efac" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">PARMESAN</text>
      </g>

      <text x="18" y="51" fill="#f0fdf4" fontSize="13.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        PESTO DI POMODORO
      </text>

      {/* Action Pill */}
      <g transform="translate(244, 20)">
        <rect width="44" height="26" rx="8" fill="#22c55e" />
        <text x="22" y="17" textAnchor="middle" fill="#052e16" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="800">
          GEN
        </text>
      </g>
    </g>
  </svg>
);
