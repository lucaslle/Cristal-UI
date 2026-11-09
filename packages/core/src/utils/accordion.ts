import { reducedMotion } from './popup';

export type AccordionVariant = 'list' | 'panels';
export type AccordionAnimation = 'slide' | 'accent-bar' | 'cascade';

export const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const within = (roots: Element[], selector: string) =>
  roots.reduce<HTMLElement[]>((found, root) => found.concat(root.matches(selector) ? [root as HTMLElement] : [], Array.from(root.querySelectorAll<HTMLElement>(selector))), []);

const NUMBER = /\d(?:[\d\s  .,]*\d)?/;

/** Fait défiler le premier nombre du texte de 0 jusqu'à data-cr-count, puis remet le texte d'origine. */
export const countUp = (el: HTMLElement, delay: number) => {
  const target = Number(el.dataset.crCount);
  const text = el.textContent ?? '';
  const match = text.match(NUMBER);
  if (!match || !Number.isFinite(target)) return;
  const decimals = (el.dataset.crCount?.split('.')[1] ?? '').length;
  const format = new Intl.NumberFormat(document.documentElement.lang || undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const start = performance.now() + delay;
  const step = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - start) / 700));
    el.textContent = t < 1 ? text.replace(match[0], format.format(target * (1 - (1 - t) ** 3))) : text;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/** Cascade : les enfants glissent l'un après l'autre, [data-cr-grow] pousse depuis le bas, [data-cr-count] défile. */
export const reveal = (children: Element[]) => {
  if (reducedMotion()) return;
  children.forEach((child, i) =>
    child.animate([{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 80 + i * 70, easing: EASE, fill: 'backwards' }),
  );
  within(children, '[data-cr-grow]').forEach((bar, i) =>
    bar.animate([{ transform: 'scaleY(0)', transformOrigin: 'bottom' }, { transform: 'none', transformOrigin: 'bottom' }], {
      duration: 480,
      delay: 160 + i * 90,
      easing: EASE,
      fill: 'backwards',
    }),
  );
  within(children, '[data-cr-count]').forEach((el, i) => countUp(el, 120 + i * 70));
};
