# THE THOUSAND FORMS — The Ashen Courtyard

A small, playable 3D browser combat experiment. Choose a sparring partner or the
Fractured Master, switch among three provisional disciplines and find your opening.
The fight takes place on damp flagstones beneath the torn standards of the Ashen Courtyard.

## Play

The private hosted game is at https://thousand-forms-ashen-courtyard.ezcookings.chatgpt.site.
The camera follows behind your fighter. Opponent lock starts on so you can circle
while keeping the other fighter in view. Press Tab or tap the target icon to
release the lock. Right-drag with a mouse or drag the open scene on touch to look
around. Movement and directional evades follow the current camera view.

Use the expand button at the top right for full-screen play.
Escape exits full screen and pauses. Changes of viewport/focus release held
controls; full-screen requests denied by an embedded browser show a fallback
message without stopping the game. The app manifest supports standalone launch
on platforms that offer Add to Home Screen. Physical-device installation has not
been verified.

Open `dist/index.html` in a current WebGL 2 browser. Its checked-in bundle runs
offline, including the scene and synthesized audio. No engine, account or server
is required for the downloaded copy. If your browser restricts local files, run
`npm start` and open `http://localhost:4173` instead.

Choose **Sparring** first, then **Enter the courtyard**. Hold **Shift** while moving
to sprint. You can close distance or circle under lock. Sprint spends 18 stamina
per second of movement. Once winded, your fighter can sprint again at 20 stamina.
Guarding, striking or evading takes priority over sprint.
You can queue a follow-up during recovery. The opponent also circles and retreats,
so step into range before committing. Amber ground markings show an incoming attack; evade or time your guard, then hit
during the opponent's recovery. Posture fills toward a vulnerable break. The boss
resists ordinary flinches during attacks; deflects and posture breaks interrupt it.

| Control | Action |
| --- | --- |
| WASD / arrows | Move relative to the screen |
| Hold either Shift while moving | Sprint |
| J / left mouse | Light strike |
| K / right mouse while locked | Heavy strike |
| F | Tap near impact to deflect; hold to guard |
| Space | Evade in movement direction, otherwise backward |
| 1 / 2 / 3 or Q | Select or cycle Muay Thai / Wing Chun / Taekwondo |
| E | Borrow the next style's heavy strike |
| Tab / target button | Toggle opponent lock |
| Right-drag / touch drag on the scene | Orbit in free camera |
| Escape / P | Pause; focus loss also pauses automatically |
| R | Reset the encounter |

On touch, tap **Sprint**, then move the joystick. Lift your thumb from the stick to return to walking on the next drag. Tap **Sprint** again to disarm it manually. The sound button
mutes original synthesized effects. Sound starts only after user interaction.

These actions are fictionalized gameplay, not demonstrations of authentic technique
or real-world effectiveness. Final classes, weapons and production art remain open.

## Development

Node 20+ is recommended. The only development dependency is the pinned bundler;
the playable files have no runtime network dependencies.

```sh
npm ci
npm test
npm run build
npm start
```

`dist/combat.js` contains deterministic 120 Hz rules. `renderer.js` builds the
procedural courtyard and articulated fighters in Three.js. `main.js` connects
keyboard, mouse/touch input, HUD, sound and encounter flow. Rebuild `game.bundle.js`
after changes to any JavaScript source. Keep the offline bundle in source control.

The rule tests cover defenses, sprint and exhaustion, buffering, range, posture,
hybrid actions, boss phases, frame-step consistency and wins in both encounters.
The optional browser test uses Playwright:

```sh
# Install Playwright separately if it is not already available.
GAME_URL=http://127.0.0.1:4173 node tests/browser-smoke.mjs
GAME_URL=http://127.0.0.1:4173 node tests/sprint-browser.test.mjs
GAME_URL=http://127.0.0.1:4173 node tests/fullscreen.test.mjs
GAME_URL=http://127.0.0.1:4173 node tests/third-person.test.mjs
GAME_URL=http://127.0.0.1:4173 node tests/camera-perimeter.test.mjs
```

`PLAYWRIGHT_MODULE` may name an existing installation and `BROWSER_PATH` may select
a system Chromium. Browser screenshots go to ignored `artifacts/`.

## Assets and limits

The game bundles an original generated storm panorama for the sky and reflections.
The fighters, courtyard architecture, surface maps, animation and sound are procedural. Three.js
0.170.0 is vendored under its MIT license at `dist/vendor/THREE-LICENSE.txt`; its
source distribution is https://www.npmjs.com/package/three/v/0.170.0. No downloaded
character art, animation packs, fonts, music or external APIs are required.

This toy has one arena and two encounter choices, no saves, progression or
multiplayer. Animation is procedural and timing is intentionally more forgiving
than the Unreal planning baseline. WebGL performance depends on the device;
software-rendered browser testing does not establish a hardware frame-rate target.
The standalone ZIP and Sites package are build outputs, not Unreal game packages.
