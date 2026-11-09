export type StepperVariant = 'line' | 'number' | 'path' | 'blocks' | 'gauge' | 'timeline';
export type StepState = 'done' | 'current' | 'todo';

export const stepState = (index: number, current: number): StepState => (index < current ? 'done' : index === current ? 'current' : 'todo');

/** Position de la bille de « Level Blocks », en pourcentage du conteneur. */
export const ballPosition = (current: number, count: number) => {
  const at = Math.min(current, count - 1);
  return { left: `${((at + 0.5) / count) * 100}%`, bottom: `${((at + 1) / count) * 85}%` };
};
