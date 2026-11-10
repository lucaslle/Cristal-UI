import { h } from '@stencil/core';

const marks = { info: 'M12 11v6M12 7.5v.01', success: 'M7.5 12.5l3 3 6-6.5', warning: 'M12 10v4M12 17.5v.01', danger: 'M12 7v6M12 16.5v.01' };

/** Cercle avec i, ✓ ou !, triangle avec ! pour warning : le type ne repose pas que sur la couleur. pathLength sert au tracé de cr-alert. */
export const ToastIcon = ({ variant }: { variant: keyof typeof marks }) => (
  <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {variant === 'warning' ? <path d="M12 3L2 20.5h20z" pathLength="1" /> : <circle cx="12" cy="12" r="10" pathLength="1" />}
    <path d={marks[variant]} pathLength="1" />
  </svg>
);

/** Le toast suit le pointeur à l'horizontale ; lâché au-delà d'un tiers de sa largeur, il part de ce côté, sinon il revient. */
export const swipe = (dismiss: (direction: number) => void) => (down: PointerEvent) => {
  const box = down.currentTarget as HTMLElement;
  if (down.button !== 0 || (down.target as Element).closest('button')) return;
  box.setPointerCapture(down.pointerId);
  let dx = 0;
  const move = (event: PointerEvent) => {
    dx = event.clientX - down.clientX;
    box.style.transform = `translateX(${dx}px)`;
    box.style.opacity = `${1 - Math.min(0.8, Math.abs(dx) / box.offsetWidth)}`;
  };
  const up = () => {
    box.removeEventListener('pointermove', move);
    box.removeEventListener('pointerup', up);
    box.removeEventListener('pointercancel', up);
    if (Math.abs(dx) > box.offsetWidth / 3) return dismiss(Math.sign(dx));
    const from = { transform: box.style.transform, opacity: box.style.opacity };
    box.style.removeProperty('transform');
    box.style.removeProperty('opacity');
    box.animate([from, {}], { duration: 200, easing: 'ease-out' });
  };
  box.addEventListener('pointermove', move);
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', up);
};
