// Fictionalized combat tuning for a browser prototype; no real-world efficacy claims.
const TAU = Math.PI * 2;
const STEP = 1 / 120;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const angleDelta = (a, b) => ((a - b + Math.PI * 3) % TAU) - Math.PI;
const smoothstep = value => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
const ready = fighter => fighter.state === 'idle' || fighter.state === 'guard';
const attacking = fighter => ['windup', 'active', 'recovery'].includes(fighter.state);
const strikeAction = name => ['light', 'heavy', 'hybrid'].includes(name);
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
    vx: 0, vz: 0, speed: 0, movePhase: 0, weightShift: 0, comboIndex: 0, footwork: 'idle',
    _motorX: 0, _motorZ: 0, _driveProgress: 0, _comboUntil: 0,
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
    if (fighter.state === 'broken') return false;
    // A late press survives recovery without allowing an attack to escape an
    // active hit or a fresh stagger. This is one intent, never an action queue.
    if (fighter.state === 'stun' && fighter.stateDuration - fighter.stateTime > .18) return false;
    fighter.buffer = { name, targetStyle, expires: this.time + .32 };
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

  setInput(input = {}) {
    this._input = {
      x: Number.isFinite(input.x) ? input.x : 0, z: Number.isFinite(input.z) ? input.z : 0,
      aimX: Number.isFinite(input.aimX) ? input.aimX : undefined,
      aimZ: Number.isFinite(input.aimZ) ? input.aimZ : undefined,
    };
  }

  update(dt, input = {}) {
    if (!Number.isFinite(dt) || dt <= 0 || this.result !== 'playing') return;
    this.setInput(input);
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
    if (state === 'windup') fighter.footwork = 'plant';
    else if (state === 'active' || state === 'evade') fighter.footwork = 'attack';
    else if (state === 'recovery') fighter.footwork = 'plant';
    if (['stun', 'broken', 'dead', 'evade', 'switch'].includes(state)) {
      fighter._comboUntil = 0;
      fighter.comboIndex = 0;
      fighter.weightShift = 0;
      fighter._motorX = 0;
      fighter._motorZ = 0;
    }
    if (state === 'guard') {
      fighter.guardEligible = fighter.guardCooldown <= 0;
      if (fighter.guardEligible) fighter.guardCooldown = .38;
    }
    if (state === 'idle' || state === 'guard') {
      fighter.attack = null;
      fighter.attackTime = 0;
      fighter.attackDuration = 0;
      fighter.weightShift = 0;
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
    fighter.comboIndex = fighter.attackSequence > 0 && this.time < fighter._comboUntil
      ? (fighter.comboIndex + 1) % 3 : 0;
    fighter.attack = { ...spec, comboIndex: fighter.comboIndex };
    fighter.attackTime = 0;
    fighter.attackDuration = spec.windup + spec.active + spec.recovery;
    fighter._comboUntil = this.time + fighter.attackDuration + .32;
    fighter._driveProgress = 0;
    // Plant before transferring weight: inherited running momentum must not
    // carry a committed strike sideways through its target.
    fighter._motorX *= .22;
    fighter._motorZ *= .22;
    fighter.hitTargets.clear();
    fighter.attackSequence++;
    this._enter(fighter, 'windup', spec.windup);
    this._event('attack', fighter, { kind: spec.kind, style: spec.style, name: spec.name, comboIndex: fighter.comboIndex });
    return true;
  }

  _finish(fighter) {
    const state = fighter.state;
    if (state === 'windup') {
      this._enter(fighter, 'active', fighter.attack.active);
      this._event('strike', fighter, { kind: fighter.attack.kind, style: fighter.attack.style, comboIndex: fighter.comboIndex });
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
    if (ready(fighter) && this.time >= fighter._comboUntil) fighter.comboIndex = 0;
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
    // Followups use the settling part of recovery. The strike and early recoil
    // remain committed, and every followup still pays its full stamina cost.
    if (fighter.id === 'player' && fighter.state === 'recovery') {
      const buffered = fighter.buffer;
      const fraction = fighter.stateTime / fighter.stateDuration;
      const threshold = buffered && strikeAction(buffered.name) ? .72 : .84;
      if (buffered && fraction >= threshold) {
        fighter.buffer = null;
        this._startAction(fighter, buffered.name, buffered.targetStyle);
      } else if (!buffered && fighter.guardHeld && fraction >= .84) {
        this._enter(fighter, 'guard');
      }
    }
    if (fighter.stateDuration > 0 && fighter.stateTime + 1e-9 >= fighter.stateDuration) this._finish(fighter);
    fighter.invulnerable = fighter.state === 'evade' && fighter.stateTime >= .025 && fighter.stateTime < .30;
  }

  _move(fighter, x, z, speed, dt) {
    fighter.x += x * speed * dt;
    fighter.z += z * speed * dt;
    this._confine(fighter);
  }

  _steer(fighter, targetX, targetZ, acceleration, dt, gait = false) {
    const deltaX = targetX - fighter._motorX, deltaZ = targetZ - fighter._motorZ;
    const distance = Math.hypot(deltaX, deltaZ);
    const amount = Math.min(1, acceleration * dt / Math.max(distance, 1e-8));
    fighter._motorX += deltaX * amount;
    fighter._motorZ += deltaZ * amount;
    const previousX = fighter.x, previousZ = fighter.z;
    this._move(fighter, fighter._motorX, fighter._motorZ, 1, dt);
    // Gait follows actual grounded travel, rather than input strength or wall
    // pushing. Attack drive, collisions and dodge motion never make footsteps.
    if (gait) fighter.movePhase += Math.hypot(fighter.x - previousX, fighter.z - previousZ) * 4;
  }

  _face(fighter, x, z, rate, dt) {
    if (Math.hypot(x, z) < .01) return;
    const turn = angleDelta(Math.atan2(x, z), fighter.yaw);
    const eased = turn * (1 - Math.exp(-rate * dt));
    fighter.yaw += clamp(eased, -24 * dt, 24 * dt);
    fighter.yaw = Math.atan2(Math.sin(fighter.yaw), Math.cos(fighter.yaw));
  }

  _confine(fighter) {
    const distance = Math.hypot(fighter.x, fighter.z);
    const limit = this.arenaRadius - fighter.radius;
    if (distance > limit) {
      fighter.x *= limit / distance; fighter.z *= limit / distance;
      const nx = fighter.x / limit, nz = fighter.z / limit;
      const outward = fighter._motorX * nx + fighter._motorZ * nz;
      if (outward > 0) { fighter._motorX -= outward * nx; fighter._motorZ -= outward * nz; }
    }
  }

  _movePlayer(dt) {
    const fighter = this.player;
    if (['dead', 'stun', 'broken', 'switch'].includes(fighter.state)) { fighter.footwork = 'idle'; return; }
    if (fighter.state === 'evade') {
      const speed = 8 * (1 - .75 * smoothstep((fighter.stateTime - .22) / .22));
      this._move(fighter, fighter.dodgeX, fighter.dodgeZ, speed, dt);
      return;
    }
    const length = Math.hypot(this._input.x, this._input.z);
    const movement = Math.min(length, 1);
    let factor = 1;
    if (fighter.state === 'guard') factor = .45;
    else if (fighter.state === 'windup') factor = .18 * (1 - smoothstep(fighter.stateTime / (fighter.stateDuration * .55)));
    else if (fighter.state === 'active') factor = 0;
    else if (fighter.state === 'recovery') factor = .65 * smoothstep((fighter.stateTime / fighter.stateDuration - .45) / .55);
    const desiredSpeed = (fighter.style === 2 ? 4.65 : 4.3) * movement * factor;
    const targetX = length > 0 ? this._input.x / length * desiredSpeed : 0;
    const targetZ = length > 0 ? this._input.z / length * desiredSpeed : 0;
    const braking = desiredSpeed < Math.hypot(fighter._motorX, fighter._motorZ)
      || targetX * fighter._motorX + targetZ * fighter._motorZ < 0;
    const gait = ready(fighter) || (fighter.state === 'recovery' && factor > .15);
    this._steer(fighter, targetX, targetZ, attacking(fighter) ? 65 : (braking ? 55 : 42), dt, gait);
    if (gait) fighter.footwork = desiredSpeed < .05 ? 'idle'
      : (targetX * Math.sin(fighter.yaw) + targetZ * Math.cos(fighter.yaw) < -.2 ? 'retreat' : 'approach');
    if (ready(fighter) || (fighter.state === 'windup' && fighter.stateTime < fighter.stateDuration * .65)) {
      let aimX = this._input.aimX, aimZ = this._input.aimZ;
      if (aimX === undefined || aimZ === undefined || Math.hypot(aimX, aimZ) < .01) {
        aimX = this.enemy.x - fighter.x; aimZ = this.enemy.z - fighter.z;
      }
      this._face(fighter, aimX, aimZ, 30, dt);
    }
  }

  _updateAI(dt) {
    const fighter = this.enemy;
    if (!this.aiEnabled || fighter.state === 'dead') { this._steer(fighter, 0, 0, 22, dt); return; }
    const dx = this.player.x - fighter.x, dz = this.player.z - fighter.z;
    const distance = Math.hypot(dx, dz);
    if (ready(fighter) || (fighter.state === 'windup' && fighter.stateTime < fighter.stateDuration * .65))
      this._face(fighter, dx, dz, 12, dt);
    if (!ready(fighter)) {
      let retreat = 0;
      if (fighter.state === 'recovery' && fighter.stateTime / fighter.stateDuration > .68 && distance < 1.2) retreat = -.7;
      this._steer(fighter, distance > .01 ? dx / distance * retreat : 0,
        distance > .01 ? dz / distance * retreat : 0, 22, dt, retreat !== 0);
      if (retreat !== 0) fighter.footwork = 'retreat';
      return;
    }
    this._aiCooldown -= dt;
    const patterns = ENEMY_ATTACKS[this.mode];
    const spec = { ...patterns[this._aiStep % patterns.length] };
    if (this.phase === 2) { spec.windup -= .10; spec.recovery -= .06; }
    const preferredRange = spec.range * .78;
    const error = distance - preferredRange;
    const radial = clamp(error * 3.5, -1.15, this.mode === 'boss' ? 2.25 : 1.9);
    const orbit = Math.abs(error) < .6 && this._aiCooldown > .16 ? (this._aiStep % 2 ? -1 : 1) * .65 : 0;
    const nx = distance > .01 ? dx / distance : 0, nz = distance > .01 ? dz / distance : 1;
    const canAttack = this._aiCooldown <= 0 && distance < spec.range * .93
      && Math.abs(angleDelta(Math.atan2(dx, dz), fighter.yaw)) < .20;
    this._steer(fighter, canAttack ? 0 : nx * radial - nz * orbit,
      canAttack ? 0 : nz * radial + nx * orbit, 10, dt, !canAttack);
    fighter.footwork = canAttack ? 'plant' : (error > .3 ? 'approach' : (error < -.2 ? 'retreat' : (orbit ? 'circle' : 'idle')));
    if (canAttack && this._beginAttack(fighter, spec)) {
      this._aiStep++;
      this._aiCooldown = this.mode === 'boss' ? (this.phase === 2 ? .28 : .48) : .65;
    }
  }

  _driveAttack(fighter) {
    if (!attacking(fighter) || !fighter.attack) { fighter.weightShift = 0; return; }
    const spec = fighter.attack;
    const start = spec.windup * .60, end = spec.windup + spec.active * .78;
    const progress = smoothstep((fighter.attackTime - start) / (end - start));
    let distance = Math.max(0, progress - fighter._driveProgress) * spec.lunge;
    fighter._driveProgress = progress;
    const nx = Math.sin(fighter.yaw), nz = Math.cos(fighter.yaw);
    const target = fighter.id === 'player' ? this.enemy : this.player;
    const dx = target.x - fighter.x, dz = target.z - fighter.z;
    const along = dx * nx + dz * nz, across = Math.abs(dx * nz - dz * nx);
    const separation = fighter.radius + target.radius + .06;
    if (along > 0 && across < separation) distance = Math.min(distance, Math.max(0, along - separation));
    // Integrating an eased distance curve avoids constant-velocity skating and
    // prevents a lunge from shoving a planted opponent across the floor.
    this._move(fighter, nx, nz, distance, 1);
    fighter.weightShift = fighter.state === 'windup'
      ? smoothstep((fighter.stateTime / fighter.stateDuration - .60) / .40)
      : fighter.state === 'active' ? 1 : 1 - smoothstep(fighter.stateTime / fighter.stateDuration);
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
    const positions = [this.player, this.enemy].map(fighter => ({ x: fighter.x, z: fighter.z }));
    this._movePlayer(dt);
    this._updateAI(dt);
    this._tickFighter(this.player, dt);
    this._tickFighter(this.enemy, dt);
    for (const fighter of [this.player, this.enemy]) this._driveAttack(fighter);
    this._separate();
    // Snapshot both active attacks before applying either hit, allowing fair trades.
    const hits = [this._hitCandidate(this.player, this.enemy), this._hitCandidate(this.enemy, this.player)];
    for (const hit of hits) if (hit) this._receive(hit);
    [this.player, this.enemy].forEach((fighter, index) => {
      fighter.vx = (fighter.x - positions[index].x) / dt;
      fighter.vz = (fighter.z - positions[index].z) / dt;
      fighter.speed = Math.hypot(fighter.vx, fighter.vz);
    });
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
