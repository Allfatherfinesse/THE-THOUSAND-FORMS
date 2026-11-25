import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || undefined,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const url = process.env.GAME_URL || 'http://127.0.0.1:4173';
const errors = [];
const snapshot = page => page.evaluate(() => window.__THOUSAND_FORMS__.snapshot());

async function start(options) {
  const page = await browser.newPage({ deviceScaleFactor: 1, ...options });
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(url);
  assert.equal(response.status(), 200);
  const button = page.locator('[data-start]');
  if (options.hasTouch) await button.tap();
  else await button.click();
  await page.waitForFunction(() => window.__THOUSAND_FORMS__.snapshot().started);
  return page;
}

async function advance(page, duration) {
  const { time } = await snapshot(page);
  await page.waitForFunction(end => window.__THOUSAND_FORMS__.snapshot().time >= end, time + duration);
  return snapshot(page);
}

async function startSprint(page) {
  await page.keyboard.press('KeyR');
  await page.keyboard.down('ShiftLeft');
  await page.keyboard.down('KeyW');
  await page.waitForFunction(() => window.__THOUSAND_FORMS__.snapshot().player.sprinting === true);
}

async function releaseKeys(page) {
  await page.keyboard.up('KeyW');
  await page.keyboard.up('ShiftLeft');
}

async function assertReset(page) {
  await page.waitForFunction(() => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return !state.keys.length && state.player.sprinting === false;
  });
  await releaseKeys(page);
}

async function desktopChecks() {
  const page = await start({ viewport: { width: 960, height: 600 } });
  await page.keyboard.down('ShiftLeft');
  const idle = (await advance(page, .18)).player;
  assert.equal(idle.sprinting, false, 'Holding Shift while standing still should preserve stamina');
  assert.equal(idle.stamina, idle.maxStamina);
  await page.keyboard.up('ShiftLeft');

  await page.keyboard.press('KeyR');
  await page.keyboard.down('KeyW');
  const walk = (await advance(page, .24)).player;
  assert.ok(walk.speed > 0 && !walk.sprinting);
  assert.equal(walk.stamina, walk.maxStamina, 'Walking costs no stamina');
  await page.keyboard.up('KeyW');

  await startSprint(page);
  await page.waitForFunction(walkSpeed => {
    const p = window.__THOUSAND_FORMS__.snapshot().player;
    return p.sprinting && p.speed > walkSpeed * 1.2 && p.stamina < p.maxStamina;
  }, walk.speed);
  await page.keyboard.up('ShiftLeft');
  await page.waitForFunction(walkSpeed => {
    const { player, keys } = window.__THOUSAND_FORMS__.snapshot();
    return keys.includes('KeyW') && !player.sprinting && player.speed > 0 && player.speed <= walkSpeed * 1.05;
  }, walk.speed);
  await page.keyboard.up('KeyW');
  console.log('PASS Keyboard sprint outruns walking, spends stamina only in motion, and releases back to walking');

  await startSprint(page);
  await page.keyboard.down('KeyF');
  await page.waitForFunction(() => {
    const p = window.__THOUSAND_FORMS__.snapshot().player;
    return p.state === 'guard' && !p.sprinting;
  });
  await page.keyboard.up('KeyF');
  await releaseKeys(page);
  await startSprint(page);
  await page.keyboard.press('KeyJ');
  await page.waitForFunction(() => {
    const p = window.__THOUSAND_FORMS__.snapshot().player;
    return p.attackSequence > 0 && ['windup', 'active', 'recovery'].includes(p.state) && !p.sprinting;
  });
  await releaseKeys(page);
  console.log('PASS Guard and light attack interrupt sprint while the modifier is held');

  await startSprint(page);
  await page.keyboard.press('KeyP');
  assert.equal((await snapshot(page)).paused, true);
  await assertReset(page);
  await page.locator('[data-resume]').click();
  console.log('PASS Pause and resume release sprint');
  await startSprint(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  assert.equal((await snapshot(page)).paused, true);
  await assertReset(page);
  await page.locator('[data-resume]').click();
  console.log('PASS Window blur releases sprint');
  await startSprint(page);
  await page.locator('#fullscreen-toggle').click();
  await page.waitForFunction(() => document.fullscreenElement === document.querySelector('.game-shell'));
  await assertReset(page);
  await page.waitForFunction(() => document.activeElement === document.querySelector('#arena'));
  await advance(page, .16); // Allow fullscreen resize events to finish clearing held controls.
  await startSprint(page);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.fullscreenElement && window.__THOUSAND_FORMS__.snapshot().paused);
  await assertReset(page);
  await page.close();
  console.log('PASS Fullscreen entry and exit release sprint');
}

async function touchChecks(width, height) {
  const page = await start({ viewport: { width, height }, hasTouch: true, isMobile: true });
  const button = page.locator('#sprint-toggle');
  assert.equal(await button.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.x >= 0 && box.y >= 0 && box.right <= innerWidth && box.bottom <= innerHeight &&
      element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  }), true, 'Sprint control fits and receives taps');
  const stick = await page.locator('#joystick').boundingBox();
  assert.ok(stick, 'Joystick is visible');
  const cdp = await page.context().newCDPSession(page);
  const center = { x: stick.x + stick.width / 2, y: stick.y + stick.height / 2, id: 1 };
  const right = { ...center, x: center.x + stick.width * .38 };
  const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  async function moveStick(destination = right) {
    await touch('touchStart', [center]);
    await touch('touchMove', [destination]);
  }

  await button.tap();
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  const idle = (await advance(page, .15)).player;
  assert.equal(idle.sprinting, false);
  assert.equal(idle.stamina, idle.maxStamina);
  await button.tap();
  assert.equal(await button.getAttribute('aria-pressed'), 'false');
  await moveStick();
  const walk = (await advance(page, .18)).player;
  assert.ok(walk.speed > 0 && !walk.sprinting);
  assert.equal(walk.stamina, walk.maxStamina);
  await touch('touchEnd', []);

  await button.tap();
  await moveStick();
  await page.waitForFunction(walkSpeed => {
    const { player, joystick } = window.__THOUSAND_FORMS__.snapshot();
    return joystick.x > .5 && player.sprinting && player.speed > walkSpeed * 1.2 && player.stamina < player.maxStamina;
  }, walk.speed);
  await touch('touchEnd', []);
  await page.waitForFunction(() => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return state.joystickPointer === null && state.joystick.x === 0 && !state.player.sprinting &&
      document.querySelector('#sprint-toggle').getAttribute('aria-pressed') === 'false';
  });
  // Reverse direction so the final drag walks back into the arena, even if
  // Chromium held the previous drag for extra frames while delivering events.
  await moveStick({ ...center, x: center.x - stick.width * .38 });
  await page.waitForFunction(() => {
    const { joystick, player } = window.__THOUSAND_FORMS__.snapshot();
    return joystick.x < -.5 && player.speed > .1 && player.state === 'idle' && !player.sprinting;
  });
  await touch('touchEnd', []);
  await page.close();
  console.log(`PASS Touch sprint arms, disarms, runs and releases at ${width}×${height}`);
}

try {
  await desktopChecks();
  await touchChecks(390, 844);
  await touchChecks(844, 390);
  assert.deepEqual(errors, [], 'Browser errors or failed assets');
} finally {
  await browser.close();
}
