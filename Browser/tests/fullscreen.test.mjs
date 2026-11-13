import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Browser automation, including emulated touch, does not certify physical devices.
// Serve dist first. PLAYWRIGHT_MODULE and BROWSER_PATH can select installed tools.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.GAME_URL || 'http://127.0.0.1:4173';
const artifactDirectory = process.env.FULLSCREEN_ARTIFACT_DIR || 'artifacts/fullscreen';
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [];
const checks = [];
const pages = [];
await mkdir(artifactDirectory, { recursive: true });

const snapshot = page => page.evaluate(() => window.__THOUSAND_FORMS__.snapshot());
const wait = (page, predicate, argument) => page.waitForFunction(predicate, argument, { timeout: 15000 });
const record = label => { checks.push(label); console.log(`PASS: ${label}`); };

async function openPage(options) {
  const page = await browser.newPage(options);
  pages.push(page);
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await wait(page, () => Boolean(window.__THOUSAND_FORMS__));
  assert.equal(await page.locator('.browser-error').count(), 0, 'WebGL scene must initialize');
  return page;
}

async function waitFullscreen(page, active) {
  await wait(page, active => {
    const shell = document.querySelector('.game-shell');
    const actual = document.fullscreenElement === shell;
    return actual === active && window.__THOUSAND_FORMS__.snapshot().fullscreen === active &&
      document.querySelector('#fullscreen-toggle').getAttribute('aria-pressed') === String(active);
  }, active);
  assert.equal(await page.locator('#fullscreen-toggle').getAttribute('aria-pressed'), String(active));
}

function assertNeutral(state, label) {
  assert.deepEqual(state.keys, [], `${label}: keyboard input cleared`);
  assert.equal(state.player.guardHeld, false, `${label}: guard released`);
  assert.equal(Boolean(state.touchGuard), false, `${label}: touch guard released`);
  assert.equal(state.joystick.x, 0, `${label}: horizontal joystick reset`);
  assert.equal(state.joystick.z, 0, `${label}: vertical joystick reset`);
  assert.equal(state.joystickPointer, null, `${label}: joystick ownership cleared`);
}

