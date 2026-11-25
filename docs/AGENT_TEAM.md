# Browser prototype agent team

The user requested actual agents and a browser-first experiment on 2026-11-12.
These were working subagent sessions, not just role descriptions. They completed
their bounded tasks during this run; no autonomous background work is claimed.

| Session | Role | Owned deliverable | Result |
| --- | --- | --- | --- |
| Lead (parent) | Integration and QA | Input/HUD/audio integration, bundling, browser replay, source handoff | Integrated and browser-tested |
| `combat_core` | Combat Engineer | `Browser/dist/combat.js`, `Browser/tests/combat.test.mjs` | 19 rule tests pass, including both encounter wins |
| `design_plan` | World and Animation Specialist | `Browser/dist/renderer.js` | Procedural arena, articulated poses, telegraphs and particles; screenshot feedback applied |
| `qa_review` | Interface and Controls Specialist | `Browser/dist/index.html`, `Browser/dist/style.css` | Responsive menus/HUD, touch controls, pause/results; DOM contract integrated |

For follow-up work, reuse these file boundaries and retain the common model API.
The lead owns native Sites registration/publication and source synchronization.
Add dedicated research, progression or world-design sessions when those features
enter scope. The current martial-arts labels describe fictional game experiments,
not complete disciplines or authentic technique demonstrations.
