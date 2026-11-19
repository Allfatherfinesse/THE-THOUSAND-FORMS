import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Serve dist first. These checks use the live input/model/rendering paths and
// read-only snapshots. Emulated browser touch is not physical-device coverage.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.GAME_URL || 'http://127.0.0.1:4173';
const artifacts = process.env.THIRD_PERSON_ARTIFACT_DIR || 'artifacts/third-person';
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [], checks = [], pages = [];
await mkdir(artifacts, { recursive: true });
const snapshot = page => page.evaluate(() => window.__THOUSAND_FORMS__.snapshot());
const wait = (page, predicate, argument) => page.waitForFunction(predicate, argument, { timeout: 15000 });
const record = label => { checks.push(label); console.log(`PASS: ${label}`); };
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const delta = (a, b) => ({ x: b.x - a.x, z: b.z - a.z });
const dot = (a, b) => a.x * b.x + a.z * b.z;
const unit = vector => { const length = Math.hypot(vector.x, vector.z); return { x: vector.x / length, z: vector.z / length }; };
const cameraForward = camera => unit(delta(camera.position, camera.target));

async function openPage(options) {
  const page = await browser.newPage(options);
  pages.push(page);
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await wait(page, () => Boolean(window.__THOUSAND_FORMS__));
  assert.equal(await page.locator('.browser-error').count(), 0);
  return page;
}

async function start(page) {
  await page.locator('[data-start]').click();
  await wait(page, () => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return state.started && state.camera?.type === 'perspective' && state.locked;
  });
  await wait(page, () => Number(getComputedStyle(document.querySelector('.player-panel')).opacity) > .99);
}

async function fresh(page) {
  const state = await snapshot(page);
  if (state.result !== 'playing') await page.locator('[data-restart]').click();
  else {
    if (state.paused) await page.locator('[data-resume]').click();
    await page.locator('#arena').focus();
    await page.keyboard.press('KeyR');
  }
  await wait(page, () => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return state.started && !state.paused && state.locked && state.player.state === 'idle' && state.player.health === 100;
  });
}

function assertFramed(camera, label) {
  assert.equal(camera.type, 'perspective', `${label}: perspective camera`);
  for (const name of ['position', 'target', 'player', 'enemy']) {
    for (const axis of ['x', 'y', 'z']) assert.ok(Number.isFinite(camera[name]?.[axis]), `${label}: finite ${name}.${axis}`);
  }
  for (const name of ['player', 'enemy']) {
    const point = camera[name];
    assert.ok(Math.abs(point.x) < .98 && Math.abs(point.y) < .98 && point.z >= -1 && point.z <= 1,
      `${label}: ${name} outside camera clip bounds: ${JSON.stringify(point)}`);
  }
  for (const name of ['playerBounds', 'enemyBounds']) for (const part of ['head', 'feet']) {
    const point = camera[name]?.[part];
    assert.ok(point && Math.abs(point.x) < .98 && Math.abs(point.y) < .98 && point.z >= -1 && point.z <= 1,
      `${label}: ${name}.${part} outside camera clip bounds: ${JSON.stringify(point)}`);
  }
}

async function waitFramed(page) {
  await wait(page, () => {
    const camera = window.__THOUSAND_FORMS__.snapshot().camera;
    return camera?.type === 'perspective' && [camera.player, camera.enemy,
      camera.playerBounds?.head, camera.playerBounds?.feet,
      camera.enemyBounds?.head, camera.enemyBounds?.feet].every(p => {
      return p && Math.abs(p.x) < .98 && Math.abs(p.y) < .98 && p.z >= -1 && p.z <= 1;
    });
  });
}

async function move(page, key, minimum = .4) {
  const before = await snapshot(page);
  await page.keyboard.down(key);
  await wait(page, ({ origin, minimum }) => {
    const player = window.__THOUSAND_FORMS__.snapshot().player;
    return Math.hypot(player.x - origin.x, player.z - origin.z) > minimum;
  }, { origin: before.player, minimum });
  await page.keyboard.up(key);
  return { before, after: await snapshot(page) };
}

