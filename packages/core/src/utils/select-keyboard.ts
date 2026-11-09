import { ListOption, matchIndex } from './listbox';
import { firstEnabled, keyAction, moveWithin, nextTyped, visibleIndices } from './selection';

export interface SelectHost {
  options: ListOption[];
  active: number;
  query: string;
  multiple: boolean;
  searchable: boolean;
  search?: HTMLInputElement;
  isOpen(): boolean;
  visible(): number[];
  selection(): string[];
  show(index?: number): void;
  select(index: number): void;
  close(): void;
}

export const selectKeyboard = (host: SelectHost) => {
  let typed = { text: '', at: 0 };

  const typeKey = (key: string) => {
    if (host.searchable) {
      host.query = key;
      if (host.search) host.search.value = key;
      return host.show(firstEnabled(host.options, visibleIndices(host.options, key)));
    }
    typed = nextTyped(typed, key);
    const from = host.isOpen() ? host.active : host.options.findIndex((option) => host.selection().includes(option.value));
    const index = matchIndex(host.options, typed.text, typed.text.length > 1 ? from - 1 : from);
    if (index >= 0) host.show(index);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const open = host.isOpen();
    const action = keyAction(event, open, event.composedPath()[0] === host.search);
    if (!action) return;
    if (action !== 'tab') event.preventDefault();
    if (action === 'escape') event.stopPropagation();
    if (action === 'move') {
      if (!open) return host.show();
      host.active = moveWithin(event.key, host.options, host.visible(), host.active) ?? host.active;
    } else if (action === 'pick' || (action === 'tab' && !host.multiple)) host.select(host.active);
    else if (action === 'tab' || action === 'escape') host.close();
    else if (action === 'open') host.show();
    else typeKey(event.key);
  };

  const onQuery = (query: string) => {
    host.query = query;
    host.active = firstEnabled(host.options, visibleIndices(host.options, query));
  };

  return { onKeyDown, onQuery };
};
