import { Game, STYLES } from './combat.js';
import { createRenderer } from './renderer.js';
import { createAudio } from './audio.js';
import { createAppShell } from './app-shell.js';

const $ = (id) => document.getElementById(id);
const canvas = $('arena');
const game = new Game('sparring');
const sound = createAudio();
let renderer;
try {
  renderer = createRenderer(canvas);
} catch (error) {
  const message = document.createElement('div');
  message.className = 'browser-error';
  message.textContent = 'The courtyard needs WebGL 2. Try a current Chrome, Edge, Firefox or Safari with hardware acceleration enabled.';
  document.body.append(message);
  console.error(error);
}

let started = false, paused = false, selectedMode = 'sparring', selectedStyle = 0;
let muted = false, locked = true, lastFrame = performance.now(), elapsed = 0;
let cameraLookPointer = null, messageUntil = 0, resultShown = false, hitstop = 0;
let lastStyle = -1, lastIntent = '', joystickPointer = null;
let touchGuard = null;
const keys = new Set(), joystick = { x: 0, z: 0 };
const stats = { hits: 0, deflects: 0, start: 0 };

function showMessage(text, seconds = 1.4) {
  $('combat-message').classList.remove('app-notice');
  $('combat-message').textContent = text;
  $('combat-message').classList.add('visible');
  messageUntil = elapsed + seconds;
}

function resetInput() {
  keys.clear(); joystick.x = 0; joystick.z = 0;
  game.setGuard(false);
  game.player.buffer = null;
  const look = cameraLookPointer;
  cameraLookPointer = null;
  if (look && canvas.hasPointerCapture(look.id)) canvas.releasePointerCapture(look.id);
  const movePointer = joystickPointer, guard = touchGuard;
  joystickPointer = null; touchGuard = null;
  const stick = $('joystick');
  if (movePointer !== null && stick?.hasPointerCapture(movePointer)) stick.releasePointerCapture(movePointer);
  if (guard?.element.hasPointerCapture(guard.id)) guard.element.releasePointerCapture(guard.id);
  if ($('joystick-nub')) $('joystick-nub').style.transform = 'translate(-50%, -50%)';
}

const appShell = createAppShell({
  root: document.querySelector('.game-shell'), button: $('fullscreen-toggle'),
  onReset: resetInput,
  onChange({ exited }) {
    lastFrame = performance.now();
    renderer?.resize();
    if (exited) pauseGame(true);
    else if (started && !paused && game.result === 'playing') canvas.focus({ preventScroll: true });
  },
  onNotice(text, seconds) { showMessage(text, seconds); $('combat-message').classList.add('app-notice'); },
});

// Host-panel expansion, browser chrome changes and rotation may resize the canvas
// without changing the outer window. Never keep a stale pointer anchor or held key.
const resizeGame = () => { resetInput(); lastFrame = performance.now(); renderer?.resize(); };
const resizeObserver = new ResizeObserver(resizeGame);
resizeObserver.observe(document.querySelector('.game-shell'));

function startGame(mode = selectedMode) {
  if (!renderer) return;
  selectedMode = mode;
  game.reset(mode);
  game.presentationPlaying = true;
  // Initial choice is a loadout selection, not an in-combat switch.
  game.player.style = selectedStyle;
  game.player.hybridStyle = (selectedStyle + 1) % STYLES.length;
  game.drainEvents();
  started = true; paused = false; resultShown = false; locked = true;
  lastStep.player = lastStep.enemy = 0;
  renderer.resetCamera(game);
  updateLockButton();
  hitstop = 0; resetInput();
  stats.hits = 0; stats.deflects = 0; stats.start = elapsed;
  $('start-overlay').hidden = true;
  $('pause-overlay').hidden = true;
  $('result-overlay').hidden = true;
  document.body.classList.add('is-playing');
  document.body.classList.remove('is-paused');
  $('pause-toggle').setAttribute('aria-pressed', 'false');
  $('pause-toggle').setAttribute('aria-label', 'Pause game');
  canvas.focus({ preventScroll: true });
  sound.unlock();
  $('combat-message').classList.remove('visible', 'app-notice');
  lastStyle = -1;
  updateHud();
}

function pauseGame(value = !paused) {
  if (!started || game.result !== 'playing') return;
  paused = value; resetInput();
  $('pause-overlay').hidden = !value;
  document.body.classList.toggle('is-paused', value);
  $('pause-toggle').setAttribute('aria-pressed', String(value));
  $('pause-toggle').setAttribute('aria-label', value ? 'Resume game' : 'Pause game');
  if (value) document.querySelector('[data-resume]')?.focus();
  else canvas.focus({ preventScroll: true });
}

