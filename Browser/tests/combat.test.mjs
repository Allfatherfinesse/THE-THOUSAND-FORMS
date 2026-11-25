import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, STYLES } from '../dist/combat.js';

const FRAME = 1 / 120;
function advance(game, seconds, input = {}) {
  for (let i = 0; i < Math.ceil(seconds / FRAME); i++) game.update(FRAME, input);
}
function isolated(mode = 'sparring', distance = 1.4) {
  const game = new Game(mode);
  game.aiEnabled = false;
  game.player.x = 0; game.player.z = 0;
  game.enemy.x = 0; game.enemy.z = -distance;
  return game;
}
function enemyWindup(mode = 'sparring') {
  const game = isolated(mode);
  game.aiEnabled = true;
  for (let i = 0; i < 240 && game.enemy.state !== 'windup'; i++) game.update(FRAME);
  assert.equal(game.enemy.state, 'windup');
  game.aiEnabled = false;
  game.drainEvents();
  return game;
}
const near = (actual, expected, tolerance = .01) => assert.ok(Math.abs(actual - expected) < tolerance,
  `${actual} should be within ${tolerance} of ${expected}`);

test('three distinct playable styles have useful speed, range and posture differences', () => {
  assert.equal(STYLES.length, 3);
  assert.ok(STYLES[1].light.windup < STYLES[0].light.windup);
  assert.ok(STYLES[2].light.range > STYLES[0].light.range);
  assert.ok(STYLES[0].heavy.posture > STYLES[1].heavy.posture);
  for (let style = 0; style < 3; style++) {
    const game = isolated();
    game.player.style = style;
    assert.equal(game.action('light'), true);
    assert.equal(game.player.state, 'windup');
    advance(game, 1.2);
    assert.equal(game.player.state, 'idle');
    assert.ok(game.enemy.health < game.enemy.maxHealth);
  }
});

test('each swing resolves one hit per target, even while overlapping for many frames', () => {
  const game = isolated();
  game.action('heavy');
  advance(game, 1);
  const hits = game.drainEvents().filter(event => event.type === 'hit');
  assert.equal(hits.length, 1);
  near(game.enemy.health, 100 - STYLES[0].heavy.damage);
  game.action('heavy');
  advance(game, 1);
  assert.equal(game.drainEvents().filter(event => event.type === 'hit').length, 1);
});

test('out-of-range and backward-facing attacks miss', () => {
  const distant = isolated('sparring', 5);
  distant.action('heavy');
  advance(distant, 1);
  assert.equal(distant.enemy.health, 100);
  const backward = isolated();
  backward.action('light');
  advance(backward, .8, { aimX: 0, aimZ: 1 });
  assert.equal(backward.enemy.health, 100);
});

test('late input buffer executes once; old buffered inputs expire', () => {
  const game = isolated('sparring', 7);
  game.action('light');
  advance(game, .36);
  const before = game.player.stamina;
  assert.equal(game.action('heavy'), true);
  assert.equal(game.player.stamina, before);
  advance(game, .2);
  assert.equal(game.player.state, 'windup');
  assert.equal(game.player.attack.kind, 'heavy');
  assert.equal(game.player.attackSequence, 2);
  advance(game, 2);
  assert.equal(game.player.attackSequence, 2);

  const early = isolated('sparring', 7);
  early.action('heavy');
  early.action('light');
  advance(early, 1.5);
  assert.equal(early.player.attackSequence, 1);
  assert.equal(early.player.buffer, null);
});

test('stamina prevents endless dodge and recovers without going negative', () => {
  const game = isolated('sparring', 7);
  for (let i = 0; i < 5; i++) { assert.equal(game.action('evade'), true); advance(game, .45); }
  assert.equal(game.action('evade'), false);
  assert.ok(game.player.stamina >= 0);
  advance(game, 4);
  near(game.player.stamina, 100);
  assert.equal(game.action('evade'), true);
});

