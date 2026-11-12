import { Game, STYLES } from './combat.js';
import { createRenderer } from './renderer.js';
import { createAudio } from './audio.js';

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
let pointer = null, messageUntil = 0, resultShown = false, hitstop = 0;
let lastStyle = -1, lastIntent = '', joystickPointer = null;
const keys = new Set(), joystick = { x: 0, z: 0 };
const stats = { hits: 0, deflects: 0, start: 0 };

function showMessage(text, seconds = 1.4) {
  $('combat-message').textContent = text;
  $('combat-message').classList.add('visible');
  messageUntil = elapsed + seconds;
}

function resetInput() {
  keys.clear(); joystick.x = 0; joystick.z = 0;
  game.setGuard(false);
  if ($('joystick-nub')) $('joystick-nub').style.transform = 'translate(-50%, -50%)';
  joystickPointer = null;
}

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
  showMessage(mode === 'boss' ? 'THE FRACTURED MASTER · Read the tell. Find your opening.' : 'SPARRING · Watch the amber tell, then counter.', 3.5);
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
  $('start-overlay').hidden = false;
  $('pause-overlay').hidden = true;
  $('result-overlay').hidden = true;
  document.body.classList.remove('is-playing', 'is-paused');
  document.querySelector('[data-start]')?.focus();
}

function act(name, value) {
  if (!started || paused || game.result !== 'playing') return;
  if (name === 'hybrid') game.setHybridStyle((game.player.style + 1) % STYLES.length);
  if (!game.action(name, value) && game.player.stamina < 25) showMessage('CATCH YOUR BREATH', .7);
}

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
  else act('style', style);
}));
$('pause-toggle').addEventListener('click', () => pauseGame());
$('sound-toggle').addEventListener('click', () => {
  muted = !muted; sound.setEnabled(!muted); if (!muted) sound.unlock();
  $('sound-toggle').setAttribute('aria-pressed', String(!muted));
  $('sound-toggle').setAttribute('aria-label', muted ? 'Enable sound' : 'Mute sound');
  $('sound-toggle').classList.toggle('muted', muted);
  showMessage(muted ? 'SOUND OFF' : 'SOUND ON', .8);
});
$('help-toggle')?.addEventListener('click', () => {
  if (started && !paused) pauseGame(true);
  else if (started) pauseGame(false);
  else document.querySelector('.controls-guide')?.classList.toggle('expanded');
});

window.addEventListener('keydown', (event) => {
  if (!started) return;
  if (event.code === 'Escape' || event.code === 'KeyP') { event.preventDefault(); if (!event.repeat) pauseGame(); return; }
  if (paused || game.result !== 'playing') return;
  const recognized = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','KeyF','KeyJ','KeyK','KeyQ','KeyE','KeyR','Digit1','Digit2','Digit3','Tab'];
  if (!recognized.includes(event.code)) return;
  event.preventDefault(); keys.add(event.code);
  if (event.repeat) return;
  const actions = { KeyJ: 'light', KeyK: 'heavy', Space: 'evade', KeyQ: 'style', KeyE: 'hybrid' };
  if (actions[event.code]) act(actions[event.code]);
  if (event.code === 'KeyF') game.setGuard(true);
  if (event.code === 'KeyR') startGame();
  if (event.code.startsWith('Digit')) act('style', Number(event.code.slice(-1)) - 1);
  if (event.code === 'Tab') { locked = !locked; showMessage(locked ? 'FOCUS · Facing your opponent' : 'FREE AIM · Follow the cursor', 1.4); }
});
window.addEventListener('keyup', event => {
  keys.delete(event.code);
  if (event.code === 'KeyF') game.setGuard(false);
});
window.addEventListener('blur', () => { if (started && !paused) pauseGame(true); resetInput(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && started) pauseGame(true); });
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('pointermove', event => { pointer = renderer?.projectPointer(event.clientX, event.clientY); });
canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') return;
  canvas.focus({ preventScroll: true });
  pointer = renderer?.projectPointer(event.clientX, event.clientY);
  act(event.button === 2 ? 'heavy' : 'light');
});