async function assertCanvasFits(page) {
  const geometry = await page.evaluate(() => {
    const rect = document.querySelector('#arena').getBoundingClientRect();
    const canvas = document.querySelector('#arena');
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      viewportWidth: innerWidth, viewportHeight: innerHeight,
      drawingWidth: canvas.width, drawingHeight: canvas.height,
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.ok(Math.abs(geometry.x) <= 1 && Math.abs(geometry.y) <= 1, JSON.stringify(geometry));
  assert.ok(Math.abs(geometry.width - geometry.viewportWidth) <= 1, JSON.stringify(geometry));
  assert.ok(Math.abs(geometry.height - geometry.viewportHeight) <= 1, JSON.stringify(geometry));
  assert.ok(geometry.drawingWidth > 0 && geometry.drawingHeight > 0, 'Canvas drawing buffer exists');
  assert.equal(geometry.overflow, false, 'No horizontal document overflow');
}

async function freshEncounter(page) {
  let state = await snapshot(page);
  if (state.result !== 'playing') await page.locator('[data-restart]').click();
  else {
    if (state.paused) await page.locator('[data-resume]').click();
    await page.locator('#arena').focus();
    await page.keyboard.press('KeyR');
  }
  await wait(page, () => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return state.started && !state.paused && state.player.state === 'idle' && state.player.health === 100;
  });
}

async function center(page, selector) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(box, `${selector} has a box`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
}

async function assertMobileLayout(page, label) {
  const selectors = ['.player-panel', '.enemy-panel', '.style-panel', '#fullscreen-toggle', '#pause-toggle',
    '#joystick', '[data-action="light"]', '[data-action="heavy"]', '[data-action="evade"]',
    '[data-action="hybrid"]', '[data-guard]'];
  for (const selector of selectors) {
    assert.equal(await page.locator(selector).isVisible(), true, `${label}: ${selector} visible`);
    const rect = await page.locator(selector).boundingBox();
    const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    assert.ok(rect.x >= -1 && rect.y >= -1 && rect.x + rect.width <= viewport.width + 1 &&
      rect.y + rect.height <= viewport.height + 1, `${label}: ${selector} clipped: ${JSON.stringify(rect)}`);
    if (selector.startsWith('[data-') || selector.endsWith('-toggle')) {
      const unobstructed = await page.locator(selector).evaluate(element => {
        const rect = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      });
      assert.equal(unobstructed, true, `${label}: ${selector} can receive a tap`);
    }
  }
  await assertCanvasFits(page);
  await page.screenshot({ path: `${artifactDirectory}/${label}.png` });
}

try {
  const desktop = await openPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  assert.equal(await desktop.evaluate(() => document.fullscreenEnabled), true,
    'This Chromium run must exercise the real Fullscreen API');
  await desktop.evaluate(() => {
    document.querySelector('.game-shell').requestFullscreen = () => Promise.reject(
      new DOMException('Injected permission denial for resilience coverage', 'NotAllowedError'));
  });
  await desktop.locator('#fullscreen-toggle').click();
  await wait(desktop, () => {
    const notice = document.querySelector('.app-notice');
    return notice && notice.textContent.length > 0 && getComputedStyle(notice).visibility !== 'hidden' &&
      getComputedStyle(notice).display !== 'none' && Number(getComputedStyle(notice).opacity) > 0;
  });
  assert.equal(await desktop.evaluate(() => document.fullscreenElement), null);
  assert.equal((await snapshot(desktop)).started, false);
  await desktop.evaluate(() => { delete document.querySelector('.game-shell').requestFullscreen; });
  record('Injected fullscreen denial shows a visible fallback notice without blocking the menu');
  await desktop.locator('[data-start]').click();
  await desktop.keyboard.down('KeyW');
  await desktop.keyboard.down('KeyF');
  await wait(desktop, () => {
    const state = window.__THOUSAND_FORMS__.snapshot();
    return state.player.guardHeld && state.keys.includes('KeyW') && state.keys.includes('KeyF');
  });
  await desktop.locator('#fullscreen-toggle').click();
  await waitFullscreen(desktop, true);
  await wait(desktop, () => document.activeElement === document.querySelector('#arena'));
  assertNeutral(await snapshot(desktop), 'Enter fullscreen');
  await desktop.keyboard.up('KeyW');
  await desktop.keyboard.up('KeyF');
  await assertCanvasFits(desktop);
  record('Explicit fullscreen entry targets the game shell, focuses canvas, and releases held movement/guard');

  const origin = (await snapshot(desktop)).player;
  await desktop.keyboard.down('KeyD');
  await wait(desktop, origin => {
    const player = window.__THOUSAND_FORMS__.snapshot().player;
    return Math.hypot(player.x - origin.x, player.z - origin.z) > .15;
  }, origin);
  await desktop.keyboard.up('KeyD');
  await desktop.setViewportSize({ width: 1100, height: 700 });
  await assertCanvasFits(desktop);
  await desktop.screenshot({ path: `${artifactDirectory}/desktop-fullscreen.png` });
  record('Movement remains usable after entry and canvas fits a resized fullscreen viewport');

  await desktop.locator('#pause-toggle').click();
  await wait(desktop, () => window.__THOUSAND_FORMS__.snapshot().paused);
  const pausedTime = (await snapshot(desktop)).time;
  await desktop.locator('#fullscreen-toggle').click();
  await waitFullscreen(desktop, false);
  assert.equal((await snapshot(desktop)).paused, true);
  assert.equal(await desktop.locator('#pause-overlay').isVisible(), true);
  await desktop.locator('#fullscreen-toggle').click();
  await waitFullscreen(desktop, true);
  assert.equal((await snapshot(desktop)).paused, true);
  await desktop.waitForTimeout(250);
  assert.equal((await snapshot(desktop)).time, pausedTime, 'Fullscreen transitions must not resume paused combat');
  assertNeutral(await snapshot(desktop), 'Paused fullscreen transition');
  record('Fullscreen button can exit/re-enter while paused without advancing combat');

  await desktop.locator('[data-resume]').click();
  await desktop.keyboard.down('KeyF');
  await wait(desktop, () => window.__THOUSAND_FORMS__.snapshot().player.guardHeld);
  await desktop.keyboard.press('Escape');
  await waitFullscreen(desktop, false);
  await wait(desktop, () => window.__THOUSAND_FORMS__.snapshot().paused);
  await desktop.keyboard.up('KeyF');
  assertNeutral(await snapshot(desktop), 'Escape fullscreen exit');
  const escapedTime = (await snapshot(desktop)).time;
  await desktop.waitForTimeout(200);
  assert.equal((await snapshot(desktop)).time, escapedTime);
  record('Escape exits actual fullscreen, auto-pauses once, and releases guard');

  await freshEncounter(desktop);
  const soundBefore = await desktop.locator('#sound-toggle').getAttribute('aria-pressed');
  await desktop.locator('#sound-toggle').focus();
  await desktop.keyboard.press('Space');
  await wait(desktop, before => document.querySelector('#sound-toggle').getAttribute('aria-pressed') !== before, soundBefore);
  let state = await snapshot(desktop);
  assert.equal(state.player.state, 'idle', 'Space on a button must not evade');
  assert.equal(state.player.stamina, 100, 'Button Space must not spend evade stamina');
  assert.equal(state.player.attackSequence, 0, 'Button activation must not attack');
  await desktop.locator('#fullscreen-toggle').focus();
  await desktop.keyboard.press('Space');
  await waitFullscreen(desktop, true);
  state = await snapshot(desktop);
  assert.equal(state.player.state, 'idle');
  assert.equal(state.player.stamina, 100);
  await desktop.locator('#fullscreen-toggle').click();
  await waitFullscreen(desktop, false);
  record('Space activates sound/fullscreen buttons without triggering a combat evade');
  await desktop.close();

  const mobile = await openPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await mobile.locator('[data-start]').tap();
  await assertMobileLayout(mobile, 'portrait-390x844');
  record('Portrait 390×844 HUD and touch controls are visible, unclipped, and tappable');

  const cdp = await mobile.context().newCDPSession(mobile);
  const touchPoint = (point, id) => ({ x: point.x, y: point.y, id, radiusX: 6, radiusY: 6, force: 1 });
  const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  await freshEncounter(mobile);
  const guard = await center(mobile, '[data-guard]');
  const firstGuard = touchPoint(guard, 1);
  const secondGuard = touchPoint({ x: guard.x + 8, y: guard.y }, 2);
  await touch('touchStart', [firstGuard]);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().player.guardHeld);
  await touch('touchStart', [firstGuard, secondGuard]);
  // Chromium CDP ends the point(s) supplied here; retain the primary contact.
  await touch('touchEnd', [secondGuard]);
  assert.equal((await snapshot(mobile)).player.guardHeld, true, 'Secondary finger release must not clear primary guard');
  await touch('touchCancel', []);
  await wait(mobile, () => !window.__THOUSAND_FORMS__.snapshot().player.guardHeld);
  assert.equal(Boolean((await snapshot(mobile)).touchGuard), false);
  record('Emulated touch guard survives a secondary finger release and resets on cancellation');

  await freshEncounter(mobile);
  const stick = await center(mobile, '#joystick');
  const firstStick = touchPoint({ x: stick.x + stick.box.width * .25, y: stick.y }, 3);
  const secondStick = touchPoint({ x: stick.x - stick.box.width * .2, y: stick.y }, 4);
  await touch('touchStart', [firstStick]);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().joystick.x > .5);
  const owner = (await snapshot(mobile)).joystickPointer;
  await touch('touchStart', [firstStick, secondStick]);
  await touch('touchEnd', [secondStick]);
  state = await snapshot(mobile);
  assert.equal(state.joystickPointer, owner, 'Secondary finger must not steal joystick ownership');
  assert.ok(state.joystick.x > .5, 'Secondary finger release must not zero the primary joystick');
  await touch('touchCancel', []);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().joystickPointer === null);
  assertNeutral(await snapshot(mobile), 'Touch joystick cancel');
  record('Emulated joystick touch keeps primary ownership and cancellation clears movement');

  await freshEncounter(mobile);
  const pointerStick = await center(mobile, '#joystick');
  await mobile.mouse.move(pointerStick.x, pointerStick.y);
  await mobile.mouse.down();
  await mobile.mouse.move(pointerStick.x + pointerStick.box.width * .25, pointerStick.y);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().joystick.x > .5);
  await mobile.evaluate(() => {
    const owner = window.__THOUSAND_FORMS__.snapshot().joystickPointer;
    document.querySelector('#joystick').releasePointerCapture(owner);
  });
  // Force a browser pointer event so pending capture loss is processed.
  await mobile.mouse.move(pointerStick.x + pointerStick.box.width * .26, pointerStick.y);
  await wait(mobile, () => window.__THOUSAND_FORMS__.snapshot().joystickPointer === null);
  await mobile.mouse.up();
  assertNeutral(await snapshot(mobile), 'Lost pointer capture');
  record('Browser pointer-capture loss clears joystick ownership and movement');

  await mobile.setViewportSize({ width: 844, height: 390 });
  await assertMobileLayout(mobile, 'landscape-844x390');
  record('Landscape 844×390 HUD and touch controls remain visible, unclipped, and tappable');
  await cdp.detach();
  await mobile.close();

  assert.deepEqual(errors, [], 'No browser exceptions or failing requests');
  console.log(JSON.stringify({ status: 'PASS', checks, browserErrors: errors,
    scope: 'Automated Chromium Fullscreen API and emulated browser input; no physical-device certification.' }, null, 2));
} catch (error) {
  if (errors.length) console.error('Browser errors:', JSON.stringify(errors));
  for (const [index, page] of pages.entries()) {
    if (!page.isClosed()) {
      console.error(`Failure snapshot ${index}:`, JSON.stringify(await snapshot(page).catch(() => null)));
      await page.screenshot({ path: `${artifactDirectory}/failure-${index}.png` }).catch(() => {});
    }
  }
  throw error;
} finally {
  await browser.close();
}