function returnToMenu() {
  started = false; paused = false; resultShown = false; resetInput();
  game.reset(selectedMode);
  game.presentationPlaying = false;
  renderer?.resetCamera(game);
  $('start-overlay').hidden = false;
  $('pause-overlay').hidden = true;
  $('result-overlay').hidden = true;
  document.body.classList.remove('is-playing', 'is-paused');
  document.querySelector('[data-start]')?.focus();
}

function act(name, value) {
  if (!started || paused || game.result !== 'playing') return;
  if (name === 'evade') game.setInput(readCombatInput());
  if (name === 'hybrid') game.setHybridStyle((game.player.style + 1) % STYLES.length);
  if (!game.action(name, value) && game.player.stamina < 25) showMessage('CATCH YOUR BREATH', .7);
}

function updateLockButton() {
  $('camera-help').hidden = locked;
  $('lock-toggle').setAttribute('aria-pressed', String(locked));
  $('lock-toggle').setAttribute('aria-label', locked ? 'Release opponent lock' : 'Lock onto opponent');
  $('lock-toggle').title = locked ? 'Opponent locked · Tab' : 'Free camera · Tab to lock';
}
function toggleLock() {
  if (!started || paused || game.result !== 'playing') return;
  locked = !locked;
  updateLockButton();

  canvas.focus({ preventScroll: true });
}
$('lock-toggle').addEventListener('click', toggleLock);

document.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', () => startGame()));
document.querySelectorAll('[data-restart]').forEach(b => b.addEventListener('click', () => startGame()));
document.querySelectorAll('[data-return]').forEach(b => b.addEventListener('click', returnToMenu));
document.querySelectorAll('[data-resume]').forEach(b => b.addEventListener('click', () => pauseGame(false)));
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
  selectedMode = b.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === b)));
  if (!started) game.reset(selectedMode);
}));
document.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => {
  const style = Number(b.dataset.style);
  if (!started) { selectedStyle = style; game.player.style = style; lastStyle = -1; updateHud(); }
  else { act('style', style); if (!paused) canvas.focus({ preventScroll: true }); }
}));
$('pause-toggle').addEventListener('click', () => pauseGame());
$('sound-toggle').addEventListener('click', event => {
  muted = !muted; sound.setEnabled(!muted); if (!muted) sound.unlock();
  $('sound-toggle').setAttribute('aria-pressed', String(!muted));
  $('sound-toggle').setAttribute('aria-label', muted ? 'Enable sound' : 'Mute sound');
  $('sound-toggle').classList.toggle('muted', muted);
  showMessage(muted ? 'SOUND OFF' : 'SOUND ON', .8);
  if (event.detail > 0 && started && !paused) canvas.focus({ preventScroll: true });
});
$('help-toggle')?.addEventListener('click', () => {
  if (started && !paused) pauseGame(true);
  else if (started) pauseGame(false);
  else document.querySelector('.controls-guide')?.classList.toggle('expanded');
});

