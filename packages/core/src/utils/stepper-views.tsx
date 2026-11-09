import { h } from '@stencil/core';
import { ballPosition, stepState } from './stepper';

interface ViewProps {
  labels: string[];
  current: number;
}

const Tick = ({ size }: { size: number }) => (
  <svg class="tick" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
);

/** Bead Line : une bille lumineuse court sur la ligne et allume l'étape suivante. */
export const LineView = ({ labels, current }: ViewProps) => {
  const n = labels.length;
  const progress = n > 1 ? Math.min(current, n - 1) / (n - 1) : 0;
  return (
    <div class="line" aria-hidden="true" style={{ '--n': `${n}`, '--progress': `${progress}` }}>
      <div class="track">
        <div class="fill" />
        <div class="bead" />
      </div>
      {labels.map((label, i) => (
        <div class={`stop ${stepState(i, current)}`}>
          <span class="dot" />
          <span class="name">{label}</span>
        </div>
      ))}
    </div>
  );
};

/** Big Number : un grand numéro qui bascule comme un panneau à volets, le nom de l'étape arrive en roulant. */
export const NumberView = ({ labels, current }: ViewProps) => {
  const n = labels.length;
  const done = current >= n;
  return (
    <div class="big" aria-hidden="true">
      <div class="flap">
        <span key={`digit-${current}`} class="digit">
          {done ? <Tick size={44} /> : current + 1}
        </span>
      </div>
      <div class="info">
        <span class="kicker">
          Étape {Math.min(current + 1, n)} sur {n}
        </span>
        <span class="roll">
          <span key={`name-${current}`} class="name">
            {done ? 'Terminé' : labels[current]}
          </span>
        </span>
        <span class="dashes">
          {labels.map((_, i) => (
            <span class={{ dash: true, on: i <= current }} />
          ))}
        </span>
      </div>
    </div>
  );
};

/** Skill Path : un chemin en zigzag ; l'étape en cours rebondit. */
export const PathView = ({ labels, current }: ViewProps) => {
  const n = labels.length;
  const points = labels.map((_, i) => [50 + i * 100, i % 2 ? 45 : 95]);
  const line = (list: number[][]) => list.map((point) => point.join(',')).join(' ');
  return (
    <svg class="path" viewBox={`0 0 ${n * 100} 140`} style={{ '--n': `${n}` }} aria-hidden="true">
      <polyline class="trail" points={line(points)} />
      <polyline class="trail reached" points={line(points.slice(0, Math.min(current, n - 1) + 1))} />
      {points.map(([x, y], i) => (
        <g class={`node ${stepState(i, current)}`} transform={`translate(${x} ${y})`}>
          <g class="hop">
            <circle r="15" />
            {i < current ? <path class="check" d="M-6 0l4 4 8-9" /> : <text class="num" dy="5">{i + 1}</text>}
          </g>
          <text class="name" y={i % 2 ? -24 : 34}>
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
};

/** Level Blocks : des blocs en escalier se remplissent l'un après l'autre, une bille saute sur l'étape en cours. */
export const BlocksView = ({ labels, current, ballRef }: ViewProps & { ballRef: (el: HTMLElement) => void }) => (
  <div class="blocks" aria-hidden="true">
    {labels.map((label, i) => (
      <div class={`block ${stepState(i, current)}`} style={{ height: `${((i + 1) / labels.length) * 85}%`, '--i': `${i}` }}>
        <span>{label}</span>
      </div>
    ))}
    <span ref={ballRef} class="ball" style={ballPosition(current, labels.length)} />
  </div>
);

/** Gauge Arc : une jauge en demi-cercle dont l'aiguille saute à la graduation suivante. */
export const GaugeView = ({ labels, current }: ViewProps) => {
  const n = labels.length;
  const fraction = current >= n || n < 2 ? 1 : current / (n - 1);
  const angle = (i: number) => Math.PI * (1 - (n > 1 ? i / (n - 1) : 1));
  const at = (i: number, r: number) => [100 + r * Math.cos(angle(i)), 100 - r * Math.sin(angle(i))];
  const arc = 'M20 100 A80 80 0 0 1 180 100';
  return (
    <svg class="gauge" viewBox="-45 -15 290 130" aria-hidden="true">
      <path class="arc" d={arc} pathLength={100} />
      <path class="arc progress" d={arc} pathLength={100} style={{ strokeDasharray: `${fraction * 100} 100` }} />
      {labels.map((label, i) => {
        const [x1, y1] = at(i, 60);
        const [x2, y2] = at(i, 68);
        const [tx, ty] = at(i, 96);
        const anchor = tx < 95 ? 'end' : tx > 105 ? 'start' : 'middle';
        return (
          <g class={`mark ${stepState(i, current)}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <text x={tx} y={ty} text-anchor={anchor}>
              {label}
            </text>
          </g>
        );
      })}
      <g class="needle" style={{ transform: `rotate(${fraction * 180}deg)` }}>
        <line x1="100" y1="100" x2="40" y2="100" />
      </g>
      <circle class="hub" cx="100" cy="100" r="13" />
      <text class="hub-text" x="100" y="105">
        {Math.min(current + 1, n)}
      </text>
    </svg>
  );
};
