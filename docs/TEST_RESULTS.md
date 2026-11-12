# Phase 1 preparation: validation evidence

Date: 2026-11-12. Branch: `codex/phase-1-combat-prototype`.
Host compiler: `g++ (Debian 14.2.0-19) 14.2.0`; Linux cloud workspace.
This records source preparation checks, not Unreal gameplay acceptance.

| Command / check | Observed result |
| --- | --- |
| `bash Tests/run_combat_tests.sh` | Exit 0; `PASS: 22 combat core scenarios (no Unreal runtime validation).` Compiled C++17 with warnings as errors. |
| `ASAN_OPTIONS=detect_leaks=0 SANITIZE=1 bash Tests/run_combat_tests.sh` | Exit 0; same 22 scenarios pass with AddressSanitizer and UndefinedBehaviorSanitizer. |
| `SANITIZE=1 bash Tests/run_combat_tests.sh` (combat subagent's initial run) | LeakSanitizer reported that it cannot operate under ptrace in this sandbox. Leak detection was disabled explicitly for the successful sanitizer run above; leak checking is not claimed. |
| `python3 -m py_compile Scripts/ue.py Scripts/bootstrap_arena.py` | Exit 0; Python syntax only, no Unreal Python API execution. |
| `python3 Scripts/ue.py --help` | Exit 0; command interface available. |
| `git diff --cached --check` | Exit 0; staged source and documentation have no whitespace errors. |
| `python3 Scripts/ue.py doctor` | Exit 1 as expected: `Unreal Engine is not configured. Set UE_ROOT to an installed UE5 root (the directory containing Engine).` |
| Unreal discovery | No Unreal editor on PATH; no `Build.version`, `.uproject` or editor binary found in checked installation/workspace locations before source creation. No installed UE version established. |

The scenario source is `Tests/CombatCoreTests.cpp`; it exercises timing, buffering,
resource costs, recovery, guard/rearm/deflect, evade windows, posture break,
switching/hybrid actions, per-swing uniqueness, death/reset and boundary partitioning.
Standalone tests neither include nor link Unreal headers or libraries.

## Source review and subagent evidence

Three actual sessions ran during preparation: `combat_core` implemented and tested
the portable rules; `design_plan` prepared design/acceptance documents and flagged
deflect reentry abuse; `qa_review` ran the rules suite and reviewed/fixed Unreal
integration. These sessions completed their assigned work; they are not persistent
background workers. The lead integrated their files and reran the host checks.

Review fixes include a constructor reference for the cooked arena cube, a precise
center-distance hit range gate, action-specific enemy approach distances, latched
evade direction, shared post-physics combat stepping and removal of obstacles that
the simple opponent cannot navigate. These are source reviews, not observed engine
passes. Staged whitespace validation passed before the review commit.

## Unrun and remaining gates

- UnrealHeaderTool/native UE compilation, editor launch and bootstrap execution.
- Actual collision, camera, movement, input response, combat feel and boss fairness.
- Licensed animation, transitions and distinct discipline presentation.
- Cooking, packaging, executable smoke tests and hardware performance measurement.
- Remote GitHub Actions execution unless separately evidenced on the pull request.

The adapter advances both rule models at 120 Hz but queries frame-sampled world
positions. Same-substep impacts resolve player first; attack trades are not modeled.
Combat catch-up drops time beyond a 250 ms stall. These limits must be evaluated in
the low-frame-rate/hitch scenarios before any responsiveness or hit consistency
gate passes. Use `PHASE_1_ACCEPTANCE.md` to record the engine-equipped follow-up.
