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
      <line x1="30" y1="20" x2="30" y2="200" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M 30 60 C 90 60, 110 90, 110 120 C 110 150, 90 170, 30 170"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle cx="30" cy="20" r="8" fill="#c084fc" stroke="#581c87" strokeWidth="2.5" />
      <circle cx="30" cy="60" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="30" cy="115" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="30" cy="170" r="9" fill="#ffffff" stroke="var(--accent, #a855f7)" strokeWidth="3" />
      <circle cx="30" cy="200" r="6" fill="#c084fc" stroke="#581c87" strokeWidth="2" />

      <circle cx="110" cy="95" r="7" fill="#7dd3fc" stroke="#0369a1" strokeWidth="2" />
      <circle cx="110" cy="135" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

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
