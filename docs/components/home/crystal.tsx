/** Le cristal du logo en grand : facettes en aplats, éclairées depuis la gauche. */
export function Crystal({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 320" className={className} aria-hidden="true">
      <g stroke="rgb(255 255 255 / 0.28)" strokeWidth="1" strokeLinejoin="round">
        <polygon points="36,92 78,108 78,302 36,286" fill="#6d28d9" />
        <polygon points="78,108 128,108 128,302 78,302" fill="#8b5cf6" />
        <polygon points="128,108 164,92 164,286 128,302" fill="#a21caf" />
        <polygon points="104,12 36,92 78,108" fill="#a78bfa" />
        <polygon points="104,12 78,108 128,108" fill="#ede9fe" />
        <polygon points="104,12 128,108 164,92" fill="#d946ef" />
      </g>
      <polygon points="78,206 128,176 128,244 78,268" fill="#22d3ee" opacity="0.5" />
      <polygon points="44,112 51,115 51,282 44,279" fill="#fff" opacity="0.35" />
    </svg>
  );
}

/** La lumière du cristal sur la planche : trois bandes nettes aux couleurs du logo, qui s'éteignent en s'éloignant. */
export function CrystalLight() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="crystal-light" aria-hidden="true">
      <defs>
        <linearGradient id="crystal-fade" x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.75" stopColor="#000" />
        </linearGradient>
        <mask id="crystal-mask">
          <rect width="100" height="100" fill="url(#crystal-fade)" />
        </mask>
      </defs>
      <g mask="url(#crystal-mask)">
        <polygon points="73,0 78,0 30,100 14,100" fill="#7c3aed" />
        <polygon points="78,0 83,0 46,100 30,100" fill="#c026d3" />
        <polygon points="83,0 87,0 60,100 46,100" fill="#22d3ee" />
      </g>
    </svg>
  );
}
