// Fictionalized combat tuning for a browser prototype; no real-world efficacy claims.
const TAU = Math.PI * 2;
const STEP = 1 / 120;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const angleDelta = (a, b) => ((a - b + Math.PI * 3) % TAU) - Math.PI;
const ready = fighter => fighter.state === 'idle' || fighter.state === 'guard';
const attack = (name, windup, active, recovery, cost, damage, posture, range, arc, lunge = .25) =>
  ({ name, windup, active, recovery, cost, damage, posture, range, arc, lunge, sweep: false });

export const STYLES = [
  {
    id: 'muay-thai', name: 'Muay Thai', color: '#efb66a', description: 'Pressure · posture damage',
    light: attack('Ember palm', .14, .13, .24, 12, 14, 24, 1.85, 1.65, .42),
    heavy: attack('Mountain elbow', .34, .18, .38, 24, 27, 43, 2.05, 1.85, .56),
  },
  {
    id: 'wing-chun', name: 'Wing Chun', color: '#72d6c9', description: 'Quick hands · wider deflect window',
    light: attack('River palm', .09, .10, .17, 9, 10, 14, 1.70, 1.45, .32),
    heavy: attack('Unbroken line', .25, .14, .28, 20, 21, 30, 1.85, 1.40, .52),
  },
  {
    id: 'taekwondo', name: 'Taekwondo', color: '#a8a2f2', description: 'Long reach · mobile footwork',
    light: attack('Crescent kick', .22, .14, .29, 15, 18, 19, 2.55, 1.70, .30),
    heavy: attack('Falling star', .43, .18, .43, 27, 32, 34, 2.85, 1.60, .38),
  },
];

const ENEMY_ATTACKS = {
  sparring: [
    { ...attack('Measured palm', .72, .16, .62, 10, 10, 17, 2.0, 1.55, .30), kind: 'light', style: 1 },
    { ...attack('Rising step', .94, .20, .80, 16, 18, 27, 2.45, 1.60, .35), kind: 'heavy', style: 2 },
    { ...attack('Measured palm', .72, .16, .62, 10, 10, 17, 2.0, 1.55, .30), kind: 'light', style: 1 },
  ],
  boss: [
    { ...attack('Sweeping crescent', .95, .24, .88, 15, 18, 27, 2.80, Math.PI * 1.65, .15), kind: 'sweep', style: 2, sweep: true },
    { ...attack('Falling bell', 1.05, .20, .95, 18, 25, 38, 2.65, 1.3, .55), kind: 'heavy', style: 0 },
    { ...attack('Ashen step', .68, .16, .55, 12, 13, 20, 2.25, 1.55, .40), kind: 'light', style: 1 },
  ],
};

function makeFighter(id, x, z, health, posture, style) {
  return {
    id, x, z, yaw: id === 'player' ? Math.PI : 0, radius: .42,
    health, maxHealth: health, stamina: 100, maxStamina: 100, posture: 0, maxPosture: posture,
    style, hybridStyle: (style + 1) % 3,
    state: 'idle', stateTime: 0, stateDuration: 0, attack: null,
    attackTime: 0, attackDuration: 0, invulnerable: false, armored: false,
    guardHeld: false, guardEligible: false, guardCooldown: 0,
    staminaDelay: 0, postureDelay: 0, buffer: null, attackSequence: 0,
    hitTargets: new Set(), dodgeX: 0, dodgeZ: 0, pendingStyle: style,
  };
}

export class Game {
  constructor(mode = 'sparring') { this.reset(mode); }

  reset(mode = this.mode ?? 'sparring') {
    this.mode = mode === 'boss' ? 'boss' : 'sparring';
    this.player = makeFighter('player', 0, 3, 100, 100, 0);
    this.enemy = makeFighter('enemy', 0, -3, this.mode === 'boss' ? 250 : 100,
      this.mode === 'boss' ? 120 : 85, this.mode === 'boss' ? 2 : 1);
    this.arenaRadius = 9;
    this.result = 'playing';
    this.phase = 1;
    this.time = 0;
    this.events = [];
    this.aiEnabled = true; // Also permits deterministic isolated combat tests.
    this._accumulator = 0;
    this._aiCooldown = 1.0;
    this._aiStep = 0;
    this._input = { x: 0, z: 0 };
    return this;
  }

  drainEvents() { return this.events.splice(0); }

