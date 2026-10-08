# CLAUDE.md — Click Game (working title: Escape The Room)

Last updated: 2026-10-08

## What the game is

A browser-based click adventure (HTML/CSS/JS, no build step, no dependencies).
The player wakes in a sealed room, solves puzzles to escape, and progresses
through a strictly linear series of rooms. Mystery/adventure tone with a hidden
chess meta-puzzle running through the whole game.

- PRIMARY: this folder (browser version) — the active development target.
- ARCHIVE: an earlier Python text-adventure version of Level 1. It is NOT in this
  repo; its source is pasted in `Projects/Video Game/video game.txt`. Reference only.

To run locally: serve this folder over HTTP (e.g. `python -m http.server`) and
open `index.html`. Opening the file directly also works. In the Claude desktop app,
`.claude/launch.json` has an "rpg" preview on port 8125 (python http.server; it
caches, so force-reload game.js/style.css after edits).

## Where it lives

- Local folder: `Projects\RPG` (renamed from `Click-Game` on 2026-10-07).
- GitHub: https://github.com/Wargod-Enterprises/RPG (moved from SladeMacross on
  2026-10-07). Branch `main`; David's history commits straight to main.
- Live (GitHub Pages, from main): https://wargod-enterprises.github.io/RPG/ —
  updates about a minute after a push. Combat prototype:
  https://wargod-enterprises.github.io/RPG/combat-demo.html
- git works from the Bash tool (Git Bash), not from PowerShell. No `gh` CLI.

## Status: Chapter 1

Level 1 is complete in story, mechanics and visuals and is meant to ship as a
finished Chapter 1 (a vertical slice) before later levels. Remaining before
sharing: David's own play-through on a laptop and a phone, and the game's real
title (the title screen, `<h1>` and browser tab still say "Click Game" /
"Click-Game"). The RPG was chosen over the hacker game because it is closest
to done; the hacker game is parked, not abandoned.

## Story & narrative (decided — do not change)

- The player was CHOSEN. Escaping is the TRIAL, not an escape from captivity.
- The captor is an EXAMINER, not a villain.
- The ending is a symbolic CHECKMATE — the player meets a King and all chess
  pieces, representing winning a chess game they didn't know they were playing.
- Knight/castle imagery and the chess theme run through every level.
- Tone is mystery/adventure. Not horror, not comedy.

## Game structure

- Main game: 7 levels (completable without the chess meta-puzzle)
- Optional: 2 bonus levels unlockable during the main game
- Final: 1 unlockable 10th level (unlocked by completing both bonus levels)

### Painting sequence (each painting = a chess piece as a fantasy character, same castle backdrop)
Order decided 2026-10-07: Pawn → Knight → Bishop → Rook → Queen → King. This is both
ascending piece value (1, 3, 3, 5, 9, priceless) and classic opening development
order (pawns, knights before bishops, castle the rook, queen, king last). Never
explained to the player — a quiet reward for chess players.
- Level 1: Pawn — small soldier, short sword and shield, undersized, big castle behind
- Level 2: Knight — armored rider on a large armored horse (image exists: `images/room2/room2.jpg`)
- Level 3: Bishop — tall mage in a dark cloak
- Level 4: Rook — massive armored soldier with a lance
- Level 5: Queen
- Level 6: King

### Puzzle theme per level (SUGGESTIONS, not decided)
Each level's main puzzle can echo how its painting's piece moves, which keeps
every puzzle distinct (design principle 5):
- L1 Pawn: small, simple steps forward (built).
- L2 Knight: L-shaped jumps — the library bookshelf (planned).
- L3 Bishop: diagonals only — light beams, or tiles crossable only diagonally.
- L4 Rook: straight lines — sliding blocks or a straight-line corridor maze.
- L5 Queen: the 8-queens puzzle — place 8 so none can attack another.
- L6 King: one careful step at a time, never into danger — the room before the Captor.

