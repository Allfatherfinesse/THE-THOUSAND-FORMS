import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || undefined,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  await page.goto(process.env.GAME_URL || 'http://127.0.0.1:4173');
  const poses = await page.evaluate(async () => {
    const [{ createRenderer }, { Game }] = await Promise.all([import('./renderer.js'), import('./combat.js')]);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:400px;height:280px';
    document.body.append(canvas);
    const renderer = createRenderer(canvas);
    const game = new Game('boss');
    const poses = [];
    for (const aspect of ['landscape', 'portrait']) {
      if (aspect === 'portrait') {
        canvas.style.width = '200px';
        canvas.style.height = '370px';
        renderer.resize();
      }
      for (let i = 0; i < 24; i++) {
        const angle = i * Math.PI / 12;
        for (const [fighter, radius] of [[game.player, 8.4], [game.enemy, 6.7]]) {
          fighter.x = radius * Math.sin(angle);
          fighter.z = radius * Math.cos(angle);
        }
        renderer.resetCamera(game);
        const { player, enemy, obstructed } = renderer.cameraSnapshot(game);
        poses.push({ aspect, angle, player, enemy, obstructed });
      }
    }
    renderer.dispose();
    canvas.remove();
    return poses;
  });
  const inView = point => [point.x, point.y, point.z].every(value => Math.abs(value) < 1);
  assert.ok(poses.some(p => p.obstructed), 'Exercise the shortened camera arm at a pillar');
  for (const pose of poses) {
    assert.ok(inView(pose.player) && inView(pose.enemy), JSON.stringify(pose));
  }
  console.log(`Both fighters visible at ${poses.length} arena-edge placements.`);
} finally {
  await browser.close();
}