  action(name, value) {
    if (this.result !== 'playing' || this.player.state === 'dead') return false;
    if (!['light', 'heavy', 'evade', 'style', 'hybrid'].includes(name)) return false;
    const fighter = this.player;
    const targetStyle = name === 'style'
      ? (Number.isInteger(value) ? value : ((fighter.state === 'switch' ? fighter.pendingStyle : fighter.style) + 1) % 3)
      : undefined;
    if (name === 'style' && (targetStyle < 0 || targetStyle > 2 || targetStyle === fighter.style)) return false;
    if (ready(fighter)) return this._startAction(fighter, name, targetStyle);
    if (fighter.state === 'stun' || fighter.state === 'broken') return false;
    fighter.buffer = { name, targetStyle, expires: this.time + .24 };
    return true;
  }

  setGuard(held) {
    const fighter = this.player;
    fighter.guardHeld = Boolean(held) && this.result === 'playing';
    if (fighter.guardHeld && fighter.state === 'idle') this._enter(fighter, 'guard');
    if (!fighter.guardHeld && fighter.state === 'guard') this._enter(fighter, 'idle');
  }

  setHybridStyle(index) {
    if (Number.isInteger(index) && index >= 0 && index < 3) this.player.hybridStyle = index;
  }

  update(dt, input = {}) {
    if (!Number.isFinite(dt) || dt <= 0 || this.result !== 'playing') return;
    this._input = {
      x: Number.isFinite(input.x) ? input.x : 0, z: Number.isFinite(input.z) ? input.z : 0,
      aimX: Number.isFinite(input.aimX) ? input.aimX : undefined,
      aimZ: Number.isFinite(input.aimZ) ? input.aimZ : undefined,
    };
    // Tab resumes never fast-forward an unseen enemy attack.
    this._accumulator += Math.min(dt, .10);
    while (this._accumulator + 1e-9 >= STEP && this.result === 'playing') {
      this._accumulator -= STEP;
      this._step(STEP);
    }
  }

  _event(type, actor, data = {}) {
    this.events.push({ type, actor: actor.id, x: actor.x, z: actor.z, ...data });
  }

  _enter(fighter, state, duration = 0) {
    fighter.state = state;
    fighter.stateTime = 0;
    fighter.stateDuration = duration;
    fighter.invulnerable = false;
    fighter.armored = this.mode === 'boss' && fighter.id === 'enemy' && (state === 'windup' || state === 'active');
    if (state === 'guard') {
      fighter.guardEligible = fighter.guardCooldown <= 0;
      if (fighter.guardEligible) fighter.guardCooldown = .38;
    }
    if (state === 'idle' || state === 'guard') {
      fighter.attack = null;
      fighter.attackTime = 0;
      fighter.attackDuration = 0;
    }
  }

  _spend(fighter, amount) {
    fighter.stamina = Math.max(0, fighter.stamina - amount);
    fighter.staminaDelay = .50;
  }

  _startAction(fighter, name, targetStyle) {
    if (name === 'style') {
      if (fighter.stamina < 5 || targetStyle === fighter.style) return false;
      this._spend(fighter, 5);
      fighter.pendingStyle = targetStyle;
      this._enter(fighter, 'switch', .14);
      return true;
    }
    if (name === 'evade') {
      if (fighter.stamina < 18) return false;
      this._spend(fighter, 18);
      const length = Math.hypot(this._input.x, this._input.z);
      fighter.dodgeX = length > .1 ? this._input.x / length : -Math.sin(fighter.yaw);
      fighter.dodgeZ = length > .1 ? this._input.z / length : -Math.cos(fighter.yaw);
      this._enter(fighter, 'evade', .44);
      this._event('evade', fighter);
      return true;
    }
    const style = name === 'hybrid' ? fighter.hybridStyle : fighter.style;
    const spec = { ...STYLES[style][name === 'light' ? 'light' : 'heavy'], kind: name, style };
    if (name === 'hybrid') {
      spec.cost += 5;
      spec.recovery += .08;
      spec.name = `Borrowed ${spec.name.toLowerCase()}`;
    }
    return this._beginAttack(fighter, spec);
  }

  _beginAttack(fighter, spec) {
    if (fighter.stamina < spec.cost) return false;
    this._spend(fighter, spec.cost);
    fighter.attack = { ...spec };
    fighter.attackTime = 0;
    fighter.attackDuration = spec.windup + spec.active + spec.recovery;
    fighter.hitTargets.clear();
    fighter.attackSequence++;
    this._enter(fighter, 'windup', spec.windup);
    this._event('attack', fighter, { kind: spec.kind, style: spec.style, name: spec.name });
    return true;
  }

