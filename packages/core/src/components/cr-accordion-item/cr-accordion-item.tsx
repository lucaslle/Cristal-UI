import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { AccordionAnimation, AccordionVariant, EASE, reveal } from '../../utils/accordion';
import { reducedMotion } from '../../utils/popup';

/**
 * Section d'un accordéon, à placer dans cr-accordion.
 * @slot - Le contenu de la section.
 * @slot meta - Valeur affichée à droite de l'en-tête (total, statistique…).
 * @part header - Le bouton de l'en-tête.
 * @part panel - Le contenu.
 */
@Component({
  tag: 'cr-accordion-item',
  styleUrls: ['cr-accordion-item.css', 'variants.css'],
  shadow: { delegatesFocus: true },
})
export class CrAccordionItem {
  @Element() el!: HTMLCrAccordionItemElement;

  /** Titre de la section. */
  @Prop() label!: string;
  /** Section ouverte. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Désactive la section. */
  @Prop({ reflect: true }) disabled = false;
  /** Étape terminée (variant="steps") ; mis à true par next(). */
  @Prop({ mutable: true, reflect: true }) done = false;

  /** Émis quand la section s'ouvre ou se ferme ; detail : true si ouverte. */
  @Event() crToggle: EventEmitter<boolean>;

  @State() closing = false;

  private panel?: HTMLElement;
  private content?: HTMLSlotElement;
  private pending?: boolean;
  private running?: Animation;

  @Watch('open')
  onOpenChange(open: boolean) {
    this.closing = !open;
    this.pending = open;
    this.crToggle.emit(open);
  }

  private config() {
    const parent = this.el.parentElement;
    const accordion = parent?.tagName === 'CR-ACCORDION' ? (parent as HTMLCrAccordionElement) : undefined;
    const siblings = accordion ? Array.from(accordion.children).filter((child) => child.tagName === 'CR-ACCORDION-ITEM') : [this.el];
    return {
      variant: (accordion?.variant ?? accordion?.getAttribute('variant') ?? 'list') as AccordionVariant,
      animation: (accordion?.animation ?? accordion?.getAttribute('animation') ?? 'slide') as AccordionAnimation,
      numbered: accordion?.numbered ?? accordion?.hasAttribute('numbered') ?? false,
      level: accordion?.headingLevel ?? Number(accordion?.getAttribute('heading-level') ?? 3),
      index: siblings.indexOf(this.el),
      last: siblings[siblings.length - 1] === this.el,
    };
  }

  componentDidRender() {
    const panel = this.panel;
    if (this.pending === undefined || !panel) return;
    const open = this.pending;
    this.pending = undefined;
    this.running?.cancel();
    const { variant, animation } = this.config();
    if (open && animation === 'cascade') reveal(this.content?.assignedElements({ flatten: true }) ?? []);
    if (reducedMotion() || variant === 'panels') {
      this.closing = false;
      return;
    }
    const height = `${panel.scrollHeight}px`;
    panel.style.overflow = 'hidden';
    this.running = panel.animate({ height: open ? ['0px', height] : [height, '0px'], opacity: open ? [0, 1] : [1, 0] }, { duration: 300, easing: EASE });
    this.running.oncancel = () => (panel.style.overflow = '');
    this.running.onfinish = () => {
      panel.style.overflow = '';
      if (!open) this.closing = false;
    };
  }

  private toggle = () => {
    if (this.config().variant === 'panels' && this.open) return;
    this.open = !this.open;
  };

  render() {
    const { variant, animation, numbered, level, index, last } = this.config();
    return (
      <Host data-variant={variant} data-animation={animation} data-last={last ? '' : undefined}>
        {variant === 'steps' && (
          <span class="marker" aria-hidden="true">
            {this.done ? (
              <svg class="tick" viewBox="0 0 24 24" width="16" height="16">
                <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
            ) : (
              index + 1
            )}
          </span>
        )}
        <div class="item">
          <div role="heading" aria-level={level}>
            <button
              id="header"
              class="header"
              part="header"
              type="button"
              aria-expanded={this.open ? 'true' : 'false'}
              aria-controls="panel"
              disabled={this.disabled}
              onClick={this.toggle}
            >
              {numbered && <span class="number">{String(index + 1).padStart(2, '0')}</span>}
              <span class="label">
                {this.label}
                {variant === 'steps' && this.done && <span class="sr-only">(terminée)</span>}
              </span>
              <span class="meta">
                <slot name="meta" />
              </span>
              {variant !== 'panels' && (
                <svg class="chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              )}
            </button>
          </div>
          <div ref={(el) => (this.panel = el)} id="panel" class="panel" part="panel" role="region" aria-labelledby="header" hidden={!this.open && !this.closing}>
            <div class="content">
              <slot ref={(el) => (this.content = el as HTMLSlotElement)} />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
