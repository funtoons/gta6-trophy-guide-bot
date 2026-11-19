// Filters, search, spoiler state and deep links (?trophy=, ?filter=, ?spoiler=, ?view=).
// The URL is kept in sync with replaceState so any state can be screenshotted or shared.
export const KIND_FILTERS = [
  { value: 'all', label: 'All 55' },
  { value: 'story', label: 'Story' },
  { value: 'missable', label: 'Missable' },
  { value: 'collectible', label: 'Collectibles' },
  { value: 'activity', label: 'Activities' },
  { value: 'side', label: 'Side quests' },
  { value: 'robbery', label: 'Robberies' },
  { value: 'money', label: 'Money & property' },
  { value: 'online', label: 'Online' },
];

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  completion: '100% completion',
  activity: 'Activity',
  side: 'Side quest',
  collectible: 'Collectible',
  robbery: 'Robbery',
  money: 'Money & property',
  misc: 'One-off',
};

export const GRADE_GLYPHS = { platinum: '◆', gold: '●', silver: '●', bronze: '●' };

/** Read the starting state from the page URL. Invalid values fall back to defaults. */
export function readQueryState() {
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter') ?? 'all';
  const knownFilters = new Set(KIND_FILTERS.map((f) => f.value));
  const trophy = Number(params.get('trophy'));
  const view = params.get('view');
  return {
    filter: knownFilters.has(filter) ? filter : 'all',
    spoiler: params.get('spoiler') === '1',
    view: view === 'roadmap' || view === 'missable' ? view : 'checklist',
    trophy: Number.isInteger(trophy) && trophy >= 1 && trophy <= 55 ? trophy : null,
  };
}

/** Write the current state back to the URL without reloading. */
export function writeQueryState(state) {
  const params = new URLSearchParams();
  if (state.filter !== 'all') params.set('filter', state.filter);
  if (state.spoiler) params.set('spoiler', '1');
  if (state.view !== 'checklist') params.set('view', state.view);
  if (state.selectedId) params.set('trophy', String(state.selectedId));
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

/** Does a trophy pass the active kind filter? Online is always empty: all 55 are single-player. */
export function passesKindFilter(trophy, filter) {
  if (filter === 'all') return true;
  if (filter === 'missable') return trophy.missable === true;
  if (filter === 'online') return false;
  return trophy.kind === filter;
}

/** Does a trophy match the search text (official name, description, kind)? */
export function passesSearch(trophy, query) {
  if (!query) return true;
  const hay = `${trophy.name} ${trophy.description} ${KIND_LABELS[trophy.kind] ?? ''}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => hay.includes(word));
}

/** The full visible list for the current filters, in trophy order. */
export function visibleTrophies(trophies, state) {
  return trophies.filter((t) => {
    if (!passesKindFilter(t, state.filter)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedOnly && !state.earned.has(t.id)) return false;
    return passesSearch(t, state.search);
  });
}

/** A trophy's name and description are spoilers while hidden and unearned with spoilers on. */
export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id);
}
