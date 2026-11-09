import { Build, Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { ListOption, edgeIndex, keyMove, matchIndex, readOptions, revealInList, watchOptions } from '../../utils/listbox';
import { Popup, PopupAnimation, createPopup } from '../../utils/popup';
import { PopupPanel } from '../../utils/popup-view';
import { nextTyped } from '../../utils/selection';

/**
 * Menu d'actions. Les actions sont des éléments option enfants.
 * @part trigger - Le bouton qui ouvre le menu.
 * @part menu - Le panneau du menu.
 * @part item - Une action.
 */
@Component({
  tag: 'cr-menu',
  styleUrls: ['../../global/popup.css', 'cr-menu.css'],
  shadow: { delegatesFocus: true },
})
export class CrMenu {
  @Element() el!: HTMLElement;

  /** Libellé du bouton qui ouvre le menu. */
  @Prop() label!: string;
  /** Nom complet annoncé par les lecteurs d'écran quand le libellé seul est ambigu ; doit contenir le libellé visible (« Actions pour Clavier »). */
  @Prop() accessibleLabel?: string;
  /** Animation d'ouverture et de fermeture du menu. */
  @Prop() animation: PopupAnimation = 'fade';
  /** Désactive le bouton. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand une action est choisie ; detail : sa valeur. */
  @Event() crSelect: EventEmitter<string>;

  @State() items: ListOption[] = [];
  @State() open = false;
  @State() active = -1;

  private trigger?: HTMLButtonElement;
  private panel?: HTMLElement;
  private popup?: Popup;
  private unwatch?: () => void;
  private typed = { text: '', at: 0 };

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, (items) => (this.items = items));
  }

  disconnectedCallback() {
    this.unwatch?.();
    this.popup?.destroy();
  }

  componentWillLoad() {
    this.items = readOptions(this.el);
  }

  componentDidRender() {
    if (this.popup || !this.panel || !this.trigger) return;
    this.popup = createPopup({
      popup: this.panel,
      anchor: this.trigger,
      host: this.el,
      onOpen: () => (this.open = true),
      onClose: () => (this.open = false),
    });
  }

  private item(index: number) {
    return this.panel?.querySelector<HTMLElement>(`#item-${index}`) ?? undefined;
  }

  private focusItem(index: number) {
    if (index < 0) return;
    this.active = index;
    this.item(index)?.focus({ preventScroll: true });
    revealInList(this.item(index));
  }

  private openAt(edge: 'first' | 'last') {
    this.popup?.open();
    this.focusItem(edgeIndex(this.items, edge));
  }

  private close(focusTrigger: boolean, picked?: HTMLElement) {
    this.popup?.close(picked);
    if (focusTrigger) this.trigger?.focus();
  }

  private activate(index: number) {
    const item = this.items[index];
    if (!item || item.disabled) return;
    this.crSelect.emit(item.value);
    this.close(true, this.item(index));
  }

  private onTriggerKeyDown = (event: KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      this.openAt(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  };

  private onMenuKeyDown = (event: KeyboardEvent) => {
    const move = keyMove(event.key, this.items, this.active);
    if (move !== undefined) {
      event.preventDefault();
      this.focusItem(move);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activate(this.active);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    } else if (event.key === 'Tab') {
      this.close(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.typed = nextTyped(this.typed, event.key);
      this.focusItem(matchIndex(this.items, this.typed.text, this.typed.text.length > 1 ? this.active - 1 : this.active));
    }
  };

  render() {
    return [
      <button
        ref={(el) => (this.trigger = el)}
        id="trigger"
        class="menu-trigger"
        part="trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={this.open ? 'true' : 'false'}
        aria-controls="menu"
        aria-label={this.accessibleLabel}
        disabled={this.disabled}
        onClick={() => (this.popup?.isOpen() ? this.close(false) : this.openAt('first'))}
        onKeyDown={this.onTriggerKeyDown}
        onKeyUp={(event: KeyboardEvent) => event.key === ' ' && event.preventDefault()}
      >
        <span>{this.label}</span>
        <svg class="chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>,
      <PopupPanel panelRef={(el) => (this.panel = el)} part="menu" animation={this.animation}>
        <div class="list" id="menu" role="menu" aria-labelledby="trigger" onKeyDown={this.onMenuKeyDown}>
          {this.items.map((item, index) => (
            <div
              id={`item-${index}`}
              class="item"
              part="item"
              role="menuitem"
              tabindex="-1"
              style={{ '--i': `${index}` }}
              aria-disabled={item.disabled ? 'true' : undefined}
              data-active={this.open && index === this.active ? '' : undefined}
              onMouseMove={() => !item.disabled && index !== this.active && this.focusItem(index)}
              onClick={() => this.activate(index)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </PopupPanel>,
    ];
  }
}
