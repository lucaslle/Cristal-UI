import { Component, h } from '@stencil/core';

/**
 * Zone fixe en bas à droite de l'écran qui empile les cr-toast, le plus récent en bas.
 * @slot - Les cr-toast.
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