test('guard blocks damage and builds posture; last-moment guard deflects', () => {
  const block = enemyWindup();
  block.setGuard(true);
  advance(block, .9);
  assert.equal(block.player.health, 100);
  assert.ok(block.player.posture > 0);
  assert.ok(block.drainEvents().some(event => event.type === 'block'));

  const deflect = enemyWindup();
  advance(deflect, deflect.enemy.stateDuration - deflect.enemy.stateTime - .08);
  deflect.setGuard(true);
  advance(deflect, .13);
  assert.equal(deflect.player.health, 100);
  assert.equal(deflect.enemy.state, 'stun');
  assert.ok(deflect.drainEvents().some(event => event.type === 'deflect'));
});

test('rapid guard release and re-press cannot reset its deflect window', () => {
  const game = enemyWindup();
  advance(game, game.enemy.stateDuration - game.enemy.stateTime - .25);
  game.setGuard(true);
  advance(game, .12);
  game.setGuard(false);
  game.setGuard(true);
  advance(game, .2);
  const events = game.drainEvents();
  assert.ok(events.some(event => event.type === 'block'));
  assert.equal(events.some(event => event.type === 'deflect'), false);
});

test('holding guard through stun records intent and enters guard only after recovery', () => {
  const game = enemyWindup();
  advance(game, game.enemy.stateDuration - game.enemy.stateTime + .01);
  assert.equal(game.player.state, 'stun');
  game.setGuard(true);
  assert.equal(game.player.state, 'stun');
  advance(game, .3);
  assert.equal(game.player.state, 'guard');
});

test('evade moves immediately, has a bounded invulnerability window and finishes', () => {
  const game = isolated('sparring', 7);
  game.update(FRAME, { x: 1, z: 0 });
  game.action('evade');
  const before = game.player.x;
  assert.equal(game.player.invulnerable, false);
  advance(game, .05);
  assert.ok(game.player.x > before + .2);
  assert.equal(game.player.invulnerable, true);
  advance(game, .28);
  assert.equal(game.player.invulnerable, false);
  advance(game, .15);
  assert.equal(game.player.state, 'idle');
});

test('posture break has a finite punish window; repeated impacts do not restart it', () => {
  const game = isolated('boss');
  game.enemy.posture = game.enemy.maxPosture - 1;
  game.action('light');
  advance(game, .2);
  assert.equal(game.enemy.state, 'broken');
  const remaining = game.enemy.stateDuration - game.enemy.stateTime;
  advance(game, .35);
  game.action('light');
  advance(game, .2);
  assert.equal(game.enemy.state, 'broken');
  assert.ok(game.enemy.stateDuration - game.enemy.stateTime < remaining - .4);
  advance(game, 1.2);
  assert.equal(game.enemy.state, 'idle');
  assert.ok(game.enemy.posture < game.enemy.maxPosture);
});

test('style commits after transition; hybrid borrows selected moves without switching stance', () => {
  const game = isolated('sparring', 7);
  assert.equal(game.action('style', 2), true);
  assert.equal(game.player.style, 0);
  advance(game, .15);
  assert.equal(game.player.style, 2);
  game.setHybridStyle(1);
  assert.equal(game.action('hybrid'), true);
  assert.equal(game.player.attack.style, 1);
  assert.equal(game.player.attack.kind, 'hybrid');
  advance(game, 1);
  assert.equal(game.player.style, 2);
  assert.equal(game.player.state, 'idle');
  assert.equal(game.action('style', -1), false);
});

test('enemy gives a visible windup and locks aim before contact', () => {
  const game = enemyWindup();
  assert.ok(game.enemy.attack.windup >= .65);
  advance(game, game.enemy.stateDuration * .72);
  const yaw = game.enemy.yaw;
  game.aiEnabled = true;
  game.player.x += 2;
  advance(game, .1);
  near(game.enemy.yaw, yaw);
});

test('boss armor protects telegraph from light-hit interruption but posture can break it', () => {
  const game = enemyWindup('boss');
  const before = game.enemy.health;
  game.action('light');
  advance(game, .2);
  assert.ok(game.enemy.health < before);
  assert.equal(game.enemy.state, 'windup');
  assert.equal(game.enemy.armored, true);
  game.enemy.posture = game.enemy.maxPosture - 1;
  advance(game, .24);
  game.action('light');
  advance(game, .24);
  assert.equal(game.enemy.state, 'broken');
});

