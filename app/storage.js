// Progress storage: localStorage for ticks, JSON file export and import.
// Nothing here touches the network; the file round-trip is a plain download and a file read.
export const STORAGE_KEY = 'leonida-trophy-atlas-earned-v1';
export const EXPORT_APP = 'leonida-trophy-atlas';

/** Read the earned trophy ids from localStorage. Unknown ids are dropped. */
export function loadEarned(knownIds) {
  const known = new Set(knownIds);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => known.has(id)));
  } catch {
    return new Set();
  }
}

/** Persist the earned trophy ids to localStorage. */
export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Private mode or a full store: the checklist still works for this visit.
  }
}

/** Build the export document for a set of earned ids. */
export function buildExportDoc(earned, totalTrophies = 55) {
  return {
    app: EXPORT_APP,
    exportedAt: new Date().toISOString(),
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    totalTrophies,
    earned: [...earned].sort((a, b) => a - b),
  };
}

/** Download the progress as a JSON file. Returns the file name used. */
export function downloadExport(earned, totalTrophies = 55) {
  const name = `gta6-trophy-progress-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(buildExportDoc(earned, totalTrophies), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

/**
 * Parse an imported progress file. Accepts our export shape ({ earned: [ids] })
 * and the plain array shape ([ids]) the starter used.
 * Returns { earned: Set, imported: number, skipped: number } or throws an Error.
 */
export function parseImportDoc(text, knownIds) {
  const known = new Set(knownIds);
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const raw = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(raw)) throw new Error('That file holds no earned list I recognise.');
  const earned = new Set();
  let skipped = 0;
  for (const id of raw) {
    if (known.has(id)) earned.add(id);
    else skipped += 1;
  }
  return { earned, imported: earned.size, skipped };
}
