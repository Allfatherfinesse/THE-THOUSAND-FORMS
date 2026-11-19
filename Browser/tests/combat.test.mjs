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
