import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// npm install --no-save playwright; or point PLAYWRIGHT_MODULE to an existing installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.GAME_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [];
const checks = [];
await mkdir('artifacts', { recursive: true });
const observe = page => {
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
};
const snapshot = page => page.evaluate(() => window.__THOUSAND_FORMS__.snapshot());
const waitState = (page, state) => page.waitForFunction(state => window.__THOUSAND_FORMS__.snapshot().player.state === state, state, { timeout: 15000 });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  observe(page);
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  assert.equal((await snapshot(page)).started, false);
  await page.screenshot({ path: 'artifacts/courtyard-menu.png' });
  checks.push('Desktop menu renders and assets load');
  // Software WebGL is used in CI; use a smaller viewport during long input replay.
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.locator('[data-start]').click();
  assert.equal((await snapshot(page)).started, true);

  const before = await snapshot(page);
  await page.keyboard.down('KeyD');
  await page.waitForFunction(before => {
    const p = window.__THOUSAND_FORMS__.snapshot().player;
    return Math.hypot(p.x - before.x, p.z - before.z) > .35;
  }, before.player);
  await page.keyboard.up('KeyD');
  checks.push('WASD moves the fighter');

  await page.keyboard.press('KeyJ');
  await page.waitForFunction(() => window.__THOUSAND_FORMS__.snapshot().player.attackSequence > 0);
  assert.ok((await snapshot(page)).player.stamina < 100);
  await waitState(page, 'idle');
  await page.keyboard.down('KeyF');
  await waitState(page, 'guard');
  await page.keyboard.up('KeyF');
  await waitState(page, 'idle');
  await page.keyboard.press('Space');
  assert.equal((await snapshot(page)).player.state, 'evade');
  await waitState(page, 'idle');
  checks.push('Attack spends stamina; guard release and evade work');

  await page.keyboard.press('Digit3');
  await page.waitForFunction(() => window.__THOUSAND_FORMS__.snapshot().player.style === 2);
  await waitState(page, 'idle');
  await page.keyboard.press('KeyE');
  const hybrid = (await snapshot(page)).player.attack;
  assert.equal(hybrid.kind, 'hybrid'); assert.equal(hybrid.style, 0);
  checks.push('Style selection and next-style hybrid work');

  await page.keyboard.press('KeyP');
  const paused = await snapshot(page);
  assert.equal(paused.paused, true);
  await page.waitForTimeout(450);
  assert.equal((await snapshot(page)).time, paused.time);
  await page.locator('[data-resume]').click();
  await page.keyboard.press('KeyR');
  assert.equal((await snapshot(page)).player.health, 100);
  assert.equal((await snapshot(page)).enemy.health, 100);
  checks.push('Pause freezes combat; restart restores encounter');

  // Fight through the actual keyboard/UI path, reading only the public QA snapshot.
  for (let tries = 0; tries < 600; tries++) {
    const s = await snapshot(page);
    if (s.result !== 'playing') break;
    const distance = Math.hypot(s.enemy.x - s.player.x, s.enemy.z - s.player.z);
    const lateTell = s.enemy.state === 'windup' && s.enemy.stateDuration - s.enemy.stateTime < .14;
    if (lateTell) await page.keyboard.down('KeyF');
    else await page.keyboard.up('KeyF');
    if (['idle', 'guard'].includes(s.player.state) && distance < 2.7 && s.player.stamina >= 27
        && ['idle', 'stun', 'recovery', 'broken'].includes(s.enemy.state))
      await page.keyboard.press('KeyK');
    if (tries % 100 === 0) console.log(JSON.stringify({ replay: tries, time: s.time, player: s.player.health, enemy: s.enemy.health, paused: s.paused }));
    await page.waitForTimeout(100);
  }
  const fought = await snapshot(page);
  assert.equal(fought.result, 'won', `Sparring replay ended: ${JSON.stringify({ time: fought.time, player: fought.player.health, enemy: fought.enemy.health, paused: fought.paused })}`);
  assert.equal(await page.locator('#result-overlay').isVisible(), true);
  await page.screenshot({ path: 'artifacts/courtyard-victory.png' });
  await page.locator('[data-restart]').click();
  assert.equal((await snapshot(page)).result, 'playing');
  checks.push('Sparring victory, result overlay and replay verified');

  await page.keyboard.press('KeyP');
  await page.locator('[data-return]:visible').click();
  await page.locator('[data-mode="boss"]').click();
  await page.locator('[data-start]').click();
  const boss = await snapshot(page);
  assert.equal(boss.mode, 'boss'); assert.equal(boss.enemy.maxHealth, 250);
  await page.waitForFunction(() => window.__THOUSAND_FORMS__.snapshot().enemy.state === 'windup', null, { timeout: 20000 });
  await page.screenshot({ path: 'artifacts/courtyard-playing.png' });
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'), 'false');
  checks.push('Boss selection, visible tell and sound toggle verified');
  await page.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  observe(mobile);
  await mobile.goto(baseURL, { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: 'artifacts/courtyard-mobile-menu.png' });
  await mobile.locator('[data-start]').tap();
  assert.equal(await mobile.locator('#joystick').isVisible(), true);
  await mobile.locator('[data-action="light"]').tap();
  assert.equal((await snapshot(mobile)).player.attackSequence, 1);
  await waitState(mobile, 'idle');
  const p0 = (await snapshot(mobile)).player;
  const box = await mobile.locator('#joystick').boundingBox();
  // Mouse-based pointer drag exercises the same pointer capture handlers as touch.
  await mobile.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await mobile.mouse.down();
  await mobile.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
  await mobile.waitForFunction(p0 => {
    const p = window.__THOUSAND_FORMS__.snapshot().player;
    return Math.hypot(p.x - p0.x, p.z - p0.z) > .25;
  }, p0, { timeout: 15000 });
  await mobile.mouse.up();
  await mobile.screenshot({ path: 'artifacts/courtyard-mobile-playing.png' });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
  checks.push('390px mobile layout, touch attack and joystick input verified');
  await mobile.close();
  assert.deepEqual(errors, [], 'No browser exceptions or failing asset requests');
  console.log(JSON.stringify({ status: 'PASS', checks, browserErrors: errors }, null, 2));
} finally {
  await browser.close();
}