test('boss phase changes once at half health and does not shorten an in-flight tell', () => {
  const game = enemyWindup('boss');
  const duration = game.enemy.stateDuration;
  game.enemy.health = 125;
  game.update(FRAME);
  assert.equal(game.phase, 2);
  assert.equal(game.enemy.stateDuration, duration);
  assert.equal(game.drainEvents().filter(event => event.type === 'phase').length, 1);
  advance(game, .1);
  assert.equal(game.drainEvents().filter(event => event.type === 'phase').length, 0);
});

test('victory and defeat stop combat; reset restores the entire loop', () => {
  const win = isolated();
  win.enemy.health = 8;
  win.action('light');
  advance(win, .3);
  assert.equal(win.result, 'won');
  assert.equal(win.enemy.state, 'dead');
  assert.equal(win.drainEvents().filter(event => event.type === 'win').length, 1);
  assert.equal(win.action('heavy'), false);
  win.reset('boss');
  assert.equal(win.result, 'playing');
  assert.equal(win.enemy.health, 250);
  assert.equal(win.player.health, 100);
  assert.equal(win.phase, 1);
  assert.equal(win.events.length, 0);

  const loss = enemyWindup();
  loss.player.health = 1;
  advance(loss, 1);
  assert.equal(loss.result, 'lost');
  assert.equal(loss.player.state, 'dead');
  assert.equal(loss.drainEvents().filter(event => event.type === 'lose').length, 1);
});

test('fixed-step gameplay matches across 30Hz and 120Hz frame delivery', () => {
  const slow = new Game('boss');
  const fast = new Game('boss');
  for (let i = 0; i < 90; i++) slow.update(1 / 30, { x: .25, z: -.5 });
  for (let i = 0; i < 360; i++) fast.update(1 / 120, { x: .25, z: -.5 });
  for (const name of ['player', 'enemy']) {
    near(slow[name].x, fast[name].x, .00001);
    near(slow[name].z, fast[name].z, .00001);
    near(slow[name].health, fast[name].health, .00001);
    for (const field of ['vx', 'vz', 'speed', 'movePhase', 'weightShift']) near(slow[name][field], fast[name][field], .00001);
    assert.equal(slow[name].comboIndex, fast[name].comboIndex);
    assert.equal(slow[name].state, fast[name].state);
  }
});

test('arena bounds, invalid time and large resumed frames stay safe', () => {
  const game = isolated('sparring', 7);
  game.update(NaN);
  game.update(-1);
  assert.equal(game.time, 0);
  game.update(100);
  assert.ok(game.time <= .101);
  advance(game, 8, { x: 1, z: 1 });
  assert.ok(Math.hypot(game.player.x, game.player.z) <= game.arenaRadius - game.player.radius + .001);
  assert.ok(Number.isFinite(game.player.x));
});

test('a normal unguarded opponent fight ends rather than entering a stuck combat state', () => {
  const game = new Game('sparring');
  advance(game, 60);
  assert.equal(game.result, 'lost');
  assert.equal(game.player.health, 0);
  assert.equal(game.player.state, 'dead');
});

test('both encounters are winnable with visible tells and recovery punishments', () => {
  for (const mode of ['sparring', 'boss']) {
    const game = new Game(mode);
    for (let frame = 0; frame < 120 * 60 && game.result === 'playing'; frame++) {
      const dx = game.enemy.x - game.player.x, dz = game.enemy.z - game.player.z;
      const distance = Math.hypot(dx, dz);
      const lateTell = game.enemy.state === 'windup'
        && game.enemy.stateDuration - game.enemy.stateTime < .12;
      game.setGuard(lateTell);
      if (['idle', 'guard'].includes(game.player.state) && distance < 1.8
          && ['idle', 'stun', 'recovery', 'broken'].includes(game.enemy.state)) game.action('heavy');
      game.update(FRAME, { x: distance > 1.6 ? dx / distance : 0, z: distance > 1.6 ? dz / distance : 0 });
    }
    assert.equal(game.result, 'won', `${mode} should be winnable`);
    assert.ok(game.player.health > 0);
    if (mode === 'boss') assert.equal(game.phase, 2);
  }
});