document.querySelectorAll('[data-action]').forEach(b => {
  b.addEventListener('pointerdown', event => { event.preventDefault(); act(b.dataset.action); });
});
document.querySelectorAll('[data-guard]').forEach(b => {
  b.addEventListener('pointerdown', event => {
    event.preventDefault(); b.setPointerCapture(event.pointerId);
    if (started && !paused) game.setGuard(true);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(name, () => game.setGuard(false));
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
  event.preventDefault(); joystickPointer = event.pointerId; joystickElement.setPointerCapture(event.pointerId); moveJoystick(event);
});
joystickElement?.addEventListener('pointermove', event => { if (event.pointerId === joystickPointer) moveJoystick(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) joystickElement?.addEventListener(name, () => {
  joystick.x = joystick.z = 0; joystickPointer = null; $('joystick-nub').style.transform = 'translate(-50%, -50%)';
});

function updateHud() {
  const player = game.player, enemy = game.enemy;
  const meter = (id, value, max) => { if ($(id)) $(id).style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`; };
  meter('player-health', player.health, player.maxHealth);
  meter('player-stamina', player.stamina, 100);
  meter('player-posture', player.posture, player.maxPosture);
  meter('enemy-health', enemy.health, enemy.maxHealth);
  meter('enemy-posture', enemy.posture, enemy.maxPosture);
  if ($('health-value')) $('health-value').textContent = Math.ceil(player.health);
  if ($('stamina-value')) $('stamina-value').textContent = Math.ceil(player.stamina);
  $('enemy-name').textContent = game.mode === 'boss' ? 'THE FRACTURED MASTER' : 'THE SILENT DISCIPLE';
  let intent = enemy.state === 'windup' ? `${enemy.attack?.name || 'Attack'} · Incoming` :
    enemy.state === 'broken' ? 'Posture broken · Strike now' : enemy.state === 'recovery' ? 'An opening' :
    game.phase > 1 ? 'Phase II · Unbound' : game.mode === 'boss' ? 'Guardian of the ashen courtyard' : 'Read the rhythm. Find your form.';
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

function processEvents() {
  for (const event of game.drainEvents()) {
    renderer?.burst(event); sound.event(event);
    if (event.type === 'hit') { hitstop = .04; if (event.actor === 'player') stats.hits++; }
    if (event.type === 'deflect') { hitstop = .065; stats.deflects++; showMessage('PERFECT DEFLECT', 1); }
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

function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, .05); lastFrame = now;
  elapsed += dt;
  if (started && !paused && game.result === 'playing') {
    let horizontal = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + joystick.x;
    let vertical = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - joystick.z;
    let x = horizontal * .759 - vertical * .651, z = -horizontal * .651 - vertical * .759;
    const length = Math.hypot(x, z); if (length > 1) { x /= length; z /= length; }
    const target = !locked && pointer ? pointer : game.enemy;
    const input = { x, z, aimX: target.x - game.player.x, aimZ: target.z - game.player.z };
    if (hitstop > 0) hitstop -= dt;
    else game.update(dt, input);
    processEvents(); updateHud();
    if (game.result !== 'playing' && !resultShown) showResult();
  }
  if (elapsed > messageUntil) $('combat-message').classList.remove('visible');
  renderer?.render(game, paused ? 0 : dt, elapsed);
  requestAnimationFrame(frame);
}
window.addEventListener('resize', () => renderer?.resize());
document.querySelector('.brand')?.addEventListener('click', event => { event.preventDefault(); returnToMenu(); });
updateHud();
requestAnimationFrame(frame);

// Read-only QA snapshot: tests observe the same model used by the live game.
Object.defineProperty(window, '__THOUSAND_FORMS__', { value: {
  snapshot: () => ({ started, paused, mode: game.mode, result: game.result, phase: game.phase,
    player: { ...game.player }, enemy: { ...game.enemy }, time: game.time }),
}, writable: false });
