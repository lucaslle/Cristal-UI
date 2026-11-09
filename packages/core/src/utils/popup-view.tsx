import { FunctionalComponent, h } from '@stencil/core';
import { PopupAnimation } from './popup';

const COLUMNS = 4;
const ROWS = 3;

const tileStyle = (index: number) => {
  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  return {
    '--wave': `${column + row}`,
    '--dx': `${(column - 1.5) * 24}px`,
    '--dy': `${(row - 1) * 24 + 12}px`,
    '--turn': `${((index * 7) % 5) * 9 - 18}deg`,
  };
};

export const PopupEffects = ({ animation }: { animation: PopupAnimation }) => {
  if (animation === 'outline-trace') {
    return (
      <svg class="trace" aria-hidden="true">
        <defs>
          <linearGradient id="trace-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="var(--cr-color-primary)" />
            <stop offset="1" stop-color="#06b6d4" />
          </linearGradient>
        </defs>
        <rect class="trace-line" pathLength={1} stroke="url(#trace-gradient)" />
      </svg>
    );
  }
  if (animation === 'tile-build') {
    return (
      <div class="tiles" aria-hidden="true">
        {Array.from({ length: COLUMNS * ROWS }, (_, index) => (
          <span class="tile" style={tileStyle(index)} />
        ))}
      </div>
    );
  }
  return null;
};

interface PopupPanelProps {
  panelRef: (el: HTMLElement) => void;
  part: string;
  animation: PopupAnimation;
}

export const PopupPanel: FunctionalComponent<PopupPanelProps> = ({ panelRef, part, animation }, children) => (
  <div
    ref={panelRef}
    class="popup"
    part={part}
    popover="manual"
    data-animation={animation}
    onMouseDown={(event: MouseEvent) => event.preventDefault()}
  >
    <PopupEffects animation={animation} />
    {children}
  </div>
);
