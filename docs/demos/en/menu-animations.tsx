import { CrMenu } from '@cristal/react';

const animations = ['fade', 'anchor-pop', 'turn-over', 'card-deal', 'drum-roll', 'outline-trace', 'tile-build'] as const;

export default function MenuAnimations() {
  return (
    <>
      {animations.map((animation) => (
        <CrMenu key={animation} label={animation} animation={animation}>
          <option value="list">List</option>
          <option value="grid">Grid</option>
          <option value="board">Board</option>
          <option value="calendar">Calendar</option>
        </CrMenu>
      ))}
    </>
  );
}
