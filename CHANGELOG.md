# Changelog

## 2026-11-13 — Private app and full-screen source update

- Published the previously tested saved game as a private Sites app, following the
  user's request to play it like HIGH WATER. See `docs/APP_PUBLICATION.md`.
- Prepared an explicit full-screen button, standalone app manifest/icons, and
  input/focus/resize/pointer cleanup. Escape exits full screen and pauses; a denied
  fullscreen request leaves play available.
- New source upload is blocked by `sites_git_client_upgrade_required`. The live
  app remains saved version 1; the additional full-screen changes are not live.

## 2026-11-12 — Browser combat experiment

- Started actual combat, world/animation and interface subagent tasks; integrated
  their outputs into a standalone browser game.
- Added a procedural monastery courtyard, three playable styles, sparring and boss
  encounters, defensives, stamina/posture, stance/hybrid actions and animated cues.
- Added desktop/touch controls, pause/reset/result flow and synthesized sound.
- Added 19 rule tests, browser replay coverage, an offline bundle and documented
  build commands. See `docs/BROWSER_TEST_RESULTS.md` for evidence and limits.
- Kept the Unreal source preparation on its separate draft PR. No roadmap phase
  marked complete. Deployment remains subject to the repository approval rule.
