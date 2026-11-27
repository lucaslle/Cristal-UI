/** Touches auxquelles répond un composant, en touches de clavier. */
export function Keys({ label, keys, className = '' }: { label: string; keys: readonly string[]; className?: string }) {
  return (
    <p className={`keys ${className}`}>
      <span>{label}</span>
      {keys.map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </p>
  );
}
