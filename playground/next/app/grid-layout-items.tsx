const hours = [12, 18, 22, 30, 38, 46, 58, 70, 64, 52, 44, 36, 30, 24];

export function Revenue() {
  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>48 920 €</div>
      <div style={{ fontSize: 13, color: 'var(--cr-color-text-muted)' }}>+12,4 % par rapport au mois dernier</div>
    </div>
  );
}

export function Conversion() {
  return (
    <svg viewBox="0 0 80 80" width="90" height="90" role="img" aria-label="Conversion : 68 %" style={{ display: 'block', margin: 'auto' }}>
      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--cr-color-primary-subtle)" strokeWidth="8" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--cr-color-primary)" strokeWidth="8" strokeDasharray={`${0.68 * 201} 201`} transform="rotate(-90 40 40)" strokeLinecap="round" />
      <text x="40" y="45" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
        68 %
      </text>
    </svg>
  );
}

export function Visits() {
  return (
    <div role="img" aria-label="Visites par heure : pic à 70 en milieu de journée" style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', minHeight: 60 }}>
      {hours.map((value, i) => (
        <span key={i} style={{ flex: 1, height: `${value}%`, background: i === 7 ? 'var(--cr-color-primary)' : 'var(--cr-color-primary-subtle)', borderRadius: 3 }} />
      ))}
    </div>
  );
}

export function Tasks() {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6, fontSize: 14 }}>
      {['Revoir les chiffres de la semaine', 'Répondre au support', 'Mettre à jour la documentation'].map((task, i) => (
        <li key={task}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" defaultChecked={i < 2} /> {task}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function Activity() {
  return (
    <div role="img" aria-label="Activité de la semaine" style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 3 }}>
      {Array.from({ length: 42 }, (_, i) => (
        <span key={i} style={{ height: 10, borderRadius: 2, background: `color-mix(in oklab, var(--cr-color-primary) ${[15, 35, 60, 85][(i * 7) % 4]}%, white)` }} />
      ))}
    </div>
  );
}
