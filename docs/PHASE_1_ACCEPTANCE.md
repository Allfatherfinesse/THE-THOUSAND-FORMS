# Phase 1 acceptance and reproducible QA

Status: acceptance plan, 2026-11-12. Unreal gameplay, editor compilation, packaging,
animation and performance checks have **not run** in this cloud workspace because
Unreal Engine is not installed. Portable rule tests can run independently; their
results do not establish engine or gameplay correctness. Record actual commands,
exit status and output in the implementation's test evidence before reporting pass.

## Evidence required for a test run

Record commit/branch, engine version, build configuration, operating system, CPU,
GPU, memory, display refresh rate, input device, resolution and scalability settings.
For each scenario record date, tester, pass/fail/blocked, reproducible steps, logs or
capture, and any defect. Use a packaged Development build for final measurements;
record separate editor results rather than substituting them.

Do not describe a test as passed because a matching code path exists. Host tests
prove only the rule outcomes actually asserted. Manual acceptance requires observed
game behavior. Failed or unrun checks remain visible.

## Host rule checks

Run the repository's host test instructions in the README. The rules suite should
exercise accepted and rejected action costs, attack phase boundaries, input buffer
expiry, guard release, front/rear defense, deflect and evade windows, interruption,
posture break, stamina recovery, stance transitions, hybrid selection, unique hits
per swing, death and complete reset. Compare equivalent elapsed-time partitions
where the rules support them, including timing boundaries.

Add regression tests for confirmed state/resource defects. Engine collision,
camera, movement and animation remain outside the host test's scope.

## Engine and gameplay scenarios

All rows start as **Not run**. Record evidence when executing them; do not infer pass
from source preparation. Repeat scenarios involving timing at capped 30, 60 and
120 fps, and during an induced hitch.

| ID | Reproducible action | Expected behavior / acceptance gate |
| --- | --- | --- |
| UE-01 | From a fresh checkout and selected UE5 installation, generate project files, compile editor/game targets and launch using README instructions. | No missing-module or asset error. Record the exact engine/toolchain. |
| LOOP-01 | Enter sparring mode, attack until victory, press R; lose deliberately and press R; repeat 10 times. | Both fighters return to valid spawn locations with full resources, cleared inputs/targets and an active encounter. No duplicate opponents or soft lock. |
| LOOP-02 | Switch 1 → 2 → 1 while idle, during an attack, after death and after victory. | Exactly one opponent remains; old timers, targets and input history cannot affect the new encounter. |
| INPUT-01 | From idle, press each action once; record input dispatch and the first accepted state/visible response. Repeat 30 times under stable frame pacing. | No dropped legal input. Target: accepted state within one simulation tick and visible state/pose feedback within two presented frames. Windup-to-impact is measured separately. |
| INPUT-02 | During recovery, enter one attack just before its legal transition; then enter an attack too early and wait beyond buffer expiry. Mash attack/stance/hybrid for 10 seconds. | Only the permitted short buffer is honored. No long queued combo, duplicate stamina charge, stale command after reset or stuck state. |
| HIT-01 | Land one attack while both actors remain overlapping for its active interval, then repeat with a new swing. | One damage application per target per swing; a later swing may hit again. |
| HIT-02 | Test just inside/outside each attack's reach, at either side, behind the attacker, across a wall and during windup/recovery. | Hits require active timing, permitted geometry and unobstructed path. No damage through walls or outside the attack volume. Record distance/facing boundaries. |
| DEF-01 | Hold guard while facing the same incoming attack; repeat with back turned; tap guard near impact; release before impact. | Frontal guard, rear hit, deflect-window hit and released guard resolve distinctly. Deflect interrupts the attacker; indefinite guard tapping cannot grant permanent protection. |
| DEF-02 | Evade early, on time and late against the same attack, then test wall-adjacent evasion. | Only the defined evade interval grants protection. Recovery is punishable; movement does not pass through floor/walls or persist after interruption/death. |
| RESOURCE-01 | Spend stamina with repeated actions; attempt an unaffordable action; stop spending. Force posture break on each fighter. | Resources stay within bounds. Rejected action does not charge. Recovery follows rules. Posture break has finite duration and cannot deadlock guard/attack input. |
| STYLE-01 | Perform light/heavy attacks and defensive actions in all three styles at fixed distances; observe poses and recorded timings. | Reach, timing, commitment and feedback show the intended distinctions. Placeholder-only poses cannot pass the final animation distinction gate. |
| HYBRID-01 | In each stance use E, then Q; repeat during windup, recovery, guard, low stamina and after taking a hit. | Borrowed attack comes from the next style, equipped stance is preserved until an accepted switch, costs occur once and every interruption returns to a legal state. |
| AI-01 | Reset sparring mode five times and reproduce the same spacing/inputs. | Slow, repeatable attack opportunities; no attack while dead/stunned or damage without an active attack. |
| BOSS-01 | Reset boss mode five times and reproduce the same spacing/inputs; evade each telegraph and punish recovery. | Recognizable pattern repeats. Boss follows the same hit/defense rules. No untelegraphed action or hidden input-reading; windup facing behavior leaves a fair dodge opportunity. |
| CAMERA-01 | Free look and lock-on at arena corners, beside walls, during evade, at close overlap and as the target dies or is replaced. | Camera remains usable without passing through walls; target loss clears safely. Controls and enemy telegraphs remain visible. |
| ANIM-01 | Interrupt every attack/stance/hybrid action with hit stun, posture break, death and reset; inspect blends at 30/60/120 fps. | No stuck montage, impossible transition, duplicate hit notify or root-motion escape. Requires actual animation assets; primitive feedback alone does not pass. |
| PERF-01 | After shader warm-up, capture a 120-second arena fight at a fixed resolution and scalability preset. Repeat three times. | Record frame-time p50/p95/p99, CPU/GPU time and hitches. Provisional target: 60 fps with p95 ≤16.7 ms on the selected test machine; no pass claim until hardware/settings are fixed. |
| BUILD-01 | Cook/package a Development build, launch outside the editor, run LOOP-01/02 and a full boss attempt. | Build launches without editor-only assets, missing modules or blocking crashes; controls and reset work. Archive build identity/logs. |

## Measurement notes

- Measure input-to-accepted-state from an instrumented timestamp, then compare with
  the first rendered feedback frame using a capture. This does not measure physical
  device-to-photon latency; that requires suitable external measurement equipment.
- Capture hit query geometry and combat state when investigating collisions. Do not
  infer animation accuracy from a successful geometric overlap.
- Use Unreal Insights or an equivalent engine capture for performance. Record shader
  compilation separately; investigate recurrent hitches during steady-state play.
- Treat the frame-rate targets as prototype budgets pending hardware selection.
  Document slower hardware results and tuning changes rather than hiding failures.
- Telegraph readability needs human playtesting. Record whether a player could name
  the cue, identify the safe response and reproduce the counter; timing alone is
  insufficient evidence of fair combat.

## Completion gate

Phase 1 is ready for review when a packaged, identified build completes the loop,
all blocking defects in the scenarios above are fixed, host regressions pass, input
and performance results are recorded, all three styles are visibly/mechanically
distinguishable, and hybrid transitions and boss counters remain reproducible.
Document remaining nonblocking issues and asset licenses. Until then, report source,
test and build progress separately and leave the roadmap phase incomplete.
