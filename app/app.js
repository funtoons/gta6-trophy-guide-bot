// Leonida Trophy Atlas — bootstrap: loads the trophy and roadmap data, owns the
// checklist state (earned, filters, search, spoiler, view, selection) and wires every
// control to the renderers. All state lives in localStorage and the page URL.
import { KIND_FILTERS, readQueryState, visibleTrophies, writeQueryState } from './filters.js';
import { downloadExport, loadEarned, parseImportDoc, saveEarned } from './storage.js';
import { renderChecklist, renderDetail, renderProgress } from './render.js';
import { renderMissable, renderRoadmap } from './roadmap.js';

const trophyDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophyDoc.trophies;
const trophiesById = new Map(trophies.map((t) => [t.id, t]));

const query = readQueryState();
const state = {
  trophies,
  earned: loadEarned(trophies.map((t) => t.id)),
  filter: query.filter,
  grade: 'all',
  search: '',
  spoiler: query.spoiler,
  earnedOnly: false,
  view: query.view,
  selectedId: query.trophy ?? trophies[0].id,
};

const listEl = document.getElementById('trophyList');
const detailPanel = document.getElementById('detailPanel');
const emptyState = document.getElementById('emptyState');
const listCount = document.getElementById('listCount');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const earnedOnlyBox = document.getElementById('earnedOnly');
const spoilerBox = document.getElementById('spoiler');
const importStatus = document.getElementById('importStatus');
const checklistView = document.getElementById('checklistView');
const roadmapView = document.getElementById('roadmapView');
const missableView = document.getElementById('missableView');

function renderAll() {
  const visible = visibleTrophies(trophies, state);
  renderChecklist(listEl, visible, state, toggleEarned, selectTrophy);
  renderDetail(detailPanel, trophiesById.get(state.selectedId), state, toggleEarned);
  renderProgress(state, trophies.length);
  document.title = `Leonida Trophy Atlas — ${state.earned.size} of ${trophies.length} earned`;
  listCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies` +
    (state.filter === 'online' ? ' — there are no online trophies; all 55 are single-player.' : '');
  emptyState.hidden = visible.length > 0;
  renderRoadmap(roadmapView, roadmapDoc, trophiesById, state, jumpToTrophy);
  renderMissable(missableView, trophies, roadmapDoc, state, jumpToTrophy);
  document.querySelectorAll('#viewTabs button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === state.view));
  });
  checklistView.hidden = state.view !== 'checklist';
  roadmapView.hidden = state.view !== 'roadmap';
  missableView.hidden = state.view !== 'missable';
  writeQueryState(state);
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderAll();
}

function jumpToTrophy(id) {
  state.selectedId = id;
  state.view = 'checklist';
  state.filter = 'all';
  state.search = '';
  searchInput.value = '';
  renderAll();
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setView(view) {
  state.view = view;
  renderAll();
}

function buildKindChips() {
  const chips = document.getElementById('kindChips');
  for (const kind of KIND_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = kind.label;
    button.dataset.filter = kind.value;
    button.setAttribute('aria-pressed', String(state.filter === kind.value));
    button.addEventListener('click', () => {
      state.filter = kind.value;
      chips.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter));
      });
      renderAll();
    });
    chips.append(button);
  }
}

function buildSourceList() {
  const list = document.getElementById('sourceList');
  const seen = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources ?? []) seen.set(source.url, source.name);
  }
  for (const [url, name] of seen) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = name;
    item.append(link);
    list.append(item);
  }
}

searchInput.addEventListener('input', () => { state.search = searchInput.value; renderAll(); });
gradeSelect.addEventListener('change', () => { state.grade = gradeSelect.value; renderAll(); });
earnedOnlyBox.addEventListener('change', () => { state.earnedOnly = earnedOnlyBox.checked; renderAll(); });
spoilerBox.addEventListener('change', () => { state.spoiler = spoilerBox.checked; renderAll(); });
spoilerBox.checked = state.spoiler;

document.querySelectorAll('#viewTabs button').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});
document.querySelectorAll('[data-goto-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setView(link.dataset.gotoView);
  });
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const name = downloadExport(state.earned, trophies.length);
  importStatus.textContent = `Exported ${state.earned.size} earned trophies to ${name}.`;
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const result = parseImportDoc(await file.text(), trophies.map((t) => t.id));
    state.earned = result.earned;
    saveEarned(state.earned);
    importStatus.textContent = `Imported ${result.imported} earned trophies from ${file.name}` +
      (result.skipped ? ` (${result.skipped} unknown ids skipped).` : '.');
  } catch (error) {
    importStatus.textContent = `Import failed: ${error.message}`;
  }
  event.target.value = '';
  renderAll();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!state.earned.size) return;
  if (confirm('Clear all earned ticks? You can re-import an export file to get them back.')) {
    state.earned.clear();
    saveEarned(state.earned);
    importStatus.textContent = 'Cleared all earned ticks.';
    renderAll();
  }
});

buildKindChips();
buildSourceList();
renderAll();