window.addEventListener('keydown', (event) => {
  if (!started) return;
  if (event.code === 'Escape' || event.code === 'KeyP') {
    event.preventDefault();
    if (!event.repeat) {
      if (event.code === 'Escape' && appShell.active()) { pauseGame(true); appShell.toggle(); }
      else pauseGame();
    }
    return;
  }
  if (paused || game.result !== 'playing') return;
  if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea, [contenteditable="true"]')) return;
  const recognized = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','KeyF','KeyJ','KeyK','KeyQ','KeyE','KeyR','Digit1','Digit2','Digit3','Tab'];
  if (!recognized.includes(event.code)) return;
  event.preventDefault(); keys.add(event.code);
  if (event.repeat) return;
  const actions = { KeyJ: 'light', KeyK: 'heavy', Space: 'evade', KeyQ: 'style', KeyE: 'hybrid' };
  if (actions[event.code]) act(actions[event.code]);
  if (event.code === 'KeyF') game.setGuard(true);
  if (event.code === 'KeyR') startGame();
  if (event.code.startsWith('Digit')) act('style', Number(event.code.slice(-1)) - 1);
  if (event.code === 'Tab') toggleLock();
});
window.addEventListener('keyup', event => {
  keys.delete(event.code);
  if (event.code === 'KeyF') game.setGuard(touchGuard !== null);
});
window.addEventListener('blur', () => { if (started && !paused && !appShell.busy) pauseGame(true); resetInput(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && started) pauseGame(true); });
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('pointermove', event => {
  if (cameraLookPointer?.id !== event.pointerId) return;
  const dx = event.clientX - cameraLookPointer.x, dy = event.clientY - cameraLookPointer.y;
  cameraLookPointer.x = event.clientX; cameraLookPointer.y = event.clientY;
  if (!paused && !locked) renderer?.orbit(dx, dy);
});
canvas.addEventListener('pointerdown', event => {
  if (!started || paused || game.result !== 'playing') return;
  canvas.focus({ preventScroll: true });
  if (event.button === 2 && locked && event.pointerType === 'mouse') {
    act('heavy');
    return;
  }
  if (event.pointerType === 'touch' || event.button === 2) {
    if (locked) return;
    event.preventDefault();
    if (cameraLookPointer !== null) return;
    cameraLookPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  } else if (event.button === 0) act('light');
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, event => {
  if (cameraLookPointer?.id === event.pointerId) cameraLookPointer = null;
});

document.querySelectorAll('[data-action]').forEach(b => {
  b.addEventListener('pointerdown', event => { event.preventDefault(); act(b.dataset.action); });
});
document.querySelectorAll('[data-guard]').forEach(b => {
  b.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (!started || paused || touchGuard !== null || game.result !== 'playing') return;
    touchGuard = { id: event.pointerId, element: b };
    b.setPointerCapture(event.pointerId);
    game.setGuard(true);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(name, event => {
    if (touchGuard?.id !== event.pointerId) return;
    touchGuard = null;
    game.setGuard(keys.has('KeyF'));
  });
});
const joystickElement = $('joystick');
function moveJoystick(event) {
  const box = joystickElement.getBoundingClientRect();
  let x = (event.clientX - box.left - box.width / 2) / (box.width * .32);
  let z = (event.clientY - box.top - box.height / 2) / (box.height * .32);
  const length = Math.hypot(x, z); if (length > 1) { x /= length; z /= length; }
  joystick.x = x; joystick.z = z;
  $('joystick-nub').style.transform = `translate(calc(-50% + ${x * box.width * .25}px), calc(-50% + ${z * box.height * .25}px))`;
}
joystickElement?.addEventListener('pointerdown', event => {
  event.preventDefault();
  if (!started || paused || joystickPointer !== null || game.result !== 'playing') return;
  joystickPointer = event.pointerId; joystickElement.setPointerCapture(event.pointerId); moveJoystick(event);
});
joystickElement?.addEventListener('pointermove', event => { if (event.pointerId === joystickPointer) moveJoystick(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) joystickElement?.addEventListener(name, event => {
  if (joystickPointer !== event.pointerId) return;
  joystick.x = joystick.z = 0; joystickPointer = null; $('joystick-nub').style.transform = 'translate(-50%, -50%)';
});

const hudIds = ['player-health','player-stamina','player-posture','enemy-health','enemy-posture','health-value','stamina-value','enemy-name'];
const hud = Object.fromEntries(hudIds.map(id => [id, $(id)]));
const lastMeter = new Map();
function meter(id, value, max) {
  const fraction = Math.round(Math.min(1, Math.max(0, value / max)) * 500) / 500;
  if (lastMeter.get(id) === fraction) return;
  lastMeter.set(id, fraction);
  hud[id].style.transform = `scaleX(${fraction})`;
}
function hudText(id, value) {
  const text = String(value);
  if (hud[id].textContent !== text) hud[id].textContent = text;
}
function updateHud() {
  const player = game.player, enemy = game.enemy;
  meter('player-health', player.health, player.maxHealth);
  meter('player-stamina', player.stamina, 100);
  meter('player-posture', player.posture, player.maxPosture);
  meter('enemy-health', enemy.health, enemy.maxHealth);
  meter('enemy-posture', enemy.posture, enemy.maxPosture);
  hudText('health-value', Math.ceil(player.health));
  hudText('stamina-value', Math.ceil(player.stamina));
  hudText('enemy-name', game.mode === 'boss' ? 'THE FRACTURED MASTER' : 'THE SILENT DISCIPLE');
  let intent = enemy.state === 'windup' ? `${enemy.attack?.name || 'Attack'} · Incoming` :
    enemy.state === 'broken' ? 'Posture broken · Strike now' : enemy.state === 'recovery' ? 'An opening' :
    game.phase > 1 ? 'Phase II · Unbound' : game.mode === 'boss' ? 'Guardian of the ashen courtyard' : 'Watch the amber tell, then counter.';
  if (intent !== lastIntent) { $('enemy-intent').textContent = intent; lastIntent = intent; }
  $('enemy-intent').classList.toggle('danger', enemy.state === 'windup');
  document.body.classList.toggle('low-health', player.health < player.maxHealth * .25 && player.health > 0);
  if (player.style !== lastStyle) {
    lastStyle = player.style;
    selectedStyle = player.style;
    const style = STYLES[player.style];
    $('style-description').textContent = style.description;
    document.querySelectorAll('[data-style]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.style) === player.style)));
    document.documentElement.style.setProperty('--style-color', style.color);
  }
}

const lastStep = { player: 0, enemy: 0 };
function playFootsteps() {
  for (const fighter of [game.player, game.enemy]) {
    const beat = Math.floor(fighter.movePhase / Math.PI);
    if (Number.isFinite(beat) && beat !== lastStep[fighter.id]) {
      lastStep[fighter.id] = beat;
      if (fighter.speed > .18) sound.step(fighter.id === 'player' ? .85 : .46);
    }
  }
}

function processEvents() {
  for (const event of game.drainEvents()) {
    renderer?.burst(event); sound.event(event);
    if (event.type === 'hit') {
      hitstop = Math.max(hitstop, event.kind === 'light' ? .018 : .036);
      if (event.actor === 'player') stats.hits++;
    }
    if (event.type === 'deflect') { hitstop = .048; stats.deflects++; showMessage('PERFECT DEFLECT', 1); }
    if (event.type === 'break') showMessage(event.actor === 'player' ? 'YOUR POSTURE IS BROKEN' : 'POSTURE BROKEN · STRIKE', 1.4);
    if (event.type === 'phase') showMessage('PHASE II · THE MASTER UNBOUND', 2.5);
    if (event.type === 'style') showMessage(STYLES[game.player.style].name.toUpperCase(), .8);
  }
}

function showResult() {
  resultShown = true; resetInput();
  const won = game.result === 'won';
  $('result-title').textContent = won ? 'A form remembered.' : 'Rise. And try again.';
  const seconds = Math.floor(game.time);
  $('result-detail').textContent = won ?
    `${game.mode === 'boss' ? 'The master yields.' : 'The disciple bows.'} ${stats.hits} strikes · ${stats.deflects} deflects · ${seconds}s` :
    'Every defeat has something to teach. Watch the amber tell, evade the strike, and punish the recovery.';
  $('result-overlay').hidden = false;
  document.querySelector('[data-restart]')?.focus();
}

function readCombatInput() {
  const horizontal = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + joystick.x;
  const vertical = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - joystick.z;
  const basis = renderer.movementBasis();
  let x = horizontal * basis.right.x + vertical * basis.forward.x;
  let z = horizontal * basis.right.z + vertical * basis.forward.z;
  const length = Math.hypot(x, z); if (length > 1) { x /= length; z /= length; }
  const aim = locked ? { x: game.enemy.x - game.player.x, z: game.enemy.z - game.player.z }
    : length > .01 ? { x, z } : { x: Math.sin(game.player.yaw), z: Math.cos(game.player.yaw) };
  return { x, z, aimX: aim.x, aimZ: aim.z };
}

function frame(now) {
  const wallTime = Math.max(0, (now - lastFrame) / 1000);
  const dt = Math.min(wallTime, .08);
  lastFrame = now;
  if (!paused && !document.hidden) renderer?.trackFrameTime(wallTime);
  elapsed += dt;
  if (started && !paused && game.result === 'playing') {
    const freeze = Math.min(dt, hitstop);
    hitstop -= freeze;
    game.update(dt - freeze, readCombatInput());
    playFootsteps();
    processEvents(); updateHud();
    if (game.result !== 'playing' && !resultShown) showResult();
  }
  if (messageUntil && elapsed > messageUntil) { $('combat-message').classList.remove('visible'); messageUntil = 0; }
  renderer?.render(game, paused ? 0 : dt, elapsed, locked);
  requestAnimationFrame(frame);
}
window.addEventListener('resize', resizeGame);
window.visualViewport?.addEventListener('resize', resizeGame);
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault(); pauseGame(true);
  showMessage('Graphics paused. Reload the game to reconnect.', 30);
});
document.querySelector('.brand')?.addEventListener('click', event => { event.preventDefault(); returnToMenu(); });
updateHud();
requestAnimationFrame(frame);

// Read-only QA snapshot: tests observe the same model used by the live game.
Object.defineProperty(window, '__THOUSAND_FORMS__', { value: {
  snapshot: () => ({ started, paused, locked, renderStats: renderer?.stats(), camera: renderer?.cameraSnapshot(game), cameraLookPointer: cameraLookPointer?.id ?? null,
    fullscreen: appShell.active(), keys: [...keys], joystick: { ...joystick },
    joystickPointer, touchGuard: touchGuard?.id ?? null, mode: game.mode, result: game.result, phase: game.phase,
    player: { ...game.player }, enemy: { ...game.enemy }, time: game.time }),
}, writable: false });
