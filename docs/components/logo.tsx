/** Cristal taillé : facettes en aplats (sans dégradé à identifiant, le logo apparaît plusieurs fois par page). */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2 6 12l10 18z" fill="#7c3aed" />
      <path d="M16 2l10 10-10 18z" fill="#c026d3" />
      <path d="M6 12h20L16 30z" fill="#22d3ee" opacity="0.5" />
      <path d="M11 7h10l5 5H6z" fill="#fff" opacity="0.4" />
    </svg>
  );
}
