// Presentation-only, fictional combat choreography. No hit windows or resources
// are authored here: every strike phase follows the combat model's state clock.
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const KEYS = ['la', 'ra', 'laz', 'raz', 'lay', 'ray', 'le', 're', 'll', 'rl', 'llz', 'rlz',
  'lk', 'rk', 'lf', 'rf', 'bx', 'by', 'bz', 'hx', 'hy', 'hz', 'rootY', 'lean', 'sway', 'fall'];

function gaitLeg(pose, left, phase, amount, sprint, forward, sideways) {
  const cycle = ((phase / (Math.PI * 2)) % 1 + 1) % 1;
  const duty = mix(.64, .26, sprint);
  const planted = cycle < duty;
  const progress = planted ? cycle / duty : (cycle - duty) / (1 - duty);
  const travel = planted ? 1 - progress * 2 : -1 + smooth(progress) * 2;
  const reach = mix(.20, .31, sprint);
  const footZ = travel * reach * forward;
  const lift = planted ? 0 : Math.sin(progress * Math.PI) * mix(.09, .18, sprint);
  const vertical = mix(.726, .700, sprint) - lift;
  const distance = Math.min(.778, Math.hypot(footZ, vertical));
  const knee = 2 * Math.acos(clamp(distance / .78));
  const hip = -Math.atan2(footZ, vertical) - knee * .5;
  const toe = planted ? smooth((progress - .74) / .26) * .22 : -.16 * Math.sin(progress * Math.PI);
  const hipKey = left ? 'll' : 'rl', kneeKey = left ? 'lk' : 'rk';
  const ankleKey = left ? 'lf' : 'rf', sideKey = left ? 'llz' : 'rlz';
  pose[hipKey] = mix(pose[hipKey], hip, amount);
  pose[kneeKey] = mix(pose[kneeKey], knee, amount);
  // The ankle counter-rotates the thigh and shin during the planted phase.
  pose[ankleKey] = mix(pose[ankleKey], -hip - knee + toe, amount);
  pose[sideKey] += travel * sideways * .20 * amount;
}

export function createFighterMotion() {
  const pose = {}, target = {};
  for (const key of KEYS) pose[key] = target[key] = 0;
  return { pose, target, phase: 0, sourcePhase: 0, speed: 0, sprint: 0, impact: 0, previousHealth: null,
    previousState: '', previousSequence: 0, lastX: null, lastZ: null, ready: false,
    stanceTime: 0, resetMarker: null };
}

