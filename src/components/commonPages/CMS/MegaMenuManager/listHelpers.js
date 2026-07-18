// Plain helper for editing a repeatable array of card items — deliberately
// NOT named `useX` (it holds no state itself, just closures over the
// caller's setter) so eslint's rules-of-hooks doesn't flag calling it from
// inside a .map() over columns.
export function makeListHelpers(items, setItems, blank) {
  return {
    update: (i, patch) => setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))),
    remove: (i) => setItems(items.filter((_, idx) => idx !== i)),
    add: () => setItems([...items, blank()]),
    move: (i, dir) => {
      const j = i + dir;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[i], next[j]] = [next[j], next[i]];
      setItems(next);
    },
  };
}
