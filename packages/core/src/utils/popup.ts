import { followAnchor } from './listbox';

export type PopupAnimation = 'fade' | 'anchor-pop' | 'turn-over' | 'card-deal' | 'drum-roll' | 'outline-trace' | 'tile-build';

interface PopupOptions {
  popup: HTMLElement;
  anchor: HTMLElement;
  host: HTMLElement;
  onOpen: () => void;
  onClose: () => void;
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const settle = (popup: HTMLElement) =>
  Promise.all(popup.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined)));

const flyTo = (item: HTMLElement, anchor: HTMLElement) => {
  const from = item.getBoundingClientRect();
  const to = anchor.getBoundingClientRect();
  const x = to.left + to.width / 2 - (from.left + from.width / 2);
  const y = to.top + to.height / 2 - (from.top + from.height / 2);
  item.animate([{ transform: 'none' }, { transform: `translate(${x}px, ${y}px) scale(0.4)`, opacity: 0 }], {
    duration: 320,
    easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
    fill: 'forwards',
  });
};

export const createPopup = ({ popup, anchor, host, onOpen, onClose }: PopupOptions) => {
  let unfollow: (() => void) | undefined;
  const isOpen = () => popup.dataset.state === 'open';

  const outside = (event: PointerEvent) => {
    if (!event.composedPath().includes(host)) close();
  };

  const open = () => {
    if (isOpen()) return;
    popup.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    if (!popup.matches(':popover-open')) popup.showPopover();
    popup.dataset.state = 'open';
    unfollow?.();
    unfollow = followAnchor(popup, anchor);
    document.addEventListener('pointerdown', outside, true);
    onOpen();
  };

  async function close(picked?: HTMLElement) {
    if (!isOpen()) return;
    popup.dataset.state = 'closing';
    document.removeEventListener('pointerdown', outside, true);
    onClose();
    if (picked && popup.dataset.animation === 'card-deal' && !reducedMotion()) flyTo(picked, anchor);
    await settle(popup);
    if (popup.dataset.state !== 'closing') return;
    popup.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    popup.hidePopover();
    delete popup.dataset.state;
    unfollow?.();
  }

  const destroy = () => {
    document.removeEventListener('pointerdown', outside, true);
    unfollow?.();
  };

  return { open, close, isOpen, destroy };
};

export type Popup = ReturnType<typeof createPopup>;
