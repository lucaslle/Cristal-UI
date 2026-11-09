export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type TableVariant = 'default' | 'striped' | 'cards' | 'minimal' | 'grid';

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'start' | 'end';
  pinned?: boolean;
  hidden?: boolean;
  /** Affiche la valeur en pastille colorée : { Payée: 'success', 'En attente': 'warning' }. */
  badges?: Record<string, BadgeTone>;
}

export interface ColumnState {
  key: string;
  width: number;
  pinned: boolean;
  hidden: boolean;
}

export type TableDensity = 'comfortable' | 'normal' | 'compact';

export interface TableLayout {
  columns: ColumnState[];
  density: TableDensity;
}

export const MIN_WIDTH = 64;
export const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 160;

export const DENSITIES: Record<TableDensity, string> = { comfortable: 'confortables', normal: 'normales', compact: 'compactes' };

/** Les colonnes fixées passent devant, dans leur ordre relatif. */
export const pinnedFirst = (state: ColumnState[]) => [...state.filter((column) => column.pinned), ...state.filter((column) => !column.pinned)];

export const clampWidth = (width: number) => Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)));

/** État de départ, en gardant ce qui est déjà connu (réglages enregistrés ou précédents) pour les mêmes colonnes. */
export const mergeState = (columns: TableColumn[], known: ColumnState[] = []) => {
  const byKey = new Map(known.map((column) => [column.key, column]));
  const kept = known.filter((column) => columns.some((c) => c.key === column.key));
  const added = columns
    .filter((column) => !byKey.has(column.key))
    .map((column) => ({ key: column.key, width: clampWidth(column.width ?? DEFAULT_WIDTH), pinned: !!column.pinned, hidden: !!column.hidden }));
  return pinnedFirst([...kept, ...added]);
};

const update = (state: ColumnState[], key: string, change: Partial<ColumnState>) => state.map((column) => (column.key === key ? { ...column, ...change } : column));

export const resize = (state: ColumnState[], key: string, width: number) => update(state, key, { width: clampWidth(width) });

export const togglePin = (state: ColumnState[], key: string) => pinnedFirst(update(state, key, { pinned: !state.find((column) => column.key === key)?.pinned }));

export const setHidden = (state: ColumnState[], key: string, hidden: boolean) =>
  hidden && state.filter((column) => !column.hidden).length <= 1 ? state : update(state, key, { hidden });

/** Déplace une colonne à la place de la colonne visible `target`, sans franchir la limite entre colonnes fixées et libres. */
export const moveTo = (state: ColumnState[], key: string, target: string) => {
  const from = state.findIndex((column) => column.key === key);
  const to = state.findIndex((column) => column.key === target);
  if (from < 0 || to < 0 || from === to || state[from].pinned !== state[to].pinned) return state;
  const next = [...state];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

/** Voisine visible d'une colonne (step = -1 à gauche, 1 à droite). */
export const neighbour = (state: ColumnState[], key: string, step: 1 | -1) => {
  const visible = state.filter((column) => !column.hidden);
  return visible[visible.findIndex((column) => column.key === key) + step]?.key;
};

export const summary = (state: ColumnState[], density: TableDensity) => {
  const shown = state.filter((column) => !column.hidden).length;
  const pinned = state.filter((column) => column.pinned && !column.hidden).length;
  return `${shown} colonnes sur ${state.length} · ${pinned} ${pinned > 1 ? 'fixées' : 'fixée'} · lignes ${DENSITIES[density]}`;
};

/** Décalage gauche de chaque colonne fixée visible, pour position: sticky. */
export const pinOffsets = (state: ColumnState[]) => {
  let left = 0;
  return new Map(
    state
      .filter((column) => column.pinned && !column.hidden)
      .map((column) => {
        const offset = left;
        left += column.width;
        return [column.key, offset];
      }),
  );
};

export const loadLayout = (storageKey?: string): Partial<TableLayout> | undefined => {
  if (!storageKey) return undefined;
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? 'null') ?? undefined;
  } catch {
    return undefined;
  }
};

export const saveLayout = (storageKey: string | undefined, value: TableLayout | null) => {
  if (!storageKey) return;
  try {
    if (value) localStorage.setItem(storageKey, JSON.stringify(value));
    else localStorage.removeItem(storageKey);
  } catch {
    // Stockage indisponible (navigation privée) : les réglages valent pour la session.
  }
};
