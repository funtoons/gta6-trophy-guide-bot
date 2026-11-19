// Renders the checklist rows and the trophy detail panel (guide + cited sources).
import { GRADE_GLYPHS, KIND_LABELS, isSpoilerHidden } from './filters.js';

/** One checklist row: checkbox, official name + description, grade and kind pills. */
export function buildTrophyRow(trophy, state, onToggle, onSelect) {
  const li = document.createElement('li');
  li.className = 'trophy-row';
  li.dataset.id = String(trophy.id);
  if (state.earned.has(trophy.id)) li.classList.add('earned');
  if (state.selectedId === trophy.id) li.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  box.addEventListener('click', (event) => event.stopPropagation());

  const text = document.createElement('div');
  const hidden = isSpoilerHidden(trophy, state);
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Hidden until earned — turn spoilers off or earn it to reveal.' : trophy.description;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(gradePill(trophy.grade));
  if (trophy.kind !== 'platinum') meta.append(kindPill(trophy));
  if (trophy.hidden) meta.append(tagPill('Hidden'));
  if (trophy.missable) meta.append(tagPill('⚠ Missable', 'missable'));
  if (trophy.count && trophy.countOf) meta.append(tagPill(`${trophy.count} of ${trophy.countOf}`, 'count'));
  text.append(name, desc, meta);

  const dot = document.createElement('span');
  dot.className = `grade-dot ${trophy.grade}`;
  dot.textContent = GRADE_GLYPHS[trophy.grade];
  dot.title = trophy.grade;

  li.append(box, text, dot);
  li.addEventListener('click', () => onSelect(trophy.id));
  return li;
}

function gradePill(grade) {
  const pill = document.createElement('span');
  pill.className = `pill grade-${grade}`;
  pill.textContent = grade[0].toUpperCase() + grade.slice(1);
  return pill;
}

function kindPill(trophy) {
  const pill = document.createElement('span');
  pill.className = 'pill kind';
  pill.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  return pill;
}

function tagPill(text, extraClass) {
  const pill = document.createElement('span');
  pill.className = `pill${extraClass ? ` ${extraClass}` : ''}`;
  pill.textContent = text;
  return pill;
}

/** Render the whole visible list into the <ul>. */
export function renderChecklist(listEl, trophies, state, onToggle, onSelect) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    listEl.append(buildTrophyRow(trophy, state, onToggle, onSelect));
  }
}

/** The detail panel: official name/description/grade, the guide in our own words, and its sources. */
export function renderDetail(panel, trophy, state, onToggleEarned) {
  panel.replaceChildren();
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Pick a trophy from the list to read its guide and sources.';
    panel.append(hint);
    return;
  }
  const hidden = isSpoilerHidden(trophy, state);
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official name and description hidden until earned.'
    : `${trophy.description} — ${trophy.grade[0].toUpperCase() + trophy.grade.slice(1)} trophy${trophy.hidden ? ' · hidden on PlayStation until earned' : ''}.`;
  panel.append(title, official);

  if (trophy.missable) {
    const callout = document.createElement('p');
    callout.className = 'missable-callout';
    callout.textContent = `⚠ Missable: ${trophy.missableNote ?? 'This trophy can be missed.'}`;
    panel.append(callout);
  }

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler hiding is on, so this trophy’s name, description and guide stay hidden until you earn it. Tick it earned below, or turn spoilers off, to reveal the guide.';
    panel.append(note);
  } else {
    const heading = document.createElement('h3');
    heading.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    panel.append(heading, guide);

    const sourceHeading = document.createElement('h3');
    sourceHeading.textContent = 'Sources for this guide';
    const list = document.createElement('ul');
    list.className = 'sources';
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    panel.append(sourceHeading, list);
  }

  const earned = state.earned.has(trophy.id);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'earn-btn';
  button.textContent = earned ? '✓ Earned — unmark' : 'Mark as earned';
  button.addEventListener('click', () => onToggleEarned(trophy.id, !earned));
  panel.append(button);
}

/** Update the header progress bar and grade breakdown. */
export function renderProgress(state, total) {
  const earned = state.earned.size;
  document.getElementById('progressCount').textContent = `${earned} of ${total} earned`;
  document.getElementById('progressFill').style.width = `${(earned / total) * 100}%`;
  const byGrade = {};
  for (const trophy of state.trophies) {
    if (state.earned.has(trophy.id)) byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  }
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade.platinum ?? 0}/1 · Gold ${byGrade.gold ?? 0}/2 · Silver ${byGrade.silver ?? 0}/6 · Bronze ${byGrade.bronze ?? 0}/46`;
}
