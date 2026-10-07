# CLAUDE.md — Click Game (working title: Escape The Room)

Last updated: 2026-10-07

## What the game is

A browser-based click adventure (HTML/CSS/JS, no build step, no dependencies).
The player wakes in a sealed room, solves puzzles to escape, and progresses
through a strictly linear series of rooms. Mystery/adventure tone with a hidden
chess meta-puzzle running through the whole game.

- PRIMARY: this folder (browser version) — the active development target.
- ARCHIVE: an earlier Python text-adventure version of Level 1. It is NOT in this
  repo; its source is pasted in `Projects/Video Game/video game.txt`. Reference only.

To run locally: serve this folder over HTTP (e.g. `python -m http.server`) and
open `index.html`. Opening the file directly also works.

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
- Level 2: Knight — armored rider on a large armored horse (image exists: `images/room2.jpg`)
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
  Inspect Number Pad appears → code input appears. The Search Status list grows the
  same way (Lock, Number Pad added when found) and never lists hidden spots.
- UV light on NORTH wall reveals 3 "words" (decided: 3, echoing "Three is the
  magic number") — strings of random uppercase letters, 5–8 letters each.
- UV light on SOUTH wall reveals a cipher: every letter A–Z gets a UNIQUE number
  1–26, always displayed as two digits (A 07, B 21 ...).
- Code = the cipher number of the 3rd letter of each word, in order, as shown
  (two digits each) → ALWAYS 6 digits. What the player sees is exactly what they type.
- The painting is the Pawn. The key is consumed when used on the lock.
  Correct code → "Move West" exits.
- Randomized every new game.
- 3 sequential hints.
- `images/room1_west.jpg` shows the Pawn painting (young soldier, short sword, round
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
- UI: Attack/Block/Magic/Item/Run buttons exist in index.html but are not wired up
  (they have no ids yet). Item = use a consumable. Run = penalty/reset, TBD.

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
- The engine counts inspections in `s.searched[objectId]` (1, 2, 3...) before
  calling `inspect[objectId]`, so rooms can hide things behind a second look.
- Buttons use `data-action` / `data-arg` and one delegated click listener.
  Global actions: inspect, take, inspectItem, showNote. Anything else is looked
  up in the current room's `handlers` (which return the message HTML).
- `state.notes` are per-room (cleared on leaving); `state.persistentNotes` last
  the whole game (painting descriptions).
- Saves: localStorage keys `clickgame_save_1..3`, with `version: 3`. Saves with
  another version are ignored (bump SAVE_VERSION if the state shape changes
  incompatibly).
- Scene image: `images/<roomId>_<facing>.jpg`. Missing images show a dark
  "No image yet" placeholder (generated in JS).
- Existing images: room1_north, room1_east, room1_south, room1_west.
- `images/room2.jpg` is the Knight painting for Level 2. Not loaded yet: when the
  library is built, rename it to `room2_<facing>.jpg` for whichever wall holds it.

## Next steps (priority order)

1. Design and build Level 2 (library, knight's-move bookshelf puzzle).
2. Design the hallway sections in detail.
3. Build the combat system and wire up the combat buttons.
4. Chess collectible system.
5. Level 3 onward.

(Done: Pawn painting image replaced, 2026-10-06.)

## Notes for the continuing AI

- David prefers receiving the finished result directly rather than a discussion first.
- David uses a multi-AI workflow and may bring decisions from other sessions.
  Trust them unless they contradict this document.
- When David says something is decided, it is decided. Don't relitigate.
- David thinks in big concepts and systems; translate high-level direction into working code.