export function updateFighterMotion(motion, fighter, dt, elapsed, enemy = false) {
  dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .1);
  const state = fighter.state || 'idle';
  const p = motion.target;
  const style = clamp(fighter.style || 0, 0, 2);
  const yaw = fighter.yaw || 0;
  const sin = Math.sin(yaw), cos = Math.cos(yaw);
  const reset = motion.resetMarker !== fighter;
  const movedX = reset || motion.lastX === null ? 0 : fighter.x - motion.lastX;
  const movedZ = reset || motion.lastZ === null ? 0 : fighter.z - motion.lastZ;
  // A new fighter object means encounter reset. Never blend out of an old corpse.
  if (reset) {
    motion.ready = false; motion.impact = 0; motion.speed = 0; motion.sprint = 0;
    motion.previousHealth = fighter.health; motion.previousState = '';
    motion.phase = 0; motion.sourcePhase = fighter.movePhase || 0; motion.resetMarker = fighter;
  }
  const vx = Number.isFinite(fighter.vx) ? fighter.vx : dt > 0 ? movedX / dt : 0;
  const vz = Number.isFinite(fighter.vz) ? fighter.vz : dt > 0 ? movedZ / dt : 0;
  const actualSpeed = Math.min(8, Math.hypot(vx, vz));
  motion.lastX = fighter.x; motion.lastZ = fighter.z;
  const locomotion = state === 'idle' || state === 'guard' || state === 'recovery';
  motion.speed += ((locomotion ? actualSpeed : 0) - motion.speed) * (1 - Math.exp(-dt * 18));
  const desiredSprint = state === 'idle' ? clamp(Number.isFinite(fighter.sprintBlend)
    ? fighter.sprintBlend : fighter.sprinting ? 1 : 0) : 0;
  motion.sprint += (desiredSprint - motion.sprint) * (1 - Math.exp(-dt * 14));
  // Accumulate distance instead of rescaling the whole phase as sprint changes.
  // The longer running stride has a lower cadence per metre than the combat step.
  const cadence = mix(.62, .50, motion.sprint);
  if (Number.isFinite(fighter.movePhase)) {
    motion.phase += Math.max(0, fighter.movePhase - motion.sourcePhase) * cadence;
    motion.sourcePhase = fighter.movePhase;
  } else if (locomotion) motion.phase += actualSpeed * dt * 4 * cadence;
  motion.stanceTime += dt;
  const stride = clamp(motion.speed / 3.9);
  const forward = actualSpeed > .05 ? clamp((vx * sin + vz * cos) / actualSpeed, -1, 1) : 0;
  const side = actualSpeed > .05 ? clamp((vx * cos - vz * sin) / actualSpeed, -1, 1) : 0;
  const phase = motion.phase;
  const gait = Math.sin(phase), sprint = motion.sprint;
  const breath = Math.sin(motion.stanceTime * 2.3 + (enemy ? 1.1 : 0));
  const weight = Math.sin(motion.stanceTime * 1.05 + (enemy ? 2 : 0));
  const age = clamp((fighter.stateTime || 0) / Math.max(.001, fighter.stateDuration || 1));

  // A grounded, asymmetric guard is the base for every transition.
  p.la = -.46; p.ra = -.20; p.laz = .16; p.raz = -.22; p.lay = -.12; p.ray = .12;
  p.le = -1.90; p.re = -2.02; p.ll = -.13; p.rl = .13; p.llz = .07; p.rlz = -.08;
  p.lk = .19; p.rk = .18; p.lf = -.06; p.rf = -.08;
  p.bx = .035 + breath * .012; p.by = -.14; p.bz = weight * .016;
  p.hx = -.02; p.hy = .11; p.hz = -weight * .01;
  p.rootY = -.025 + breath * .005; p.lean = 0; p.sway = weight * .008; p.fall = 0;
  if (style === 1) {
    p.la = -.62; p.ra = -.34; p.le = -1.65; p.re = -1.88;
    p.laz = .06; p.raz = -.1; p.by = -.08; p.hy = .06; p.ll = -.09; p.rl = .08;
  } else if (style === 2) {
    p.by = -.38; p.hy = .28; p.la = -.2; p.ra = .05; p.le = -1.80; p.re = -1.95;
    p.ll = -.23; p.rl = .22; p.laz = .25; p.raz = -.27; p.lk = .24; p.rk = .17;
  }
  if (stride > .001) {
    const guarded = state === 'guard' ? .64 : 1;
    gaitLeg(p, true, phase, stride * guarded, sprint, forward, side);
    gaitLeg(p, false, phase + Math.PI, stride * guarded, sprint, forward, side);
    p.la = mix(p.la, -.25 - gait * .62, sprint * stride);
    p.ra = mix(p.ra, -.25 + gait * .62, sprint * stride);
    p.le = mix(p.le, -1.32 + gait * .15, sprint * stride);
    p.re = mix(p.re, -1.32 - gait * .15, sprint * stride);
    p.la -= gait * .13 * stride; p.ra += gait * .13 * stride;
    p.by = mix(p.by, 0, sprint * stride) + gait * mix(.085, .14, sprint) * stride;
    p.hy = -p.by * .65;
    p.bx += forward * mix(.055, .22, sprint) * stride;
    p.hx -= forward * .11 * sprint * stride;
    p.bz -= side * .07 * stride;
    p.sway += gait * .012 * stride;
    p.rootY += Math.abs(Math.sin(phase * 2)) * mix(.012, .028, sprint) * stride - .023 * stride - .026 * sprint * stride;
    p.lean += .025 * sprint * stride;
  }

  const attack = fighter.attack;
  if (attack && (state === 'windup' || state === 'active' || state === 'recovery')) {
    const load = state === 'windup' ? smooth(age) : state === 'active' ? 1 : 1 - smooth(age);
    const extension = state === 'active' ? 1 - smooth(Math.max(0, age - .68) / .32) * .12
      : state === 'recovery' ? .88 * (1 - smooth(age)) : 0;
    const drive = Number.isFinite(fighter.weightShift) ? fighter.weightShift : load;
    const attackStyle = attack.style ?? style;
    const heavy = attack.kind !== 'light';
    const hand = ((attack.comboIndex ?? fighter.comboIndex ?? fighter.attackSequence ?? 0) % 2) ? 1 : -1;
    p.rootY -= .045 * load * (1 - extension);
    p.by = -.38 * load + .75 * extension;
    p.hy = -p.by * .65;
    p.bx = -.035 * load + .13 * extension;
    p.lean = .045 * drive;
    p.ll = -.20 - .14 * extension; p.rl = .17 + .10 * extension;
    p.lk = .22; p.rk = .23 - .09 * extension;
    if (attackStyle === 2 || attack.sweep) {
      // Chamber, extension during the active window, then a controlled re-chamber.
      p.rl = -.20 - .90 * load - .43 * extension;
      p.rk = .15 + 1.62 * load - 1.52 * extension;
      p.rlz = attack.sweep ? -.65 * extension : heavy ? -.32 * extension : -.10;
      p.bx = -.21 * load; p.bz = -.11 * extension;
      p.by = attack.sweep ? -.70 * load + (1.1 + (state === 'active' ? age * .65 : .65)) * extension
        : -.32 * load + .62 * extension;
      p.hy = -p.by * .55;
      p.la = -.35; p.ra = .65; p.le = -.94; p.re = -.9;
      p.laz = .45 * load; p.raz = -.62 * load;
      p.rootY += .035 * extension; p.lk = .22; p.rf = -.32;
    } else if (attackStyle === 0 && heavy) {
      // Compact elbow strike: shoulder and hip deliver the impact, fist stays tucked.
      p.ra = -.25 * load - 1.06 * extension;
      p.raz = -.22 - .66 * load + .55 * extension;
      p.ray = -.85 * load + 1.05 * extension;
      p.re = -1.90;
      p.la = -.36; p.le = -1.8; p.laz = .2;
      p.by = -.62 * load + 1.0 * extension; p.hy = -p.by * .55;
      p.bx = .02 + .15 * extension; p.rootY -= .02 * load;
      p.rl = .25 - .17 * extension; p.rk = .24;
    } else {
      const shoulder = .28 * load - 1.86 * extension;
      const elbow = -1.65 * load + 1.54 * extension;
      if (hand > 0) { p.ra = shoulder; p.re = elbow; p.raz = -.05; p.ray = -.12 * extension; }
      else { p.la = shoulder; p.le = elbow; p.laz = .05; p.lay = .12 * extension; }
      p.by = hand * (-.33 * load + .62 * extension);
      p.hy = -p.by * .72;
      if (attackStyle === 1 && heavy) { p.la = shoulder * .92; p.le = elbow - .14; p.laz = .08; }
    }
  }
  if (state === 'guard' || state === 'guarding') {
    p.la = -1.05; p.ra = -1.02; p.le = -1.90; p.re = -1.93;
    p.laz = -.10; p.raz = .10; p.lay = -.04; p.ray = .04;
    p.bx = .095; p.hx = .05; p.lk += .08; p.rk += .08; p.rootY -= .035;
  } else if (state === 'evade' || state === 'evading') {
    const compression = Math.sin(Math.PI * smooth(age));
    const localSide = (fighter.dodgeX || 0) * cos - (fighter.dodgeZ || 0) * sin;
    const localForward = (fighter.dodgeX || 0) * sin + (fighter.dodgeZ || 0) * cos;
    p.rootY = -.08 - .26 * compression;
    p.bx = .22 + .30 * compression; p.bz = -localSide * .32 * compression;
    p.by = -localSide * .25; p.hx = -.18; p.hy = -p.by * .6;
    p.ll = -.24 - .42 * compression + localForward * .18;
    p.rl = -.34 - .50 * compression - localForward * .16;
    p.lk = .45 + .93 * compression; p.rk = .56 + .95 * compression;
    p.la = -.4; p.ra = -.5; p.le = -1.35; p.re = -1.45;
    p.laz = .2 + Math.max(0, localSide) * .4; p.raz = -.2 + Math.min(0, localSide) * .4;
    p.lf = -.1; p.rf = -.1;
  } else if (state === 'switch' || state === 'switching') {
    const turn = Math.sin(smooth(age) * Math.PI);
    p.by += turn * .55; p.hy = -p.by * .65;
    p.la = -.6; p.ra = -.65; p.le = -1.35; p.re = -1.45;
    p.rootY -= turn * .045; p.ll -= turn * .12; p.rl += turn * .12;
  } else if (state === 'stun' || state === 'hitstun') {
    const recoil = 1 - smooth(age);
    p.bx = -.35 * recoil; p.bz = .12 * recoil; p.hx = -.21 * recoil;
    p.la = .2 + .25 * recoil; p.ra = .3 + .32 * recoil;
    p.le = -.8; p.re = -.62; p.rootY = -.05;
    p.ll = -.18; p.rl = .28; p.lk = .22; p.rk = .35;
  } else if (state === 'broken' || state === 'posturebroken') {
    p.rootY = -.37; p.bx = .55; p.hx = .25;
    p.ll = -.75; p.rl = -.35; p.lk = 1.55; p.rk = 1.05;
    p.la = .08; p.ra = -.1; p.le = -.48; p.re = -.55;
  } else if (state === 'dead') {
    p.fall = 1.49; p.rootY = .15; p.bx = .08; p.by = -.12;
    p.la = -.55; p.ra = .28; p.le = -.28; p.re = -.42;
    p.ll = .25; p.rl = -.3; p.lk = .35; p.rk = .5; p.hx = -.18;
  }

  if (motion.previousHealth !== null && fighter.health < motion.previousHealth) motion.impact = 1;
  if (state === 'stun' && motion.previousState !== state) motion.impact = 1;
  motion.impact *= Math.exp(-dt * 12);
  motion.previousHealth = fighter.health;
  motion.previousState = state;
  p.bz += motion.impact * .08; p.hx -= motion.impact * .13;
  const blend = motion.ready ? 1 - Math.exp(-dt * (state === 'active' ? 62 : state === 'stun' ? 30 : 17)) : 1;
  for (const key of KEYS) motion.pose[key] = mix(motion.pose[key], p[key], blend);
  motion.ready = true;
  return motion.pose;
}