async function assertTouchLayout(page, label) {
  for (const selector of ['#lock-toggle', '#fullscreen-toggle', '#joystick', '[data-action="light"]', '[data-action="evade"]']) {
    assert.equal(await page.locator(selector).isVisible(), true, `${label}: ${selector} visible`);
    const geometry = await page.locator(selector).evaluate(element => {
      const box = element.getBoundingClientRect();
      return { inside: box.x >= 0 && box.y >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1,
        tappable: element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)) };
    });
    assert.equal(geometry.inside, true, `${label}: ${selector} inside viewport`);
    assert.equal(geometry.tappable, true, `${label}: ${selector} receives taps`);
  }
  await waitFramed(page);
  assertFramed((await snapshot(page)).camera, label);
  await page.screenshot({ path: `${artifacts}/${label}.png` });
}

try {
  const page = await openPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await start(page);
  await waitFramed(page);
  assertFramed((await snapshot(page)).camera, 'Desktop spawn');
  await page.screenshot({ path: `${artifacts}/desktop-locked.png` });
  record('Play uses a perspective camera with both fighters inside the view');

  const forwardMove = await move(page, 'KeyW', .55);
  const towardEnemy = unit(delta(forwardMove.before.player, forwardMove.before.enemy));
  assert.ok(dot(delta(forwardMove.before.player, forwardMove.after.player), towardEnemy) > .35,
    'W must move the player toward the opponent, independently of enemy movement');
  assert.ok(distance(forwardMove.after.player, forwardMove.after.enemy) < distance(forwardMove.before.player, forwardMove.before.enemy) - .3);
  assert.ok(distance(forwardMove.before.camera.position, forwardMove.after.camera.position) > .05, 'Camera follows the changing encounter');
  record('Locked W closes distance through player movement and the camera follows');

  for (const [key, sign] of [['KeyA', -1], ['KeyD', 1]]) {
    await fresh(page);
    const result = await move(page, key, .35);
    const forward = unit(delta(result.before.player, result.before.enemy));
    const right = { x: -forward.z, z: forward.x };
    assert.ok(dot(delta(result.before.player, result.after.player), right) * sign > .2, `${key} strafes on the correct side`);
  }
  await fresh(page);
  const beforeEvade = (await snapshot(page)).player;
  await page.keyboard.down('KeyD');
  await page.keyboard.press('Space');
  await wait(page, () => window.__THOUSAND_FORMS__.snapshot().player.state === 'evade');
  assert.ok((await snapshot(page)).player.stamina < 95, 'Evade spends stamina');
  await page.keyboard.up('KeyD');
  await wait(page, () => window.__THOUSAND_FORMS__.snapshot().player.state !== 'evade');
  const afterEvade = (await snapshot(page)).player;
  assert.ok(distance(beforeEvade, afterEvade) > .5, 'Evade displaces the player');
  assert.ok(afterEvade.x > beforeEvade.x + .25, 'Immediate D+evade uses current camera-relative direction');
  record('A/D strafe and an immediate directional evade move correctly');

  await fresh(page);
  await page.keyboard.press('Tab');
  await wait(page, () => !window.__THOUSAND_FORMS__.snapshot().locked);
  const beforeOrbit = await snapshot(page);
  const originalForward = cameraForward(beforeOrbit.camera);
  const viewport = page.viewportSize();
  const pointerStart = { x: viewport.width * .52, y: viewport.height * .47 };
  await page.mouse.move(pointerStart.x, pointerStart.y);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(pointerStart.x + 220, pointerStart.y - 12, { steps: 8 });
  await wait(page, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer !== null);
  await page.mouse.up({ button: 'right' });
  await wait(page, original => {
    const camera = window.__THOUSAND_FORMS__.snapshot().camera;
    const dx = camera.target.x - camera.position.x, dz = camera.target.z - camera.position.z;
    const length = Math.hypot(dx, dz);
    return (dx * original.x + dz * original.z) / length < .93;
  }, originalForward);
  const afterOrbit = await snapshot(page);
  assert.equal(afterOrbit.cameraLookPointer, null);
  assert.equal(afterOrbit.player.attackSequence, beforeOrbit.player.attackSequence, 'Free right-drag must not heavy attack');
  assert.equal(afterOrbit.player.stamina, 100, 'Free orbit spends no stamina');
  record('Tab unlocks; right-drag orbits the free camera without attacking');

  const freeMove = await move(page, 'KeyW', .55);
  const freeForward = cameraForward(freeMove.before.camera);
  const freeDisplacement = delta(freeMove.before.player, freeMove.after.player);
  assert.ok(dot(unit(freeDisplacement), freeForward) > .8, 'Free W follows the rotated camera');
  assert.ok(distance(freeMove.before.camera.target, freeMove.after.camera.target) > .1, 'Free camera target follows the player');
  await page.screenshot({ path: `${artifacts}/desktop-free-camera.png` });
  record('Free W follows the new view direction and the camera target follows displacement');

  await page.mouse.move(pointerStart.x, pointerStart.y);
  await page.mouse.down({ button: 'right' });
  await wait(page, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer !== null);
  await page.locator('#fullscreen-toggle').focus();
  await page.keyboard.press('Enter');
  await wait(page, () => document.fullscreenElement === document.querySelector('.game-shell') &&
    window.__THOUSAND_FORMS__.snapshot().cameraLookPointer === null && document.activeElement === document.querySelector('#arena'));
  await page.mouse.up({ button: 'right' });
  assert.equal((await snapshot(page)).camera.type, 'perspective');
  await page.keyboard.press('Escape');
  await wait(page, () => !document.fullscreenElement && window.__THOUSAND_FORMS__.snapshot().paused);
  assert.equal((await snapshot(page)).cameraLookPointer, null);
  assert.deepEqual((await snapshot(page)).keys, []);
  record('Fullscreen transitions release a captured camera drag and Escape still auto-pauses');
  await page.close();

  const mobile = await openPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await start(mobile);
  await assertTouchLayout(mobile, 'portrait-390x844');
  record('Portrait lock-on frames both fighters with accessible touch controls');
  await mobile.locator('#lock-toggle').tap();
  await wait(mobile, () => !window.__THOUSAND_FORMS__.snapshot().locked);
  const cdp = await mobile.context().newCDPSession(mobile);
  const first = { x: 205, y: 360, id: 1, radiusX: 6, radiusY: 6, force: 1 };
  const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  const mobileBefore = await snapshot(mobile);
  await touch('touchStart', [first]);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer !== null);
  await touch('touchMove', [{ ...first, x: 295, y: 345 }]);
  await wait(mobile, position => {
    const camera = window.__THOUSAND_FORMS__.snapshot().camera;
    return Math.hypot(camera.position.x - position.x, camera.position.z - position.z) > .1;
  }, mobileBefore.camera.position);
  await touch('touchCancel', []);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer === null);
  assert.equal((await snapshot(mobile)).player.attackSequence, mobileBefore.player.attackSequence);
  record('Emulated canvas touch rotates free camera and cancellation releases ownership');

  await touch('touchStart', [{ ...first, id: 2 }]);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer !== null);
  await mobile.setViewportSize({ width: 844, height: 390 });
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().cameraLookPointer === null);
  await touch('touchCancel', []);
  await mobile.locator('#lock-toggle').tap();
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().locked);
  await assertTouchLayout(mobile, 'landscape-844x390');
  record('Rotation clears camera input and landscape lock-on keeps both fighters framed');
  await cdp.detach();
  await mobile.close();

  assert.deepEqual(errors, [], 'No browser exceptions or failed asset requests');
  console.log(JSON.stringify({ status: 'PASS', checks, browserErrors: errors,
    scope: 'Headless Chromium with real Fullscreen API and emulated touch; no physical-device certification.' }, null, 2));
} catch (error) {
  if (errors.length) console.error('Browser errors:', JSON.stringify(errors));
  for (const [index, page] of pages.entries()) if (!page.isClosed()) {
    console.error(`Failure snapshot ${index}:`, JSON.stringify(await snapshot(page).catch(() => null)));
    await page.screenshot({ path: `${artifacts}/failure-${index}.png` }).catch(() => {});
  }
  throw error;
} finally {
  await browser.close();
}
