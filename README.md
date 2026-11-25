# sizzle-serve-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/deppil90/sizzle-serve-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/deppil90/sizzle-serve-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Sizzle & Serve — a fast-paced cooking game. Run the food-truck kitchen: read the order board, stack dishes on your plate, grill patties until they ding, and serve before customers walk out. A 3-minute shift, combos, coins, strikes, and a star rating at the end. Keyboard and mouse, fully offline, no network requests.

## Run it

```sh
python3 -m http.server 8123 --directory game
```

Then open http://localhost:8123/ in a desktop browser. Or serve `game/` with any static server and open `index.html`.

## How to play

- Click an ingredient (or press 1-6) to add it to your plate. Patties go on the grill first — click the grill slot (or press G) when the patty dings, before it burns.
- When your plate matches a ticket on the order board, press Space or the SERVE button. A wrong dish costs a strike; three strikes end the shift.
- Orders expire — serve fast for a time bonus, and chain serves for a combo bonus.

## Layout

- `game/` — the playable game as static files (`index.html` + `src/*.js` + `style.css`).
- `screenshots/` — real renders of the game's own code (title/kitchen, mid-assembly, plate ready to serve, shift over).
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=p2frk8rs&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