test('locomotion accelerates responsively and brakes to a planted stop', () => {
  const game = isolated('sparring', 7);
  game.update(FRAME, { x: 1, z: 0 });
  assert.ok(game.player.speed > 0 && game.player.speed < 1);
  advance(game, .15, { x: 1, z: 0 });
  near(game.player.speed, 4.3);
  const phase = game.player.movePhase;
  const position = game.player.x;
  game.update(FRAME);
  assert.ok(game.player.speed > 0 && game.player.speed < 4.3);
  advance(game, .12);
  near(game.player.speed, 0, .00001);
  assert.ok(game.player.x - position < .20);
  assert.ok(game.player.movePhase > phase);
  const stoppedPhase = game.player.movePhase;
  advance(game, .2);
  near(game.player.movePhase, stoppedPhase, .00001);
});

test('enemy circles at useful range and creates space when crowded', () => {
  const circle = isolated('sparring', 1.6);
  circle.aiEnabled = true;
  advance(circle, .55);
  assert.equal(circle.enemy.state, 'idle');
  assert.equal(circle.enemy.footwork, 'circle');
  assert.ok(Math.abs(circle.enemy.x) > .15);
  const range = Math.hypot(circle.enemy.x - circle.player.x, circle.enemy.z - circle.player.z);
  assert.ok(range > 1.3 && range < 1.9);

  const crowded = isolated('sparring', .95);
  crowded.aiEnabled = true;
  advance(crowded, .25);
  assert.equal(crowded.enemy.footwork, 'retreat');
  assert.ok(Math.hypot(crowded.enemy.x - crowded.player.x, crowded.enemy.z - crowded.player.z) > 1.1);
});

test('committed attacks plant lateral movement and transfer weight without pushing the target', () => {
  const planted = isolated('sparring', 7);
  planted.action('heavy');
  while (planted.player.state !== 'active') planted.update(FRAME);
  const x = planted.player.x;
  const phase = planted.player.movePhase;
  advance(planted, .12, { x: 1, z: 0 });
  near(planted.player.x, x, .00001);
  near(planted.player.movePhase, phase, .00001);
  near(planted.player.weightShift, 1);

  const close = isolated('sparring', .98);
  const targetX = close.enemy.x, targetZ = close.enemy.z;
  close.action('heavy');
  advance(close, .6);
  near(close.enemy.x, targetX, .00001);
  near(close.enemy.z, targetZ, .00001);
  assert.ok(Math.hypot(close.enemy.x - close.player.x, close.enemy.z - close.player.z) >= .899);
  assert.ok(close.player.z < 0);
});

test('a followup joins late recovery with one stamina charge and a continuous combo identity', () => {
  const game = isolated('sparring', 7);
  game.action('light');
  advance(game, .30);
  assert.equal(game.player.state, 'recovery');
  assert.equal(game.action('heavy'), true);
  advance(game, .16);
  assert.equal(game.player.state, 'windup');
  assert.equal(game.player.attack.kind, 'heavy');
  assert.equal(game.player.comboIndex, 1);
  assert.equal(game.player.attack.comboIndex, 1);
  assert.equal(game.player.attackSequence, 2);
  near(game.player.stamina, 100 - STYLES[0].light.cost - STYLES[0].heavy.cost);
  const attacks = game.drainEvents().filter(event => event.type === 'attack');
  assert.deepEqual(attacks.map(event => event.comboIndex), [0, 1]);
  advance(game, 2);
  game.action('light');
  assert.equal(game.player.comboIndex, 0);
});

test('late stagger input is forgiving without shortening the stagger', () => {
  const game = enemyWindup();
  advance(game, game.enemy.stateDuration - game.enemy.stateTime + .01);
  assert.equal(game.player.state, 'stun');
  assert.equal(game.action('light'), false);
  advance(game, .10);
  assert.equal(game.action('light'), true);
  advance(game, .10);
  assert.equal(game.player.state, 'stun');
  advance(game, .08);
  assert.equal(game.player.state, 'windup');
  assert.equal(game.player.attackSequence, 1);
});

