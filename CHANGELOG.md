# Changelog

## 2026-11-25 — Sprint and courtyard realism

- Hold either Shift key to sprint with camera-relative movement, or tap Sprint and drag the touch stick. A full sprint reaches 1.6× walking speed. Travel drains stamina and a winded fighter recovers before sprinting again.
- Both fighters now move between simulation ticks. Sprint builds through the gait and camera, with stronger footfalls at speed. Attacking, guarding and evading interrupt the run.
- Added a storm panorama and reflected sky light, damp beveled flagstones, carved arch joints, torn heraldic standards and glowing braziers. Reshaped the fighters and added material detail to their armor and clothing.

## 2026-11-25 — The ruined sanctuary

- Rebuilt the Ashen Courtyard as a ruined Gothic sanctuary with an eclipsed sky, pointed arches, carved masonry, and an engraved fighting floor. The Seeker and the Master now wear layered cloth and tarnished armor.
- Added responsive footwork, attack weight transfer, late follow-ups and directional dodge deceleration. The opponent circles at range, backs away when crowded, and plants before committing. Locomotion, attack poses and reactions follow the fighters’ combat timing.
- Differentiated strike, block and deflect audio, made impact pauses independent of frame boundaries, and reduced rendering work with instanced fighter parts and adaptive canvas resolution.

## 2026-11-19 — Third-person combat camera

- Published shoulder-view combat, opponent lock and free orbit in the existing private app. The update also delivers the previously prepared fullscreen controls.
- Movement and directional evasion follow the camera. The camera pulls forward at arena pillars and keeps both fighters framed.

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
