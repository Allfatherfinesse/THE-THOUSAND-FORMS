# THE THOUSAND FORMS

A mythological dark-fantasy combat project. Read [AGENTS.md](AGENTS.md),
[game design](docs/GAME_DESIGN.md) and [roadmap](docs/ROADMAP.md) before changes.

## Play the browser experiment

[The Ashen Courtyard](Browser/README.md) is a playable 3D browser prototype with
three provisional styles, a sparring partner and a two-phase boss. It includes
attacks, deflect/guard, evade, stamina/posture, hybrid moves, touch controls,
procedural animation and synthesized sound.

Open `Browser/dist/index.html` in a WebGL 2 browser. If local files are restricted:

```sh
cd Browser
python3 -m http.server 4173 --directory dist
```

Then open `http://localhost:4173`. The game uses local assets only. See
[controls and build instructions](Browser/README.md) and
[verified test results](docs/BROWSER_TEST_RESULTS.md).

The browser prototype is separate from the UE5 source preparation in
[draft PR #1](https://github.com/Allfatherfinesse/THE-THOUSAND-FORMS/pull/1).
It does not establish an Unreal playable build or complete the original roadmap.

[Agent team and handoffs](docs/AGENT_TEAM.md)