test('defensive inputs can use late attack recovery but never cancel its active frames', () => {
  const game = isolated('sparring', 7);
  game.action('heavy');
  advance(game, .35);
  assert.equal(game.player.state, 'active');
  game.setGuard(true);
  advance(game, .10);
  assert.equal(game.player.state, 'active');
  advance(game, .41);
  assert.equal(game.player.state, 'guard');
});

test('new motion and combo fields reset with the encounter', () => {
  const game = isolated('sparring', 7);
  advance(game, .2, { x: 1, z: 0 });
  game.action('heavy');
  advance(game, .3);
  assert.ok(game.player.weightShift > 0);
  game.reset('boss');
  for (const fighter of [game.player, game.enemy]) {
    for (const field of ['vx', 'vz', 'speed', 'movePhase', 'weightShift', 'comboIndex', 'sprintBlend']) assert.equal(fighter[field], 0);
    assert.equal(fighter.sprinting, false);
    assert.equal(fighter.sprintExhausted, false);
    assert.equal(fighter.footwork, 'idle');
  }
});

test('held sprint ramps smoothly to a useful speed for every style', () => {
  for (let style = 0; style < 3; style++) {
    const game = isolated('sparring', 7);
    game.player.style = style;
    game.update(FRAME, { x: 1, z: 0, sprint: true });
    assert.equal(game.player.sprinting, true);
    assert.ok(game.player.speed > 0 && game.player.speed < 1);
    assert.ok(game.player.sprintBlend > 0 && game.player.sprintBlend < 1);
    advance(game, .35, { x: 1, z: 0, sprint: true });
    near(game.player.speed, (style === 2 ? 4.65 : 4.3) * 1.6);
    near(game.player.sprintBlend, 1);
    assert.equal(game.player.state, 'idle');
  }
});

test('sprint drains stamina only during motion and never while still or against a wall', () => {
  const game = isolated('sparring', 7);
  advance(game, .5, { sprint: true });
  assert.equal(game.player.sprinting, false);
  near(game.player.stamina, 100);
  advance(game, .5, { x: 1, z: 0, sprint: true });
  near(game.player.stamina, 91);
  assert.equal(game.player.sprinting, true);

  const blocked = isolated('sparring', 7);
  blocked.player.x = blocked.arenaRadius - blocked.player.radius;
  advance(blocked, .5, { x: 1, z: 0, sprint: true });
  assert.equal(blocked.player.sprinting, false);
  near(blocked.player.stamina, 100);
  near(blocked.player.sprintBlend, 0);
  near(blocked.player.speed, 0);
});

test('diagonal sprint is normalized to the same speed and stamina cost', () => {
  const straight = isolated('sparring', 7), diagonal = isolated('sparring', 7);
  advance(straight, .6, { x: 1, z: 0, sprint: true });
  advance(diagonal, .6, { x: 1, z: 1, sprint: true });
  near(diagonal.player.speed, straight.player.speed, .00001);
  near(Math.hypot(diagonal.player.x, diagonal.player.z), straight.player.x, .00001);
  near(diagonal.player.stamina, straight.player.stamina, .00001);
});

test('releasing sprint eases into running and reversing direction remains responsive', () => {
  const game = isolated('sparring', 7);
  advance(game, .3, { x: 1, z: 0, sprint: true });
  const speed = game.player.speed, stamina = game.player.stamina;
  game.update(FRAME, { x: 1, z: 0 });
  assert.equal(game.player.sprinting, false);
  assert.ok(game.player.speed < speed && game.player.speed > 4.3);
  assert.ok(game.player.sprintBlend > 0 && game.player.sprintBlend < 1);
  near(game.player.stamina, stamina);
  advance(game, .2, { x: 1, z: 0 });
  near(game.player.speed, 4.3);
  near(game.player.sprintBlend, 0);

  advance(game, .3, { x: 1, z: 0, sprint: true });
  advance(game, .2, { x: -1, z: 0, sprint: true });
  assert.ok(game.player.vx < -6);
  advance(game, .2);
  near(game.player.speed, 0);
  near(game.player.sprintBlend, 0);
});