### Level 1 — The Concrete Cell (BUILT, playable in browser)
- Facing north at start. Objects: chair + table (east), north wall, south wall, painting (west).
- DEEPER SEARCH (decided): there are no "look under" buttons. The 1st Inspect of
  the chair/table finds only the surface; the 2nd Inspect finds what's hidden beneath.
  Chair: nothing on top → key taped under the seat. Table: note on top
  ("Three is the magic number.") → UV light wedged underneath.
- Progressive discovery (decided): objects appear only once discovered. West wall:
  Inspect Painting → Inspect Lock appears → Use Key (needs lock inspected) →
  Inspect Number Pad appears → code input appears. The Search panel never
  lists hidden spots.
- SEARCH PANEL SHOWS ONLY WHAT'S BEEN ON SCREEN (decided 2026-10-07, applies to every room):
  an object joins the Search panel the first time it is on screen (you face its
  wall, or it's discovered while you face it) and then stays. A new game starts
  with only North Wall listed.
- UV light on NORTH wall reveals 3 "words" (decided: 3, echoing "Three is the
  magic number") — strings of random uppercase letters, 5–8 letters each.
- UV light on SOUTH wall reveals a cipher: every letter A–Z gets a UNIQUE number
  1–26, always displayed as two digits (A 07, B 21 ...).
- Code = the cipher number of the 3rd letter of each word, in order, as shown
  (two digits each) → ALWAYS 6 digits. What the player sees is exactly what they type.
- The painting is the Pawn. The key is consumed when used on the lock.
- Correct code → the view steps back from the keypad to the door-open image
  (west_exit), Forward glows gold facing west, and "Step Through the Door"
  appears in Actions from any facing. Either leads to Level 2.
- Randomized every new game.
- 3 sequential hints.
- `images/room1/room1_west.jpg` shows the Pawn painting (young soldier, short sword, round
  wooden shield, towering castle behind).

### Level 2 — The Library (PLACEHOLDER ONLY)
- `room2` exists in game.js as an intro + "To be continued..." with no objects.
- Planned: large room, bookshelf covering a wall; puzzle = pull books in a chess
  knight's L-shaped move pattern; bookshelf swings open to a hidden hallway.
- Painting: the Knight (push 'knight' to `state.paintingsSeen` on first inspect,
  add a persistent note, as room1 does for the pawn).
- Chess piece + board position collectible (optional meta-puzzle).

### Hallway 1 (NOT BUILT) — behind the bookshelf; locked door (puzzle TBD); maybe an enemy.
### Hallway 2 (NOT BUILT) — ladder; puzzle at top opens a ceiling hatch (TBD).
### Levels 3–6 (NOT BUILT) — painting + chess collectible + harder, distinct puzzles + enemies.
### Level 7 — Boss (NOT BUILT) — the Captor; drops a CLUE (not a key) for the final door.
### Ending (NOT BUILT) — meet the King and all pieces; checkmate; told through imagery.

## Chess meta-puzzle (optional hidden layer)

- Every room 1–6 has a chess-piece painting AND a chess piece collectible with a board position.
- Optional; never explained or tutorialized (unless David asks).
- Near the end: arrange the paintings in the order first seen — both a main-game
  puzzle and the meta-puzzle payoff. `state.paintingsSeen` already records this order.

## Enemy & combat system (NOT BUILT)

- Guards: mandatory, at chokepoints, drop keys.
- Initiates: fellow trial participants (competitors, not villains); mandatory or
  optional; drop weapons, clues, consumables. Optional ones guard chess collectibles.
- The Captor: final boss, longest pattern, hardest hitting, drops a CLUE.
- Combat = PATTERN RECOGNITION, not action. Each enemy has a hidden move sequence.
  Attack beats Magic, Block beats Attack, Magic beats Block. Wrong counters cost health.
  Environmental clues hint at patterns (especially the Captor's).
- ENEMIES ARE NOT INSPECTABLE (decided 2026-10-08): an enemy gets no Inspect
  button. Exploration offers only "Fight <enemy>" (e.g. "Fight Guard") to start the fight —
  not "Attack", which is a combat move; any
  pattern clue belongs to the environment (room text, walls, objects), not the enemy.
- Layout prototype: `combat-demo.html` (standalone, not linked from the game).
  In a fight the frame turns red (--danger) instead of gold, the enemy is drawn
  over the scene with a nameplate and hearts, the description reads
  "Combat · Round N", and the pad + Actions are replaced by a "Your move" card
  (big Attack/Block/Magic, smaller Item/Run) beside a card with your hearts and
  the enemy's moves so far (✓/✗ per round, "?" for next). The side panel adds a
  Counters card with the rule triangle. After the fight the normal layout returns.
- DEMO-ONLY CHOICES, NOT DECIDED: showing the enemy's move history (may be too
  easy for later enemies — harder fights could hide it); hearts (Guard 4, player 5;
  wrong counter −1 you, right counter −1 enemy, same move = no damage); Item heals
  1 without using the turn; Run returns to exploration and the enemy fully recovers.
- UI in game.js: the combat panel (`#combatPanel`, buttons `combatAttack/Block/Magic/Item/Run`)
  is hidden during exploration. `setCombat(true)` in game.js shows it and hides the
  movement pad and room actions; the buttons have no handlers yet.
  Item = use a consumable. Run = penalty/reset, TBD.

## Design principles (do not violate)

1. Few levels, hard and distinct puzzles. Quality over quantity.
2. No backtracking. Strictly linear.
3. Combat must feel like a puzzle.
4. The chess meta-puzzle stays hidden — never explained.
5. Each puzzle meaningfully different from the others.
6. Exploration rewards make the game easier, never required.
7. The paintings-in-order puzzle should feel like a retrospective.
8. The Captor is an examiner; the ending feels like graduation.

## Code structure (game.js — keep everything in this one file unless David asks)

- `rooms` object: each room is data + small functions:
  `createState`, `view(s, dir)`, `inspectables(s, dir)`, `inspect[objectId]`,
  `actions(s, dir)`, `handlers[action]`, `status(s)`, `exits[dir]`, `hints`, `intro`.
  Add a new level by adding a room entry; the engine needs no changes for basic rooms.
- Exits only open when that room's state has `solved: true`.
- EXIT BUTTON (decided 2026-10-08): once a room is solved, its `exitLabel` appears
  as a button in Actions, from any facing, and leaves by the room's exit (same
  as Forward toward it). Each room words its own exit — the pattern is
  "Step Through the Door" (Level 1), e.g. "Step Through the Bookshelf",
  "Climb Through the Hatch". Never "Exit Room"/"Enter Room": the player is
  moving forward in a trial, not escaping, and shouldn't be told what's next.
- `status(s)` returns `[objectId, label, status]` rows. The engine marks every
  current inspectable as seen in `s.seen` on each render and only shows rows whose
  objectId is seen, so rooms list every object and the engine handles visibility.
  Room state needs `seen: {}`.
- The engine counts inspections in `s.searched[objectId]` (1, 2, 3...) before
  calling `inspect[objectId]`, so rooms can hide things behind a second look.
- Buttons use `data-action` / `data-arg` and one delegated click listener.
  Global actions: inspect, take, inspectItem, showNote, exitRoom. Anything else is looked
  up in the current room's `handlers` (which return the message HTML).
- `state.notes` are per-room (cleared on leaving); `state.persistentNotes` last
  the whole game (painting descriptions).
- Saves: localStorage keys `clickgame_save_1..3`, with `version: 3`. Saves with
  another version are ignored (bump SAVE_VERSION if the state shape changes
  incompatibly).
- Controls (decided 2026-10-07): one dungeon-crawler pad — Forward/Back in the
  centre column, Turn Left/Turn Right on the sides, a compass letter in the middle.
  Turning steps through north/east/south/west; Forward moves the way you face,
  Back the opposite way. Forward/Back glow in the accent colour once an exit that
  way is open. Arrow keys drive the pad too.
- Screen zones: top bar (room name, Hint, Menu) → scene image → description card
  (facing + message, the main focus) → controls (pad + an "Actions" card side by
  side) → side panel (Inventory, Notes, Search as collapsible cards).
- Laptop/desktop (wider than 960px, taller than 560px): the game is exactly one
  screen tall, no scrolling. The scene image fills its frame (object-fit: cover)
  and takes whatever height is left; Notes and Search stretch to the bottom and
  scroll inside. Below 960px the side panel drops under the main column; below
  640px everything stacks for phones.
- Room text never repeats the facing direction — the FACING label shows it.
- Action buttons: gold border and hover glow; magnifier icon for Inspect, diamond
  for other actions.
- Search panel (renamed from Status): ○ not yet searched, gold • in progress,
  gold ✓ with dimmed text when finished (Cleared/Revealed/Opened/Unlocked/Solved).
- Menu button opens an overlay with Save 1–3 (each shows what's in the slot),
  Resume and Quit to Title. Load stays on the title screen.
- Look: "candlelit castle stone" palette as CSS variables in style.css
  (--bg, --surface, --line, --text, --accent, --danger); Cinzel for titles,
  Crimson Pro for body text (Google Fonts, Georgia fallback offline).
- Images live in one folder per room: `images/<roomId>/<roomId>_<name>.jpg`, where
  <name> is the facing (north/east/south/west), a changed wall from the room's
  optional `scene(s, dir)` (e.g. `west_open`; it may return a list, later names
  being fallbacks if an image doesn't exist yet), or a close-up set via `s.closeup`.
  A close-up shows until the player turns or inspects something else. Missing
  images show a dark "No image yet" placeholder (generated in JS).
- Wide images fill the frame (cover). Tall images (height > 0.8 × width, i.e. the
  portrait close-ups) are shown whole over a dimmed, blurred copy of themselves.
- Level 1 images (`images/room1/`): north, east, south, west (Pawn painting),
  west_open (painting swung open, door with keypad behind — shown once unlocked),
  west_exit (painting and door both open, only darkness beyond — shown after
  the correct code),
  lock_locked (on Inspect Lock), lock_unlocked (on Use Key), numberpad (on Inspect
  Number Pad; keypad with a six-digit display).
- `images/room2/room2.jpg` is the Knight painting for Level 2. Not loaded yet: when
  the library is built, rename it to `room2_<name>.jpg` for whichever wall holds it.

## Next steps (priority order)

1. Finish Chapter 1: David plays Level 1 start to escape on a laptop and a phone;
   give the game its real title; share the live link.
2. Design and build Level 2 (library, knight's-move bookshelf puzzle).
3. Design the hallway sections in detail.
4. Build the combat system in game.js, starting from combat-demo.html, once the
   demo-only choices above are decided.
5. Chess collectible system.
6. Level 3 onward.

Done: Pawn painting (2026-10-06); two layout/visual polish passes, Search panel,
one-screen laptop layout, phone layout, Level 1 close-up and door images, exit
button, combat layout demo (2026-10-07/08).

## Notes for the continuing AI

- David prefers receiving the finished result directly rather than a discussion first.
- David uses a multi-AI workflow and may bring decisions from other sessions.
  Trust them unless they contradict this document.
- When David says something is decided, it is decided. Don't relitigate.
- David thinks in big concepts and systems; translate high-level direction into working code.
- When David says "tell me if you understand first" (or similar), restate the
  change and any open questions, then WAIT for his go-ahead before editing.
- When David asks for a push: commit to main, push, then confirm the live site
  has picked it up. Keep this file updated with every decision.
