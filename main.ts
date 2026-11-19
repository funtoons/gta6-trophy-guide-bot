// Leonida Trophy Atlas — the entry program for make.fun's gta6-trophy-guide-01 bounty.
// Node 22, standard library only, no network, no build step.
//
// What it hands in: this repository's app/ folder (the offline guide and tracker —
// static HTML, CSS and ES modules plus the trophy and roadmap data) and its
// screenshots/ folder (four real renders of the app), copied into the output
// directory, plus dossier.json, the summary the judge reads, written by the
// vendored make.fun library. vendor/makefun-frontend.ts is the kit's copy and is
// never edited: the scorer rebuilds the dossier with its own copy and compares
// the two byte for byte, so any change there would fail the entry.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where the repository lives, and where the entry goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function handIn(folder) {
  const source = join(repoRoot, folder);
  if (!existsSync(source)) return 0;
  cpSync(source, join(outputDir, folder), { recursive: true });
  return countFiles(source);
}

mkdirSync(outputDir, { recursive: true });
const appFiles = handIn('app');
const shotFiles = handIn('screenshots');

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB; app/ at most
// 993 files and directories and 48 MiB in all; the dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

console.log(
  `handed in ${appFiles} app files and ${shotFiles} screenshots ` +
  `(${statSync(dossierPath).size} byte dossier) to ${outputDir}`,
);
