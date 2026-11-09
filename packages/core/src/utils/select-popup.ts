import { ListOption } from './listbox';
import { Popup, createPopup } from './popup';
import { openingIndex } from './selection';

export interface SelectPopupHost {
  el: HTMLElement;
  search?: HTMLInputElement;
  options: ListOption[];
  open: boolean;
  active: number;
  visible(): number[];
  selection(): string[];
  setQuery(query: string): void;
}

export const selectPopup = (host: SelectPopupHost) => {
  let popup: Popup | undefined;
  let trigger: HTMLElement | undefined;
  let nextActive: number | undefined;

  const onOpen = () => {
    host.open = true;
    host.active = nextActive ?? openingIndex(host.options, host.visible(), host.selection());
    nextActive = undefined;
    host.search?.focus({ preventScroll: true });
    host.search?.setSelectionRange(host.search.value.length, host.search.value.length);
  };

  const onClose = () => {
    host.open = false;
    host.setQuery('');
  };

  return {
    attach(listbox?: HTMLElement, anchor?: HTMLElement) {
      if (popup || !listbox || !anchor) return;
      trigger = anchor;
      popup = createPopup({ popup: listbox, anchor, host: host.el, onOpen, onClose });
    },
    isOpen: () => !!popup?.isOpen(),
    show(index?: number) {
      nextActive = index;
      host.active = index ?? host.active;
      popup?.open();
    },
    close(picked?: HTMLElement) {
      const fromSearch = !!host.search && host.el.shadowRoot?.activeElement === host.search;
      popup?.close(picked);
      if (fromSearch) trigger?.focus();
    },
    destroy: () => popup?.destroy(),
  };
};