  _finish(fighter) {
    const state = fighter.state;
    if (state === 'windup') {
      this._enter(fighter, 'active', fighter.attack.active);
      this._event('strike', fighter, { kind: fighter.attack.kind, style: fighter.attack.style });
      return;
    }
    if (state === 'active') { this._enter(fighter, 'recovery', fighter.attack.recovery); return; }
    if (state === 'switch') {
      fighter.style = fighter.pendingStyle;
      this._event('style', fighter, { style: fighter.style });
    }
    if (state === 'broken') fighter.posture = fighter.maxPosture * .30;
    this._enter(fighter, 'idle');
    const buffered = fighter.buffer;
    fighter.buffer = null;
    if (buffered && buffered.expires > this.time) this._startAction(fighter, buffered.name, buffered.targetStyle);
    if (fighter.state === 'idle' && fighter.guardHeld) this._enter(fighter, 'guard');
  }

  _tickFighter(fighter, dt) {
    if (fighter.state === 'dead') return;
    fighter.guardCooldown = Math.max(0, fighter.guardCooldown - dt);
    fighter.staminaDelay = Math.max(0, fighter.staminaDelay - dt);
    fighter.postureDelay = Math.max(0, fighter.postureDelay - dt);
    if (fighter.buffer && fighter.buffer.expires <= this.time) fighter.buffer = null;
    if (ready(fighter) || fighter.state === 'recovery') {
      if (fighter.staminaDelay <= 0) {
        const rate = fighter.state === 'guard' ? 13 : 32;
        fighter.stamina = Math.min(100, fighter.stamina + rate * dt);
      }
      if (fighter.postureDelay <= 0 && fighter.state !== 'guard')
        fighter.posture = Math.max(0, fighter.posture - 15 * dt);
    }
    fighter.stateTime += dt;
    if (fighter.attack) fighter.attackTime += dt;
    if (fighter.stateDuration > 0 && fighter.stateTime + 1e-9 >= fighter.stateDuration) this._finish(fighter);
    fighter.invulnerable = fighter.state === 'evade' && fighter.stateTime >= .025 && fighter.stateTime < .30;
  }

  _move(fighter, x, z, speed, dt) {
    fighter.x += x * speed * dt;
    fighter.z += z * speed * dt;
    this._confine(fighter);
  }

  _confine(fighter) {
    const distance = Math.hypot(fighter.x, fighter.z);
    const limit = this.arenaRadius - fighter.radius;
    if (distance > limit) { fighter.x *= limit / distance; fighter.z *= limit / distance; }
  }

  _movePlayer(dt) {
    const fighter = this.player;
    if (['dead', 'stun', 'broken', 'switch'].includes(fighter.state)) return;
    if (fighter.state === 'evade') {
      this._move(fighter, fighter.dodgeX, fighter.dodgeZ, fighter.stateTime < .29 ? 8 : 3.5, dt);
      return;
    }
    const length = Math.hypot(this._input.x, this._input.z);
    const movement = Math.min(length, 1);
    let factor = 1;
    if (fighter.state === 'guard') factor = .45;
    else if (fighter.state === 'windup') factor = .28;
    else if (fighter.state === 'active') factor = .12;
    else if (fighter.state === 'recovery') factor = .55;
    if (length > 0) this._move(fighter, this._input.x / length, this._input.z / length,
      (fighter.style === 2 ? 4.65 : 4.3) * movement * factor, dt);
    if (ready(fighter) || (fighter.state === 'windup' && fighter.stateTime < fighter.stateDuration * .65)) {
      let aimX = this._input.aimX, aimZ = this._input.aimZ;
      if (aimX === undefined || aimZ === undefined || Math.hypot(aimX, aimZ) < .01) {
        aimX = this.enemy.x - fighter.x; aimZ = this.enemy.z - fighter.z;
      }
      if (Math.hypot(aimX, aimZ) > .01) fighter.yaw = Math.atan2(aimX, aimZ);
    }
  }

  _updateAI(dt) {
    if (!this.aiEnabled || this.enemy.state === 'dead') return;
    const fighter = this.enemy;
    const dx = this.player.x - fighter.x, dz = this.player.z - fighter.z;
    const distance = Math.hypot(dx, dz);
    if (ready(fighter) || (fighter.state === 'windup' && fighter.stateTime < fighter.stateDuration * .65))
      fighter.yaw = Math.atan2(dx, dz);
    if (!ready(fighter)) return;
    this._aiCooldown -= dt;
    const patterns = ENEMY_ATTACKS[this.mode];
    const spec = { ...patterns[this._aiStep % patterns.length] };
    if (this.phase === 2) { spec.windup -= .10; spec.recovery -= .06; }
    if (distance > spec.range * .78) {
      if (distance > .01) this._move(fighter, dx / distance, dz / distance, this.mode === 'boss' ? 2.25 : 1.9, dt);
      return;
    }
    if (this._aiCooldown <= 0 && this._beginAttack(fighter, spec)) {
      this._aiStep++;
      this._aiCooldown = this.mode === 'boss' ? (this.phase === 2 ? .28 : .48) : .65;
    }
  }

