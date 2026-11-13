import { FunctionalComponent, h } from '@stencil/core';
import { t } from './i18n';

/** Bouton pause des animations décoratives (cr-background, cr-weather) : nommé, annoncé enfoncé à l'arrêt ; styles dans global/pause-toggle.css. */
export const PauseToggle: FunctionalComponent<{ host: Element; paused: boolean; onToggle: () => void }> = ({ host, paused, onToggle }) => (
  <button type="button" class="toggle" part="toggle" aria-pressed={String(paused)} onClick={onToggle}>
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d={paused ? 'M8 5.5v13l10.5-6.5z' : 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z'} fill="currentColor" />
    </svg>
    <span class="sr-only">{t(host).pauseAnimation}</span>
  </button>
);
