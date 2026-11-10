import { ListOption, readOptions } from './listbox';

const COUNT_MS = 500;

type Panel = HTMLElement & { label?: string; value?: string };

export const tabPanels = (host: HTMLElement) => Array.from(host.children).filter((child): child is Panel => child.tagName === 'CR-TAB-PANEL');

/** Segments de cr-segmented : un par cr-tab-panel enfant (mode onglets), sinon un par option. */
export const readSegments = (host: HTMLElement): ListOption[] => {
  const panels = tabPanels(host);
  if (!panels.length) return readOptions(host);
  return panels.map((panel, index) => ({
    value: panel.value ?? panel.getAttribute('value') ?? String(index),
    label: panel.label ?? panel.getAttribute('label') ?? '',
    disabled: false,
  }));
};

/** Fait compter un nombre de 0 à count (ralenti à la fin) ; renvoie de quoi l'arrêter. */
export const countUp = (count: number, onFrame: (value?: number) => void) => {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / COUNT_MS);
    onFrame(progress < 1 ? count * (1 - (1 - progress) ** 3) : undefined);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
};
