import { Component, h } from '@stencil/core';

/**
 * Zone fixe en bas à droite de l'écran qui empile les cr-alert en notifications, la plus récente en bas.
 * @slot - Les cr-alert.
 */
@Component({
  tag: 'cr-toaster',
  styleUrl: 'cr-toaster.css',
  shadow: true,
})
export class CrToaster {
  render() {
    return <slot />;
  }
}
