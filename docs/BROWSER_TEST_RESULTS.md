# Browser prototype: validation evidence

## Sprint, movement and courtyard rendering — 2026-11-25

- `npm test` passed 40 tests. Sprint cost and speed, diagonals, reversals, action interrupts, exhaustion and recovery passed across fixed-step schedules. Render samples advanced both actors between ticks, handled direct placements and resets, and followed the short arc through a turn. `npm run build` rebuilt the checked-in, self-contained WebGL game.
- `tests/sprint-browser.test.mjs` passed using keyboard input, real Chromium fullscreen and emulated touch at 390×844 and 844×390. The run covered speed and stamina, interrupting a sprint, pause and blur, and releasing the stick before walking again. No browser errors or failed requests surfaced.
- The integration replay won and restarted a sparring match, entered the boss encounter, and observed its windup. The final bundle passed all 9 third-person camera checks. Both fighters stayed framed at all 48 camera-perimeter placements. The rig diagnostic showed alternate foot plants, greater swing clearance, and a longer sprint stride. Screenshots were inspected from the playable camera.
- Chromium rendered the packaged game with external networking disabled and all local resources supplied from the distribution. WebGL uploaded the bundled panorama and the smaller reflection map. Sprint, attack and reset worked with zero browser errors. Managed Chromium blocks direct file navigation, so this run used a local web origin.
- Playwright and SwiftShader ran the browser checks. On an early build, concurrent software renderers exceeded a 15-second startup wait. The final renderer waits for sky lighting before the first draw, applies glossy reflection to wet slabs and metal, and scales down resolution on repeated slow frames. Camera and fullscreen tests wait for a rendered frame at startup. Hardware frame rate and physical-phone play were not measured.

## Gothic sanctuary and combat feel — 2026-11-25

`npm test` passed 26 fixed-step combat tests, including new checks for acceleration,
braking, enemy spacing, attack drive, recovery links, buffering and encounter reset.
`npm run build` produced the bundled local game. During integration, the Chromium
smoke replay won a sparring encounter, restarted, observed a boss windup, and
verified mobile joystick and strikes. `tests/third-person.test.mjs` passed 9 gates,
`tests/fullscreen.test.mjs` passed 11, and `tests/camera-perimeter.test.mjs`
kept both fighters in view at 48 placements. Phone coverage uses Chromium touch
emulation. The menu, boss tell and combat framing were reviewed in screenshots.

A fixed-camera comparison rendered the same boss pose with fighter instancing
on and off. Three.js reported **167 vs 240 draw calls**, with **64,756 triangles**
in both cases. The comparison isolates fighter batching in the updated scene.
It measures render work rather than device frame rate. Under sustained slow
frames, the game reduces 3D resolution while the HUD remains at native size.

## Third-person camera — 2026-11-19

The published bundle passed all 19 combat rule tests. `tests/third-person.test.mjs`
passed 9 Chromium checks covering lock-on, camera-relative strafing and evasion,
free orbit, touch cancellation, rotation and fullscreen. Screenshots and head/foot
projection checks confirmed full-body framing at spawn on desktop and two phone
orientations. `tests/fullscreen.test.mjs` passed all 11 fullscreen checks during
integration. Both browser suites recorded zero browser exceptions or failed requests.

Widening the shoulder offset initially pushed the player's chest off screen near
some pillars. When the camera arm retracts, it now turns toward both fighters.
`tests/camera-perimeter.test.mjs` checks the chest of each fighter against the
view bounds at 24 arena-edge positions in both portrait and landscape. All 48
placements passed. Phone input and rotation were tested with Chromium emulation.
Run the suites against `npm start` using the commands in `Browser/README.md`.

## Full-screen app update — 2026-11-13

The newer app source passed all **19 combat tests** and **11 Chromium browser
checks**, with no browser errors. Run the additional regression suite with:

```sh
PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright/index.mjs BROWSER_PATH=/usr/bin/chromium node tests/fullscreen.test.mjs
```

The checks cover real Fullscreen API entry/exit, canvas resizing and focus,
clearing held movement/guard, preserving pause through transitions, Escape to
exit and pause, keyboard activation of toolbar controls, rejected-request
fallback, portrait/landscape control bounds and taps, multi-touch ownership,
pointer cancellation, and lost capture. Touch tests use Chromium device
emulation; physical phones, installation, and other browser engines remain
unverified. The denied-request test deliberately simulates API rejection.

QA found a missing exported full-screen toggle, which was fixed before the final
passing run. Test synchronization and multi-touch event data were corrected to
match browser event behavior. The tested self-contained bundle includes that fix.

These changes shipped with the third-person camera update on 2026-11-19.

## Initial browser prototype — 2026-11-12

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
