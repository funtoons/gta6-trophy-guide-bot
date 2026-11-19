# gta6-trophy-guide-bot

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/funtoons/gta6-trophy-guide-bot/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/funtoons/gta6-trophy-guide-bot/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Atlas — the offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy shows its official name, description and grade, plus a guide written in our own words that cites its sources (PowerPyx, PlanetGTA6/Exophase/PSNProfiles and more). The checklist saves in localStorage and exports to / imports from a JSON file; filters cover story, missable, collectibles, activities, side quests, robberies and money (the online filter honestly returns nothing — all 55 trophies are single-player); a spoiler setting hides the names and descriptions of hidden story trophies until they are earned; and an 8-stage roadmap leads to the platinum, with the one potentially missable trophy — Positive Mental Attitude and its Chapter 1 balcony meditation — flagged throughout. Five trophies had no confirmed method at launch, and the guide says so instead of inventing steps. The whole app is static files under `app/` and works with the network off.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or open `app/index.html` directly from any static server with `app/` at its root. No build step, no dependencies.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mqqhsens&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
