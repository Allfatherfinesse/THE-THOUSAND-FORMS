# Browser prototype: validation evidence

Date: 2026-11-12. Work: `codex/browser-combat-prototype`.
Node v24.19.0; Chromium using software WebGL/SwiftShader in the cloud environment.

## Completed

- `npm test` in `Browser/`: **19 tests passed**. Coverage includes resources,
  attacks, single-hit resolution, guard/deflect rearm, evade windows, buffering,
  posture, stance/hybrid actions, boss armor/phase, reset, 30/120 Hz equivalence,
  arena bounds and wins in both encounters using visible tells/recovery openings.
- `node --check dist/main.js`, `dist/renderer.js`, `dist/audio.js` and
  `dist/combat.js`: syntax checks passed.
- `npm run build`: pinned esbuild 0.25.12 produced the self-contained browser bundle.
- `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright/index.mjs BROWSER_PATH=/usr/bin/chromium node tests/browser-smoke.mjs`:
  **passed**, with no browser exceptions or failing asset requests.

The browser test observed the desktop menu, movement, attack stamina costs, guard
release, evade, switching, next-style hybrid, pause freezing time, reset, an actual
sparring victory via keyboard input, its result overlay and replay, boss selection
and windup tell, sound toggling, and the 390px mobile layout/touch attack/joystick.
Screenshots were inspected. Desktop victory replay used a smaller viewport because
software rendering is slow; this is not a hardware performance benchmark.

## Fixes and limitations

Initial rendering reported only a missing favicon; a local seal asset fixed it.
The first full-fight replay used unguarded heavy spam and failed to win within its
budget. The successful replay follows visible telegraphs, deflects and recovery
openings; this is not evidence every attack-spam strategy wins. Screenshot review
led to brighter fighters, closer gameplay framing and batched static geometry.

The downloaded copy is bundled without runtime imports or remote assets. Direct
`file://` navigation could not be tested in managed Chromium: it returned
`ERR_BLOCKED_BY_ADMINISTRATOR`. No browser policy was changed. The documented local
HTTP route and browser bundle were tested successfully. Audio controls/events were
tested; audible output and real phone hardware remain unverified.

The browser experiment is intentionally separate from Unreal compilation,
animation imports and packaging. No Unreal build or original roadmap completion
is inferred from these results. Hosting state is reported separately from tests.
