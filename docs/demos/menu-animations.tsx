import { CrMenu } from '@cristal/react';

const animations = ['fade', 'anchor-pop', 'turn-over', 'card-deal', 'drum-roll', 'outline-trace', 'tile-build'] as const;

export default function MenuAnimations() {
  return (
    <>
      {animations.map((animation) => (
        <CrMenu key={animation} label={animation} animation={animation}>
          <option value="list">Liste</option>
          <option value="grid">Grille</option>
          <option value="board">Tableau</option>
          <option value="calendar">Calendrier</option>
        </CrMenu>
      ))}
    </>
  );
}