  _separate() {
    const dx = this.enemy.x - this.player.x, dz = this.enemy.z - this.player.z;
    const distance = Math.hypot(dx, dz), minimum = this.enemy.radius + this.player.radius;
    if (distance >= minimum) return;
    const nx = distance > .001 ? dx / distance : 1, nz = distance > .001 ? dz / distance : 0;
    const offset = (minimum - distance) / 2;
    this.player.x -= nx * offset; this.player.z -= nz * offset;
    this.enemy.x += nx * offset; this.enemy.z += nz * offset;
    this._confine(this.player); this._confine(this.enemy);
  }

  _hitCandidate(source, target) {
    if (source.state !== 'active' || source.hitTargets.has(target.id) || target.state === 'dead') return null;
    const dx = target.x - source.x, dz = target.z - source.z;
    if (Math.hypot(dx, dz) > source.attack.range + target.radius * .35) return null;
    if (Math.abs(angleDelta(Math.atan2(dx, dz), source.yaw)) > source.attack.arc / 2) return null;
    source.hitTargets.add(target.id);
    return { source, target, spec: { ...source.attack } };
  }

  _break(fighter) {
    fighter.posture = fighter.maxPosture;
    fighter.buffer = null;
    this._enter(fighter, 'broken', fighter.id === 'enemy' ? 1.45 : 1.05);
    this._event('break', fighter);
  }

  _receive({ source, target, spec }) {
    if (target.invulnerable) { this._event('miss', source, { target: target.id, reason: 'evade' }); return; }
    const incomingYaw = Math.atan2(source.x - target.x, source.z - target.z);
    const frontal = Math.abs(angleDelta(incomingYaw, target.yaw)) < Math.PI * .48;
    if (target.state === 'guard' && frontal) {
      if (target.guardEligible && target.stateTime < (target.style === 1 ? .24 : .17) && target.stamina >= 3) {
        this._spend(target, 3);
        target.posture = Math.max(0, target.posture - 12);
        source.posture = Math.min(source.maxPosture, source.posture + 32);
        source.postureDelay = 1;
        source.buffer = null;
        if (source.posture >= source.maxPosture) this._break(source);
        else this._enter(source, 'stun', .72);
        this._event('deflect', target, { target: source.id });
        return;
      }
      this._spend(target, spec.posture * .48);
      target.posture = Math.min(target.maxPosture, target.posture + spec.posture);
      target.postureDelay = 1;
      this._event('block', target, { target: source.id });
      if (target.stamina <= 0 || target.posture >= target.maxPosture) this._break(target);
      return;
    }
    const wasBroken = target.state === 'broken';
    const damage = spec.damage * (wasBroken ? 1.35 : 1);
    target.health = Math.max(0, target.health - damage);
    target.posture = Math.min(target.maxPosture, target.posture + spec.posture * .72);
    target.postureDelay = 1;
    target.buffer = null;
    if (target.health <= 0) this._enter(target, 'dead');
    else if (!wasBroken && target.posture >= target.maxPosture) this._break(target);
    else if (!wasBroken && !target.armored) this._enter(target, 'stun', target.id === 'enemy' ? .25 : .26);
    this._event('hit', source, { target: target.id, x: target.x, z: target.z, damage, kind: spec.kind, style: spec.style, armored: target.armored });
  }

  _step(dt) {
    this.time += dt;
    this._movePlayer(dt);
    this._updateAI(dt);
    this._tickFighter(this.player, dt);
    this._tickFighter(this.enemy, dt);
    for (const fighter of [this.player, this.enemy]) {
      if (fighter.state === 'active') this._move(fighter, Math.sin(fighter.yaw), Math.cos(fighter.yaw),
        fighter.attack.lunge / fighter.attack.active, dt);
    }
    this._separate();
    // Snapshot both active attacks before applying either hit, allowing fair trades.
    const hits = [this._hitCandidate(this.player, this.enemy), this._hitCandidate(this.enemy, this.player)];
    for (const hit of hits) if (hit) this._receive(hit);
    if (this.player.health <= 0 || this.enemy.health <= 0) {
      this.result = this.player.health <= 0 ? 'lost' : 'won';
      this._event(this.result === 'won' ? 'win' : 'lose', this.player);
      return;
    }
    if (this.mode === 'boss' && this.phase === 1 && this.enemy.health <= this.enemy.maxHealth * .5) {
      this.phase = 2;
      this._aiCooldown = 1.2;
      this._event('phase', this.enemy, { phase: 2 });
    }
  }
}
