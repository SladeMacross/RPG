// Click Game — browser version. All game logic lives in this file.
document.addEventListener('DOMContentLoaded', () => {
  const SAVE_VERSION = 3;
  const SAVE_SLOTS = [1, 2, 3];
  const DIRS = ['north', 'east', 'south', 'west'];
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NOTE_TEXT = 'Three is the magic number.';

  const ITEMS = {
    key: { name: 'Key', description: 'A small, tarnished key, cold to the touch.' },
    uvlight: { name: 'UV Light', description: 'A handheld UV light. It can reveal writing invisible to the naked eye.' }
  };

  let state = null;

  // ---------- Helpers ----------

  const $ = id => document.getElementById(id);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const btn = (label, action, arg = '') => `<button data-action="${action}" data-arg="${arg}">${label}</button>`;
  const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const room = () => rooms[state.currentRoom];
  const roomState = () => state.roomStates[state.currentRoom];
  const has = item => state.inventory.includes(item);

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function addNote(text, persistent = false) {
    const list = persistent ? state.persistentNotes : state.notes;
    if (!list.includes(text)) list.push(text);
  }

  function say(html) {
    $('message').innerHTML = html;
  }

  function showScreen(id) {
    closeMenu();
    ['menu', 'loadmenu', 'game'].forEach(screen => $(screen).classList.toggle('hidden', screen !== id));
  }

  // Relative directions for the control pad: turning steps through DIRS, Back is the opposite wall.
  const rotate = (dir, steps) => DIRS[(DIRS.indexOf(dir) + steps + 4) % 4];

  // ---------- Level 1 puzzle ----------
  // Each letter gets a unique number 01–26, shown on the wall as two digits.
  // The code is the cipher number for the 3rd letter of each of the 3 words: always 6 digits.

  function generateCellPuzzle() {
    const numbers = shuffle(Array.from({ length: 26 }, (_, i) => i + 1));
    const cipher = {};
    [...LETTERS].forEach((letter, i) => { cipher[letter] = String(numbers[i]).padStart(2, '0'); });
    const words = Array.from({ length: 3 }, () =>
      Array.from({ length: randomInt(5, 8) }, () => LETTERS[randomInt(0, 25)]).join(''));
    const code = words.map(word => cipher[word[2]]).join('');
    return { words, cipher, code };
  }

  // ---------- Rooms ----------
  // Each room defines:
  //   createState()          fresh per-room state
  //   view(s, dir)           text shown when turning to face a direction
  //   inspectables(s, dir)   [objectId, button label] pairs available right now while facing dir
  //   inspect[objectId](s)   returns the message for inspecting that object
  //                          (s.searched[objectId] counts inspections: a 2nd look can find hidden things)
  //   actions(s, dir)        HTML for context actions (take, use, enter code...)
  //   handlers[action](s,a)  room-specific actions; return the message to show
  //   status(s)              [objectId, label, status] rows for the Search panel; a row only
  //                          shows once that object has been on screen
  //   exits[dir]             destination room, open once s.solved is true
  //   scene(s, dir)          optional: image name for a wall when it changes (e.g. 'west_open'),
  //                          or a list of names to try in order (later ones are fallbacks)
  //
  // Scene images live in images/<roomId>/<roomId>_<name>.jpg. Setting s.closeup = '<name>'
  // inside an inspect or handler shows a close-up instead; turning or inspecting
  // something else returns to the wall view.

  const rooms = {
    room1: {
      name: 'Concrete Cell',
      intro: 'Your head throbs as you awaken on a cold, gritty floor. The air is stale, and the faint buzz of flickering fluorescent lights overhead grates on your nerves. As your vision clears, you find yourself in a windowless concrete cell. There’s a rickety chair and a wobbly table to the east, an enormous painting covering the west wall, and plain walls to the north and south.',
      hints: [
        'Look more closely: some things need to be searched more than once.',
        'The UV light might reveal hidden secrets written on the walls.',
        'Take the third letter of each word and find its number in the code on the other wall. Enter the numbers in order.'
      ],
      exits: { west: 'room2' },
      // West wall: painting → painting swung open → door open.
      scene(s, dir) {
        if (dir !== 'west') return dir;
        if (s.solved) return 'west_exit';
        return s.paintingOpen ? 'west_open' : 'west';
      },

      createState: () => ({
        ...generateCellPuzzle(),
        closeup: null,
        seen: {},
        searched: {},
        taken: {},
        revealed: {},
        noteRead: false,
        paintingOpen: false,
        solved: false
      }),

      view(s, dir) {
        switch (dir) {
          case 'north': return 'A bare concrete wall, cold and unyielding.';
          case 'east': return 'A rickety chair and a wobbly table, both caked in dust.';
          case 'south': return 'A plain concrete wall, its surface marred by faint cracks.';
          case 'west':
            if (s.solved) return 'The hidden door stands open. The way west is clear.';
            if (s.paintingOpen) return 'The painting hangs open on its hinges. Behind it is a door with a number pad.';
            return 'An enormous painting covers the entire wall.';
        }
      },

      inspectables(s, dir) {
        switch (dir) {
          case 'north': return [['northWall', 'Inspect North Wall']];
          case 'east': return [['chair', 'Inspect Chair'], ['table', 'Inspect Table']];
          case 'south': return [['southWall', 'Inspect South Wall']];
          case 'west': {
            const list = [['painting', 'Inspect Painting']];
            if (s.searched.painting && !s.paintingOpen) list.push(['lock', 'Inspect Lock']);
            if (s.paintingOpen) list.push(['numpad', 'Inspect Number Pad']);
            return list;
          }
        }
      },

      // The chair and table hide their items: the first look finds only the surface,
      // the second look finds what's beneath.
      inspect: {
        northWall() {
          return 'It’s just a blank wall.';
        },
        southWall() {
          return 'It’s just a blank wall, aside from a few cracks.';
        },
        chair(s) {
          if (s.searched.chair === 1) return 'There is nothing on top of the chair.';
          if (s.searched.chair === 2) return 'You look more closely. Taped to the underside of the seat is a small key.';
          return s.taken.key ? 'You’ve searched the chair thoroughly. There’s nothing else.' : 'The key is still taped beneath the seat.';
        },
        table(s) {
          if (s.searched.table === 1) return 'You find a crumpled note on top of the table.';
          if (s.searched.table === 2) return 'You crouch and look beneath the table. A UV light is wedged against the underside.';
          return s.taken.uvlight ? 'You’ve searched the table thoroughly. There’s nothing else.' : 'The UV light is still wedged beneath the table.';
        },
        painting(s) {
          if (!state.paintingsSeen.includes('pawn')) state.paintingsSeen.push('pawn');
          addNote('Painting: a small soldier with a short sword and shield before a great castle.', true);
          if (s.paintingOpen) return 'The painting hangs open on its hinges, revealing a door with a number pad.';
          return 'The painting shows a small soldier with a short sword and a small shield. He looks undersized, almost too small for the canvas, and behind him rises an enormous fantasy castle.<br><br>There is a lock on the wooden frame.';
        },
        lock(s) {
          s.closeup = 'lock_locked';
          return 'A heavy iron lock holds the frame shut against the wall. It needs a key.';
        },
        numpad(s) {
          s.closeup = 'numberpad';
          return 'A number pad with ten worn buttons and a small display with room for six digits.';
        }
      },

      actions(s, dir) {
        if (s.solved) return '';
        const out = [];
        if (dir === 'east') {
          if (s.searched.chair >= 2 && !s.taken.key) out.push(btn('Take Key', 'take', 'key'));
          if (s.searched.table && !s.noteRead) out.push(btn('Read Note', 'readNote'));
          if (s.searched.table >= 2 && !s.taken.uvlight) out.push(btn('Take UV Light', 'take', 'uvlight'));
        }
        if ((dir === 'north' || dir === 'south') && has('uvlight')) {
          out.push(btn('Use UV Light on Wall', 'useUV'));
        }
        if (dir === 'west') {
          if (s.searched.lock && !s.paintingOpen && has('key')) out.push(btn('Use Key on Lock', 'useKey'));
          if (s.searched.numpad && !s.solved) {
            out.push('<input id="codeInput" type="text" inputmode="numeric" maxlength="6" placeholder="Enter code" aria-label="Number pad code">');
            out.push(btn('Enter Code', 'submitCode'));
          }
        }
        return out.join('');
      },

      handlers: {
        readNote(s) {
          s.noteRead = true;
          addNote(NOTE_TEXT);
          return `You read the note. It says: “${NOTE_TEXT}”`;
        },
        useUV(s) {
          if (state.facing === 'north') {
            s.revealed.northWall = true;
            addNote('North wall: ' + s.words.join(' '));
            return 'You shine the UV light across the north wall. Words glow into view:' +
              `<div class="wall-words">${s.words.map(w => `<span>${w}</span>`).join('')}</div>`;
          }
          s.revealed.southWall = true;
          addNote('South wall: ' + [...LETTERS].map(l => `${l}=${s.cipher[l]}`).join(' '));
          return 'You shine the UV light across the south wall. A code glows into view:' +
            `<div class="cipher">${[...LETTERS].map(l => `<span>${l} ${s.cipher[l]}</span>`).join('')}</div>`;
        },
        useKey(s) {
          if (!has('key') || !s.searched.lock) return 'You can’t use that here.';
          state.inventory = state.inventory.filter(i => i !== 'key');
          s.paintingOpen = true;
          s.closeup = 'lock_unlocked';
          return 'The key turns in the lock. The painting swings open, revealing a hidden door with a number pad.';
        },
        submitCode(s) {
          const input = $('codeInput');
          const guess = (input ? input.value : '').replace(/\D/g, '');
          if (!guess) return 'The number pad waits for a code.';
          if (guess !== s.code) return `You enter ${guess}. The number pad buzzes. That is the wrong code.`;
          s.solved = true;
          s.closeup = null;  // step back from the keypad to see the door swing open
          return 'That was the correct code! You hear a loud <em>click</em> and the door swings open.<br><br>The way west is clear.';
        }
      },

      status(s) {
        const n = s.searched;
        return [
          ['northWall', 'North Wall', s.revealed.northWall ? 'Revealed' : n.northWall ? 'Searched' : 'Unsearched'],
          ['chair', 'Chair', !n.chair ? 'Unsearched' : s.taken.key ? 'Cleared' : n.chair >= 2 ? 'Item found' : 'Searched'],
          ['table', 'Table', !n.table ? 'Unsearched'
            : s.noteRead && s.taken.uvlight ? 'Cleared'
            : n.table >= 2 && !s.taken.uvlight ? 'Item found'
            : !s.noteRead ? 'Note found' : 'Searched'],
          ['southWall', 'South Wall', s.revealed.southWall ? 'Revealed' : n.southWall ? 'Searched' : 'Unsearched'],
          ['painting', 'Painting', s.paintingOpen ? 'Opened' : n.painting ? 'Searched' : 'Unsearched'],
          ['lock', 'Lock', s.paintingOpen ? 'Unlocked' : n.lock ? 'Searched' : 'Unsearched'],
          ['numpad', 'Number Pad', s.solved ? 'Solved' : n.numpad ? 'Searched' : 'Unsearched']
        ];
      }
    },

    // Level 2 — placeholder until the library and bookshelf puzzle are built.
    room2: {
      name: 'The Library',
      intro: 'You step through the door into a vast room, far larger than the cell. One entire wall is a bookshelf, packed from floor to ceiling.<br><br><em>To be continued...</em>',
      hints: [],
      exits: {},
      createState: () => ({ seen: {}, searched: {}, solved: false }),
      view: (s, dir) => dir === 'north'
        ? 'A towering bookshelf covers the entire wall.'
        : 'Dim lamplight, dust, and silence.',
      inspectables: () => [],
      inspect: {},
      actions: () => '',
      handlers: {},
      status: () => []
    }
  };

  // ---------- Core actions ----------

  function startNew() {
    state = {
      currentRoom: null,
      facing: 'north',
      inventory: [],
      notes: [],            // cleared when leaving a room
      persistentNotes: [],  // kept for the whole game (paintings)
      paintingsSeen: [],    // order paintings were first inspected
      roomStates: {},
      hintsUsed: {}
    };
    showScreen('game');
    enterRoom('room1');
  }

  function enterRoom(id) {
    state.currentRoom = id;
    state.facing = 'north';
    state.notes = [];
    if (!state.roomStates[id]) state.roomStates[id] = rooms[id].createState();
    say(rooms[id].intro);
    render();
  }

  function turn(dir) {
    state.facing = dir;
    roomState().closeup = null;
    say(room().view(roomState(), dir));
    render();
  }

  function move(dir) {
    const dest = room().exits[dir];
    if (!dest || !roomState().solved) {
      say('You can’t go that way.');
      return;
    }
    enterRoom(dest);
  }

  function inspect(objectId) {
    const r = room();
    const s = roomState();
    const available = r.inspectables(s, state.facing).some(([id]) => id === objectId);
    if (!available) return;
    s.searched[objectId] = (s.searched[objectId] || 0) + 1;
    s.closeup = null;
    say(r.inspect[objectId](s));
    render();
  }

  function take(item) {
    const s = roomState();
    if (!ITEMS[item] || s.taken[item]) return;
    s.taken[item] = true;
    state.inventory.push(item);
    say(`You take the ${ITEMS[item].name}.`);
    render();
  }

  function inspectItem(item) {
    if (ITEMS[item]) say(ITEMS[item].description);
  }

  function showNote(index) {
    const notes = [...state.persistentNotes, ...state.notes];
    if (notes[index]) say(notes[index]);
  }

  function showHint() {
    const hints = room().hints;
    const used = state.hintsUsed[state.currentRoom] || 0;
    if (used >= hints.length) {
      say(hints.length ? 'There are no more hints available.' : 'No hints available here.');
      return;
    }
    state.hintsUsed[state.currentRoom] = used + 1;
    say(`Hint ${used + 1} of ${hints.length}: ${hints[used]}`);
  }

  // Combat is not built yet. When it is, call setCombat(true) to swap the
  // movement pad and room actions for the Attack/Block/Magic/Item/Run panel.
  function setCombat(active) {
    $('combatPanel').classList.toggle('hidden', !active);
    $('movePad').classList.toggle('hidden', active);
    $('roomActions').classList.toggle('hidden', active);
  }

  // ---------- In-game menu ----------

  const menuOpen = () => !$('gameMenu').classList.contains('hidden');

  function openMenu() {
    SAVE_SLOTS.forEach(slot => {
      const data = readSave(slot);
      $(`saveSlot${slot}`).textContent = data
        ? `Save to Slot ${slot} — ${rooms[data.currentRoom].name}, ${data.savedAt}`
        : `Save to Slot ${slot} — Empty`;
    });
    $('gameMenu').classList.remove('hidden');
    $('closeMenu').focus();
  }

  function closeMenu() {
    if (!menuOpen()) return;
    $('gameMenu').classList.add('hidden');
    $('menuButton').focus();
  }

  function quitToTitle() {
    if (!confirm('Return to the title screen? Unsaved progress will be lost.')) return;
    state = null;
    setCombat(false);
    showScreen('menu');
  }

  // ---------- Saving and loading ----------

  const saveKey = slot => `clickgame_save_${slot}`;

  function readSave(slot) {
    try {
      const data = JSON.parse(localStorage.getItem(saveKey(slot)));
      return data && data.version === SAVE_VERSION ? data : null;
    } catch {
      return null;
    }
  }

  function save(slot) {
    const data = { ...state, version: SAVE_VERSION, savedAt: new Date().toLocaleString() };
    try {
      localStorage.setItem(saveKey(slot), JSON.stringify(data));
      say(`Game saved to slot ${slot}.`);
    } catch {
      say('Could not save: browser storage is unavailable.');
    }
  }

  function showLoadMenu() {
    SAVE_SLOTS.forEach(slot => {
      const data = readSave(slot);
      const button = $(`loadSlot${slot}`);
      button.textContent = data ? `Slot ${slot}: ${rooms[data.currentRoom].name} (${data.savedAt})` : `Slot ${slot}: Empty`;
      button.disabled = !data;
    });
    showScreen('loadmenu');
  }

  function load(slot) {
    const data = readSave(slot);
    if (!data) return;
    delete data.version;
    delete data.savedAt;
    state = data;
    showScreen('game');
    say(`Game loaded from slot ${slot}. Location: ${room().name}, facing ${state.facing}.`);
    render();
  }

  // ---------- Rendering ----------

  const sceneImg = $('sceneImg');
  // Tall images (close-ups) are shown whole, over a blurred copy of themselves;
  // wide wall views fill the frame.
  sceneImg.addEventListener('load', () => {
    const tall = sceneImg.naturalHeight > sceneImg.naturalWidth * 0.8;
    const frame = sceneImg.parentElement;
    frame.classList.toggle('closeup', tall);
    frame.style.setProperty('--scene-src', tall ? `url("${sceneImg.src}")` : 'none');
  });
  sceneImg.addEventListener('error', () => {
    // A room can list fallback images for a view; try the next before showing the placeholder.
    const fallbacks = JSON.parse(sceneImg.dataset.fallbacks || '[]');
    if (fallbacks.length) {
      sceneImg.dataset.fallbacks = JSON.stringify(fallbacks.slice(1));
      sceneImg.src = fallbacks[0];
      return;
    }
    const name = sceneImg.dataset.scene || 'scene';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#121419"/><text x="50%" y="50%" fill="#6f6a5d" font-family="Georgia, serif" font-size="40" text-anchor="middle">No image yet: ${name}</text></svg>`;
    sceneImg.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
  });

  function render() {
    const r = room();
    const s = roomState();
    const dir = state.facing;

    $('roomName').textContent = r.name;
    $('facingDirection').textContent = cap(dir);
    $('padFacing').textContent = dir[0].toUpperCase();

    // Highlight Forward/Back once an exit in that direction has opened.
    const exitOpen = d => Boolean(r.exits[d] && s.solved);
    $('moveForward').classList.toggle('exit-open', exitOpen(dir));
    $('moveBack').classList.toggle('exit-open', exitOpen(rotate(dir, 2)));

    // scene() may return a list: the first image, then fallbacks if it doesn't exist yet.
    const views = [].concat(s.closeup || (r.scene ? r.scene(s, dir) : dir));
    const paths = views.map(v => `images/${state.currentRoom}/${state.currentRoom}_${v}.jpg`);
    const scene = `${state.currentRoom}_${views[0]}`;
    if (sceneImg.dataset.scene !== scene) {
      sceneImg.dataset.scene = scene;
      sceneImg.dataset.fallbacks = JSON.stringify(paths.slice(1));
      sceneImg.src = paths[0];
      sceneImg.alt = s.closeup ? `${r.name}: close-up` : `${r.name}, facing ${dir}`;
    }

    // Everything inspectable right now is on screen, so it counts as seen from here on.
    const inspectables = r.inspectables(s, dir);
    s.seen = s.seen || {};  // saves made before seen-tracking existed
    inspectables.forEach(([id]) => { s.seen[id] = true; });

    $('inspectActions').innerHTML = inspectables.map(([id, label]) => btn(label, 'inspect', id)).join('');
    $('actions').innerHTML = r.actions(s, dir);

    const rows = r.status(s).filter(([id]) => s.seen[id]).map(([, label, status]) => [label, status]);
    // Search checklist: Unsearched rows stay plain, anything else is in progress until it reaches a finished state.
    const DONE = ['Cleared', 'Revealed', 'Opened', 'Unlocked', 'Solved'];
    const rowClass = status => DONE.includes(status) ? 'done' : status === 'Unsearched' ? '' : 'in-progress';
    $('searchStatus').innerHTML = rows.length
      ? '<ul class="status-list">' + rows.map(([label, status]) =>
        `<li class="${rowClass(status)}"><span>${label}</span><span class="status-value">${status}</span></li>`).join('') + '</ul>'
      : 'Nothing seen yet.';

    // Long notes are shortened by CSS; the full text shows when clicked.
    const notes = [...state.persistentNotes, ...state.notes];
    $('notes').innerHTML = notes.length
      ? notes.map((note, i) => btn(note, 'showNote', i)).join('')
      : 'No notes.';

    $('inventory').innerHTML = state.inventory.length
      ? state.inventory.map(item => btn(ITEMS[item].name, 'inspectItem', item)).join('')
      : 'No items.';
  }

  // ---------- Input ----------

  const globalHandlers = { inspect, take, inspectItem, showNote };

  function runAction(action, arg) {
    if (!state) return;
    if (globalHandlers[action]) {
      globalHandlers[action](arg);
      return;
    }
    const handler = room().handlers[action];
    if (!handler) return;
    say(handler(roomState(), arg));
    render();
  }

  document.addEventListener('click', e => {
    const button = e.target.closest('[data-action]');
    if (button) runAction(button.dataset.action, button.dataset.arg);
  });

  const pad = {
    turnLeft: () => state && turn(rotate(state.facing, -1)),
    turnRight: () => state && turn(rotate(state.facing, 1)),
    moveForward: () => state && move(state.facing),
    moveBack: () => state && move(rotate(state.facing, 2))
  };
  const arrowKeys = { ArrowLeft: 'turnLeft', ArrowRight: 'turnRight', ArrowUp: 'moveForward', ArrowDown: 'moveBack' };

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'codeInput') runAction('submitCode');
    if (e.key === 'Escape') closeMenu();
    // Arrow keys drive the pad, unless typing or a menu/combat is up.
    const padAction = arrowKeys[e.key];
    if (padAction && state && !menuOpen() && e.target.tagName !== 'INPUT' && !$('movePad').classList.contains('hidden')) {
      e.preventDefault();
      pad[padAction]();
    }
  });

  $('gameMenu').addEventListener('click', e => {
    if (e.target.id === 'gameMenu') closeMenu();
  });

  const staticButtons = {
    ...pad,
    newGame: startNew,
    loadGame: showLoadMenu,
    backToMenu: () => showScreen('menu'),
    hintButton: () => state && showHint(),
    menuButton: () => state && openMenu(),
    closeMenu,
    quitToTitle
  };
  SAVE_SLOTS.forEach(slot => {
    staticButtons['saveSlot' + slot] = () => { if (state) { save(slot); closeMenu(); } };
    staticButtons['loadSlot' + slot] = () => load(slot);
  });
  Object.entries(staticButtons).forEach(([id, fn]) => $(id).addEventListener('click', fn));
});
