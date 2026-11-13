type Row = Record<string, unknown>;

/** Cases cochées d'un tableau : les identifiants (valeurs de rowKey) sont comparés en texte, 1 et '1' désignent la même ligne. */
export const selectionOf = (rows: Row[], selected: unknown[], rowKey: string) => {
  const ids = new Set(selected.map(String));
  const idOf = (row: Row) => String(row[rowKey]);
  const checked = rows.filter((row) => ids.has(idOf(row))).length;
  const all = rows.length > 0 && checked === rows.length;
  return {
    ids,
    idOf,
    all,
    some: checked > 0 && !all,
    toggleAll: () => (all ? [] : rows.map((row) => row[rowKey])),
    toggle: (id: string) => (ids.has(id) ? selected.filter((value) => String(value) !== id) : [...selected, rows.find((row) => idOf(row) === id)?.[rowKey]]),
  };
};
