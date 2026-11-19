// Renders the platinum roadmap and the missable-trophies view from roadmap.json data.
import { GRADE_GLYPHS } from './filters.js';

/** One roadmap stage: title, time, intro, notes and its trophies as jump buttons. */
export function buildRoadmapStage(stage, trophiesById, state, onJumpToTrophy) {
  const section = document.createElement('section');
  section.className = 'stage';
  const title = document.createElement('h2');
  title.textContent = `Stage ${stage.stage} — ${stage.title}`;
  const time = document.createElement('p');
  time.className = 'stage-time';
  time.textContent = stage.time;
  const intro = document.createElement('p');
  intro.textContent = stage.intro;
  section.append(title, time, intro);

  const notes = document.createElement('ul');
  for (const note of stage.notes ?? []) {
    const item = document.createElement('li');
    item.textContent = note;
    notes.append(item);
  }
  section.append(notes);

  const chips = document.createElement('div');
  chips.className = 'stage-trophies';
  const done = (stage.trophyIds ?? []).filter((id) => state.earned.has(id)).length;
  const total = (stage.trophyIds ?? []).length;
  const progress = document.createElement('p');
  progress.className = 'stage-time';
  progress.textContent = total ? `${done} of ${total} trophies in this stage earned` : '';
  section.append(progress);
  for (const id of stage.trophyIds ?? []) {
    const trophy = trophiesById.get(id);
    if (!trophy) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${GRADE_GLYPHS[trophy.grade]} ${trophy.name}`;
    if (state.earned.has(id)) button.classList.add('done');
    button.addEventListener('click', () => onJumpToTrophy(id));
    chips.append(button);
  }
  section.append(chips);
  return section;
}

/** Render every roadmap stage into the roadmap view. */
export function renderRoadmap(viewEl, roadmap, trophiesById, state, onJumpToTrophy) {
  viewEl.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = roadmap.title;
  const estimate = document.createElement('p');
  estimate.textContent = roadmap.estimate;
  viewEl.append(heading, estimate);
  for (const stage of roadmap.stages ?? []) {
    viewEl.append(buildRoadmapStage(stage, trophiesById, state, onJumpToTrophy));
  }
}

/** Render the missable view: the one flagged trophy, why, and the all-clear for the rest. */
export function renderMissable(viewEl, trophies, roadmap, state, onJumpToTrophy) {
  viewEl.replaceChildren();
  const hero = document.createElement('div');
  hero.className = 'missable-hero';
  const heading = document.createElement('h2');
  heading.textContent = roadmap.missable.headline;
  const body = document.createElement('p');
  body.textContent = roadmap.missable.body;
  hero.append(heading, body);
  viewEl.append(hero);

  const flagged = trophies.filter((t) => t.missable);
  const sub = document.createElement('h2');
  sub.textContent = `Flagged as missable (${flagged.length})`;
  viewEl.append(sub);
  for (const trophy of flagged) {
    const card = document.createElement('div');
    card.className = 'stage';
    const title = document.createElement('h2');
    title.textContent = `${GRADE_GLYPHS[trophy.grade]} ${trophy.name} — ${trophy.grade}`;
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    const note = document.createElement('p');
    note.textContent = trophy.missableNote ?? '';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'earn-btn';
    button.textContent = 'Open its guide in the checklist';
    button.addEventListener('click', () => onJumpToTrophy(trophy.id));
    card.append(title, desc, note, guide, button);
    viewEl.append(card);
  }

  const safe = document.createElement('div');
  safe.className = 'safe-note';
  const safeHeading = document.createElement('h2');
  safeHeading.textContent = 'Everything else is safe after the story';
  const safeBody = document.createElement('p');
  safeBody.textContent = 'PowerPyx confirms the other 54 trophies are all obtainable in free-roam after the credits: story trophies pop as you play, quest givers return, and the 100% checklist stays open. Optional missions may disappear and some fences go away, but none of that blocks a trophy. Keep 15 manual saves — one at the start and end of each chapter — and never use cheats on your trophy save, since cheats disable trophies and saving.';
  safe.append(safeHeading, safeBody);
  viewEl.append(safe);
}
