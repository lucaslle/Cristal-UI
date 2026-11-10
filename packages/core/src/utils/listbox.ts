export interface ListOption {
  value: string;
  label: string;
  disabled: boolean;
  /** data-count de l'option (compteur de cr-segmented). */
  count?: string;
}

export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const stepIndex = (options: ListOption[], from: number, step: 1 | -1) => {
  for (let index = from + step; index >= 0 && index < options.length; index += step) {
    if (!options[index].disabled) return index;
  }
  return from;
};

export const edgeIndex = (options: ListOption[], edge: 'first' | 'last') =>
  edge === 'first' ? stepIndex(options, -1, 1) : stepIndex(options, options.length, -1);

export const matchIndex = (options: ListOption[], query: string, from: number) => {
  const wanted = normalize(query);
  const ordered = [...options.keys()].map((offset) => (from + 1 + offset) % options.length);
  return ordered.find((index) => !options[index].disabled && normalize(options[index].label).startsWith(wanted)) ?? -1;
};

export const placeBelowOrAbove = (popup: HTMLElement, anchor: HTMLElement) => {
  const rect = anchor.getBoundingClientRect();
  const gap = 4;
  popup.style.minWidth = `${rect.width}px`;
  const height = popup.offsetHeight;
  const fitsBelow = rect.bottom + gap + height <= window.innerHeight || rect.top < height + gap;
  popup.dataset.placement = fitsBelow ? 'below' : 'above';
  popup.style.left = `${Math.max(gap, Math.min(rect.left, window.innerWidth - popup.offsetWidth - gap))}px`;
  popup.style.top = `${fitsBelow ? rect.bottom + gap : rect.top - gap - height}px`;
};

export const keyMove = (key: string, options: ListOption[], active: number): number | undefined =>
  ({
    ArrowDown: () => stepIndex(options, active, 1),
    ArrowUp: () => stepIndex(options, active, -1),
    Home: () => edgeIndex(options, 'first'),
    End: () => edgeIndex(options, 'last'),
  })[key]?.();

export const followAnchor = (popup: HTMLElement, anchor: HTMLElement) => {
  const place = () => placeBelowOrAbove(popup, anchor);
  place();
  window.addEventListener('scroll', place, true);
  window.addEventListener('resize', place);
  return () => {
    window.removeEventListener('scroll', place, true);
    window.removeEventListener('resize', place);
  };
};

export const readOptions = (host: HTMLElement): ListOption[] =>
  Array.from(host.querySelectorAll('option')).map((option) => ({
    value: option.value,
    label: option.textContent?.trim() ?? '',
    disabled: option.disabled,
    count: option.dataset.count,
  }));

export const watchOptions = (host: HTMLElement, onChange: (options: ListOption[]) => void, read = readOptions) => {
  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.target !== host || mutation.type === 'childList')) onChange(read(host));
  });
  observer.observe(host, { childList: true, subtree: true, characterData: true, attributes: true });
  return () => observer.disconnect();
};

export const revealInList = (item?: HTMLElement | null) => {
  const list = item?.parentElement;
  if (!item || !list) return;
  if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
  else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
};