test('guard, attacks and dodges interrupt sprint immediately without extra sprint drain', () => {
  for (const action of ['guard', 'light', 'evade', 'style']) {
    const game = isolated('sparring', 7);
    advance(game, .25, { x: 1, z: 0, sprint: true });
    assert.equal(game.player.sprinting, true);
    if (action === 'guard') game.setGuard(true);
    else assert.equal(game.action(action), true);
    assert.equal(game.player.sprinting, false);
    const paid = game.player.stamina;
    advance(game, .10, { x: 1, z: 0, sprint: true });
    assert.equal(game.player.sprinting, false);
    near(game.player.stamina, paid);
    if (action === 'guard') assert.ok(game.player.speed <= 4.3 * .45 + .01);
    if (action === 'evade') {
      assert.equal(game.player.state, 'evade');
      assert.equal(game.player.invulnerable, true);
    }
  }
});

test('sprint resumes after an action only while its hold remains active', () => {
  const held = isolated('sparring', 7);
  held.setInput({ x: 1, z: 0, sprint: true });
  held.action('evade');
  advance(held, .6, { x: 1, z: 0, sprint: true });
  assert.equal(held.player.sprinting, true);
  assert.equal(held.player.state, 'idle');

  const released = isolated('sparring', 7);
  released.setInput({ x: 1, z: 0, sprint: true });
  released.action('evade');
  advance(released, .6, { x: 1, z: 0 });
  assert.equal(released.player.sprinting, false);
  near(released.player.speed, 4.3);
});

test('releasing all input clears paused sprint presentation without advancing simulation', () => {
  const game = isolated('sparring', 7);
  advance(game, .25, { x: 1, z: 0, sprint: true });
  assert.equal(game.player.sprinting, true);
  const time = game.time, stamina = game.player.stamina, position = game.player.x;
  game.setInput({ x: 0, z: 0, sprint: false });
  assert.equal(game.player.sprinting, false);
  assert.equal(game.player.sprintBlend, 0);
  assert.equal(game.time, time);
  assert.equal(game.player.stamina, stamina);
  assert.equal(game.player.x, position);
});

test('exhaustion keeps sprint off until a meaningful stamina reserve recovers', () => {
  const game = isolated('sparring', 7);
  game.arenaRadius = 100;
  game.player.stamina = 6;
  advance(game, .4, { x: 1, z: 0, sprint: true });
  assert.equal(game.player.sprintExhausted, true);
  assert.equal(game.player.sprinting, false);
  near(game.player.stamina, 0);
  advance(game, .8, { x: 1, z: 0, sprint: true });
  assert.ok(game.player.stamina > 0 && game.player.stamina < 20);
  assert.equal(game.player.sprinting, false);
  assert.equal(game.player.sprintExhausted, true);
  advance(game, .4, { x: 1, z: 0, sprint: true });
  assert.equal(game.player.sprintExhausted, false);
  assert.equal(game.player.sprinting, true);
  assert.ok(game.player.stamina > 0);
});

test('sprint speed, exhaustion and transitions are fixed-step deterministic', () => {
  const slow = isolated('sparring', 7), fast = isolated('sparring', 7);
  slow.arenaRadius = fast.arenaRadius = 100;
  slow.player.stamina = fast.player.stamina = 16;
  for (let frame = 0; frame < 120; frame++) {
    const input = { x: frame < 60 ? 1 : -1, z: .2, sprint: frame < 90 };
    slow.update(1 / 30, input);
    for (let substep = 0; substep < 4; substep++) fast.update(FRAME, input);
  }
  for (const field of ['x', 'z', 'vx', 'vz', 'speed', 'movePhase', 'stamina', 'sprintBlend'])
    near(slow.player[field], fast.player[field], .00001);
  assert.equal(slow.player.sprinting, fast.player.sprinting);
  assert.equal(slow.player.sprintExhausted, fast.player.sprintExhausted);
});

