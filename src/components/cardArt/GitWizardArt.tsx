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
      <radialGradient id="gw-ambient" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stopColor="var(--accent, #a855f7)" stopOpacity="0.35" />
        <stop offset="50%" stopColor="var(--accent, #a855f7)" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gw-main-branch" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="var(--accent, #a855f7)" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="gw-feat-branch" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <pattern id="gw-tech-grid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(168, 85, 247, 0.06)" strokeWidth="0.8" />
      </pattern>
    </defs>

    {/* Canvas Background */}
    <rect width="360" height="480" fill="#090412" />
    <rect width="360" height="480" fill="url(#gw-tech-grid)" />
    <circle cx="180" cy="190" r="165" fill="url(#gw-ambient)" />

    {/* Concentric Arcane Telemetry Rings */}
    <circle cx="180" cy="180" r="135" stroke="rgba(168, 85, 247, 0.16)" strokeWidth="1" strokeDasharray="3 6" />
    <circle cx="180" cy="180" r="100" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

    {/* Top Header Status */}
    <g transform="translate(28, 30)">
      <rect width="148" height="26" rx="13" fill="rgba(168, 85, 247, 0.16)" stroke="rgba(168, 85, 247, 0.35)" />
      <circle cx="14" cy="13" r="4" fill="#c084fc" />
      <text x="26" y="17" fill="#f3e8ff" fontSize="10.5" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="0.08em">
        BRANCH · MAIN (v2.4)
      </text>
    </g>

    {/* Git Commit Tree DAG Graph */}
    <g transform="translate(80, 95)">
      {/* Main Trunk Line */}
      <line x1="40" y1="10" x2="40" y2="230" stroke="url(#gw-main-branch)" strokeWidth="3.2" strokeLinecap="round" />

      {/* Feature Branch Arching Off and Rejoining */}
      <path
        d="M 40 55 C 110 55, 125 90, 125 125 C 125 160, 105 190, 40 190"
        fill="none"
        stroke="url(#gw-feat-branch)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Commits on Main */}
      <circle cx="40" cy="15" r="7.5" fill="#c084fc" stroke="#581c87" strokeWidth="2.5" />
      <circle cx="40" cy="55" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      <circle cx="40" cy="120" r="7" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="2" />
      {/* Merge Node with Pulsing Halos */}
      <circle cx="40" cy="190" r="10" fill="#ffffff" stroke="var(--accent, #a855f7)" strokeWidth="3" />
      <circle cx="40" cy="190" r="16" fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="40" cy="230" r="6" fill="#c084fc" stroke="#581c87" strokeWidth="2" />

      {/* Commits on Feature */}
      <circle cx="125" cy="95" r="7.5" fill="#7dd3fc" stroke="#0369a1" strokeWidth="2" />
      <circle cx="125" cy="145" r="7.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

      {/* Commit Labels & Hashes */}
      <g transform="translate(56, 12)">
        <rect width="78" height="18" rx="4" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)" />
        <text x="8" y="12.5" fill="#d8b4fe" fontSize="9" fontFamily="var(--font-mono, monospace)" fontWeight="600">
          a4f89d init
        </text>
      </g>

      <g transform="translate(142, 90)">
        <rect width="86" height="18" rx="4" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.25)" />
        <text x="8" y="12.5" fill="#38bdf8" fontSize="9" fontFamily="var(--font-mono, monospace)" fontWeight="600">
          feat: parser
        </text>
      </g>

      <g transform="translate(142, 140)">
        <rect width="86" height="18" rx="4" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.25)" />
        <text x="8" y="12.5" fill="#7dd3fc" fontSize="9" fontFamily="var(--font-mono, monospace)" fontWeight="600">
          test: 100% ok
        </text>
      </g>

      <g transform="translate(56, 185)">
        <rect width="92" height="20" rx="5" fill="rgba(168, 85, 247, 0.2)" stroke="#c084fc" strokeWidth="1.2" />
        <text x="10" y="14" fill="#ffffff" fontSize="9.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
          MERGE PR #42
        </text>
      </g>
    </g>

    {/* Wizard Rune Geometric Starburst (Right) */}
    <g transform="translate(268, 255)">
      <circle r="34" stroke="rgba(192, 132, 252, 0.2)" strokeWidth="1" strokeDasharray="3 4" />
      <polygon points="0,-22 15,-8 22,0 15,8 0,22 -15,8 -22,0 -15,-8" fill="rgba(168, 85, 247, 0.12)" stroke="#c084fc" strokeWidth="1.5" />
      <circle r="5" fill="#ffffff" />
    </g>

    {/* Interactive Terminal Window HUD (Bottom) */}
    <g transform="translate(28, 350)">
      <rect width="304" height="72" rx="16" fill="rgba(16, 8, 30, 0.9)" stroke="rgba(168, 85, 247, 0.35)" />
      <rect width="304" height="72" rx="16" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

      {/* Terminal Titlebar Window Controls */}
      <circle cx="18" cy="18" r="3.5" fill="#ef4444" opacity="0.85" />
      <circle cx="30" cy="18" r="3.5" fill="#f59e0b" opacity="0.85" />
      <circle cx="42" cy="18" r="3.5" fill="#10b981" opacity="0.85" />
      <text x="60" y="21" fill="rgba(255, 255, 255, 0.35)" fontSize="9" fontFamily="var(--font-mono, monospace)">
        git-wizard-terminal
      </text>

      {/* Command prompt & response */}
      <text x="18" y="44" fill="#c084fc" fontSize="12.5" fontFamily="var(--font-mono, monospace)" fontWeight="700">
        ❯ git wizard merge --ff
      </text>
      <text x="18" y="60" fill="#a7f3d0" fontSize="10" fontFamily="var(--font-mono, monospace)">
        ✔ Fast-forward 29621d9..327b3ad (0 conflicts)
      </text>
    </g>
  </svg>
);
