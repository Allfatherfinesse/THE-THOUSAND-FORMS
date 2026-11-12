# THE THOUSAND FORMS — The Ashen Courtyard

A small, playable 3D browser combat experiment. Choose a sparring partner or the
Fractured Master, switch among three provisional disciplines and find your opening.
This is a separate browser implementation; it does not certify the Unreal project.

## Play

Open `dist/index.html` in a current WebGL 2 browser. Its checked-in bundle runs
offline, including the scene and synthesized audio. No engine, account or server
is required for the downloaded copy. If your browser restricts local files, run
`npm start` and open `http://localhost:4173` instead.

Choose **Sparring** first, then **Enter the courtyard**. Move close enough to strike.
Amber ground markings show an incoming attack; evade or time your guard, then hit
during the opponent's recovery. Posture fills toward a vulnerable break. The boss
resists ordinary flinches during attacks; deflects and posture breaks interrupt it.

| Control | Action |
| --- | --- |
| WASD / arrows | Move relative to the screen |
| J / left mouse | Light strike |
| K / right mouse | Heavy strike |
| F | Tap near impact to deflect; hold to guard |
| Space | Evade in movement direction, otherwise backward |
| 1 / 2 / 3 or Q | Select or cycle Muay Thai / Wing Chun / Taekwondo |
| E | Borrow the next style's heavy strike |
| Tab | Toggle automatic opponent facing / mouse aim |
| Escape / P | Pause; focus loss also pauses automatically |
| R | Reset the encounter |

Touch devices have a movement pad and strike/guard/evade controls. The sound button
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

The 19 rule tests cover defenses, resources, buffering, range, posture, hybrid
actions, boss phases, frame-step consistency and actual wins in both encounters.
The optional browser test uses Playwright:

```sh
# Install Playwright separately if it is not already available.
GAME_URL=http://127.0.0.1:4173 node tests/browser-smoke.mjs
```

`PLAYWRIGHT_MODULE` may name an existing installation and `BROWSER_PATH` may select
a system Chromium. Browser screenshots go to ignored `artifacts/`.

## Assets and limits

The scene, geometry, interface, and sound are generated in this project. Three.js
0.170.0 is vendored under its MIT license at `dist/vendor/THREE-LICENSE.txt`; its
source distribution is https://www.npmjs.com/package/three/v/0.170.0. No downloaded
character art, animation packs, fonts, music or external APIs are required.

This toy has one arena and two encounter choices, no saves, progression or
multiplayer. Animation is procedural and timing is intentionally more forgiving
than the Unreal planning baseline. WebGL performance depends on the device;
software-rendered browser testing does not establish a hardware frame-rate target.
The standalone ZIP and Sites package are build outputs, not Unreal game packages.