test('render interpolation advances both actors between fixed simulation steps', () => {
  const game = new Game();
  advance(game, .25, { x: 1, z: 0 });
  const view = game.getRenderState();
  let betweenSteps = 0;
  for (let frame = 0; frame < 16; frame++) {
    const rawPlayerX = game.player.x, rawEnemyZ = game.enemy.z;
    const playerX = view.player.x, playerZ = view.player.z;
    const enemyX = view.enemy.x, enemyZ = view.enemy.z;
    game.update(FRAME / 4, { x: 1, z: 0 });
    assert.equal(game.getRenderState(), view, 'Reuse the sampled world object');
    if (game.player.x === rawPlayerX && game.enemy.z === rawEnemyZ) {
      betweenSteps++;
      assert.ok(Math.hypot(view.player.x - playerX, view.player.z - playerZ) > .0001);
      assert.ok(Math.hypot(view.enemy.x - enemyX, view.enemy.z - enemyZ) > .0001);
    }
    assert.ok(view.alpha >= 0 && view.alpha <= 1);
    assert.ok(view.player.x <= game.player.x + 1e-8);
    assert.ok(game.player.x - view.player.x < 4.3 * FRAME + .001);
  }
  assert.ok(betweenSteps >= 10, 'Exercise high-refresh frames with no simulation tick');
});

test('stable render views inherit live combat clocks without mutating authoritative snapshots', () => {
  const game = isolated('sparring', 7);
  advance(game, .2, { x: 1, z: 0 });
  const first = game.getRenderState(), playerView = first.player, enemyView = first.enemy;
  assert.notEqual(playerView, game.player);
  game.action('heavy');
  game.update(FRAME / 2);
  const before = { x: game.player.x, z: game.player.z, yaw: game.player.yaw,
    time: game.time, stateTime: game.player.stateTime, stamina: game.player.stamina };
  const next = game.getRenderState();
  assert.equal(next.player, playerView);
  assert.equal(next.enemy, enemyView);
  assert.equal(playerView.state, game.player.state);
  assert.equal(playerView.stateTime, game.player.stateTime);
  assert.equal(playerView.attack, game.player.attack);
  assert.deepEqual({ x: game.player.x, z: game.player.z, yaw: game.player.yaw,
    time: game.time, stateTime: game.player.stateTime, stamina: game.player.stamina }, before);
});

test('render reset and direct camera placements snap both histories and preserve encounter identity', () => {
  const game = isolated('sparring', 7);
  advance(game, .2, { x: 1, z: 0 });
  const before = game.getRenderState(), oldPlayer = before.player;
  game.player.x = 8.4; game.player.z = 0; game.player.yaw = .7;
  game.enemy.x = 6.7; game.enemy.z = 0;
  const placed = game.getRenderState();
  assert.equal(placed.player, oldPlayer, 'Placement does not restart the animation rig');
  near(placed.player.x, 8.4, .00001);
  near(placed.player.z, 0, .00001);
  near(placed.player.yaw, .7, .00001);
  near(placed.enemy.x, 6.7, .00001);
  game.update(FRAME / 4);
  near(game.getRenderState().player.x, 8.4, .00001);

  game.reset('boss');
  const fresh = game.getRenderState();
  assert.notEqual(fresh, before);
  assert.notEqual(fresh.player, oldPlayer, 'A new encounter resets fighter-motion identity');
  assert.equal(fresh.player.x, game.player.x);
  assert.equal(fresh.player.z, game.player.z);
  assert.equal(fresh.enemy.health, 250);
  assert.equal(fresh.alpha, 0);
});

test('render yaw follows the short arc across the angle seam', () => {
  const game = isolated('sparring', 7);
  game.player.yaw = Math.PI - .01;
  game.getRenderState();
  const desiredYaw = -Math.PI + .02;
  const input = { aimX: Math.sin(desiredYaw), aimZ: Math.cos(desiredYaw) };
  game.update(FRAME, input);
  game.update(FRAME / 2, input);
  assert.ok(Math.abs(game.getRenderState().player.yaw) > 3.1);
});

test('terminal presentation uses the final authoritative position', () => {
  const game = isolated();
  game.enemy.health = 1;
  game.action('light');
  advance(game, .2);
  assert.equal(game.result, 'won');
  const view = game.getRenderState();
  assert.equal(view.alpha, 1);
  near(view.player.x, game.player.x, .00001);
  near(view.player.z, game.player.z, .00001);
  assert.equal(view.enemy.state, 'dead');
});
