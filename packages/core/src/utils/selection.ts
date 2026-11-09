import { ListOption, keyMove, normalize } from './listbox';

export const visibleIndices = (options: ListOption[], query: string) => {
  const wanted = normalize(query.trim());
  return [...options.keys()].filter((index) => normalize(options[index].label).includes(wanted));
};

export const moveWithin = (key: string, options: ListOption[], visible: number[], active: number) => {
  const next = keyMove(
    key,
    visible.map((index) => options[index]),
    visible.indexOf(active),
  );
  return next === undefined ? undefined : visible[next];
};

export const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export const formValue = (name: string | undefined, values: string[], multiple: boolean) => {
  if (!values.length) return null;
  if (!multiple) return values[0];
  const data = new FormData();
  if (name) values.forEach((value) => data.append(name, value));
  return data;
};

export const summary = (options: ListOption[], values: string[], labels: Map<string, string>) => {
  const shown = options.filter((option) => values.includes(option.value));
  const missing = values.filter((value) => !shown.some((option) => option.value === value));
  return [...shown.map((option) => option.label), ...missing.map((value) => labels.get(value)).filter(Boolean)].join(', ');
};

export type KeyAction = 'move' | 'pick' | 'tab' | 'escape' | 'open' | 'type';

export const keyAction = (event: KeyboardEvent, open: boolean, inSearch: boolean): KeyAction | undefined => {
  const { key } = event;
  if (['ArrowDown', 'ArrowUp'].includes(key) || (!inSearch && ['Home', 'End'].includes(key))) return 'move';
  if (open && (key === 'Enter' || (key === ' ' && !inSearch))) return 'pick';
  if (open && key === 'Tab') return 'tab';
  if (open && key === 'Escape') return 'escape';
  if (!open && (key === ' ' || key === 'Enter')) return 'open';
  if (key.length === 1 && !inSearch && !event.ctrlKey && !event.metaKey && !event.altKey) return 'type';
  return undefined;
};

export const nextTyped = (typed: { text: string; at: number }, key: string) => {
  const now = Date.now();
  return { text: now - typed.at < 500 ? typed.text + key : key, at: now };
};

export const firstEnabled = (options: ListOption[], visible: number[]) => visible.find((index) => !options[index].disabled) ?? -1;

export const openingIndex = (options: ListOption[], visible: number[], selection: string[]) =>
  visible.find((index) => selection.includes(options[index].value)) ?? firstEnabled(options, visible);
