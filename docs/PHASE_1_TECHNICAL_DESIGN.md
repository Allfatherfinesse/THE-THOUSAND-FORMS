# Phase 1 combat prototype: technical design

Status: source preparation, 2026-11-12. This document defines a small, reviewable
prototype; it does not certify a playable build or complete Phase 1. The cloud
workspace has no Unreal Engine installation, so its engine version, editor
compilation, cooking, gameplay and performance remain unverified.

## Prototype boundary

Build one graybox training arena, a controllable fighter with three provisional
styles, a sparring opponent and one boss. Encounter selection reuses the arena;
only one opponent is active at a time. The loop is select opponent, fight, win or
lose, reset. Placeholder geometry and readable combat feedback support mechanical
experiments before animation production.

Unarmed actions are a temporary implementation constraint. Weapons, final starting
classes, production platforms and the exact UE5 version remain open decisions.
Progression, persistence, world exploration, multiplayer and adaptive boss learning
are outside this slice. No proprietary character packs or animations are assumed.

| Provisional style | Hypothesis to test | Deliberate tradeoff |
| --- | --- | --- |
| Muay Thai | Close-range attacks with strong posture pressure | Must commit at close range |
| Wing Chun | Quick combinations and defensive counter timing | Lower reach and damage per individual hit |
| Taekwondo | Longer attack reach and spacing | Greater commitment and resource cost |

These are game balance hypotheses, not complete descriptions of the disciplines or
claims about real-world effectiveness. Primitive poses are not authentic technique
demonstrations. Review terminology and movement references with knowledgeable
practitioners before naming or producing specific techniques. Judo remains a
candidate for later evaluation; throw and grapple systems are outside this slice.

## Implementation structure

| Layer | Responsibility |
| --- | --- |
| Portable combat rules (`Source/ThousandForms/CombatCore`) | State transitions, action timings, resources, guard/deflect/evade resolution, stance changes, hybrid action selection and per-swing hit bookkeeping |
| Unreal fighter adapter (`AThousandFormsCharacter`) | Input dispatch, character movement, camera, spatial hit queries and feedback; synchronize the portable rules with the world |
| Arena and encounter orchestration (`ATrainingGameMode`) | Spawn graybox geometry, player and selected opponent; reset the encounter without retaining combat state |
| Opponent behavior | Read distance and its own recovery state; choose from a bounded, visible attack sequence |
| HUD/debug feedback (`ATrainingHUD`) | Show style, health, stamina, posture, opponent state and controls; expose enough feedback to reproduce timing failures |
| Host tests (`Tests`) | Exercise deterministic combat rules without requiring the Unreal SDK |

The portable API is `CombatCore/CombatModel.h`. Keep rules independent of actors,
rendering and engine clocks. Unreal owns position, collision and actor lifetime.
The rules own whether an action is legal and its
resource effect. A hit query may nominate a target only during the active interval;
the same swing must not damage that target twice. Each encounter reset must clear
pending input, target references, swing history, resources and opponent timers. The
encounter manager advances both combat models at 1/120-second intervals before
resolving either fighter's hits. World positions remain sampled once per rendered
frame. Same-substep impacts use player-first interruption priority; attack trades
are deferred. Catch-up discards elapsed time beyond 250 ms. Spatial collision and
timing under low frame rates/hitches still require engine acceptance testing.

The initial `.uproject` and C++ source are preparation artifacts. Leave the engine
association unset until an installed UE5 version is selected and recorded. Validate
against that version before generating authored `.uasset`/`.umap` files. Runtime
graybox geometry avoids a dependency on an unverified binary art pipeline. The
editor bootstrap script creates the arena map only on a machine with Unreal
installed; no generated map or binary character asset is available in this workspace.

## Combat rules

Attacks proceed through windup, active and recovery. A new attack pays its stamina
cost once, when accepted. Recovery prevents unlimited attack cancellation. Guard,
evade, stance transition, hit stun, posture break and death have explicit states;
death remains terminal until an encounter reset. Durations and costs live beside
the rules so changes are testable and reviewable.

Initial attack tuning is below; `CombatModel.h` remains the authoritative source.
Range is measured from the attacker's center, in Unreal centimeters.

| Style / attack | Windup / active / recovery (s) | Stamina | Health / posture damage | Range (cm) |
| --- | --- | --- | --- | --- |
| Muay Thai light | 0.20 / 0.12 / 0.28 | 15 | 14 / 22 | 150 |
| Muay Thai heavy | 0.42 / 0.16 / 0.45 | 29 | 27 / 40 | 170 |
| Wing Chun light | 0.14 / 0.09 / 0.20 | 12 | 10 / 14 | 135 |
| Wing Chun heavy | 0.32 / 0.10 / 0.34 | 25 | 21 / 28 | 150 |
| Taekwondo light | 0.28 / 0.12 / 0.34 | 18 | 18 / 18 | 215 |
| Taekwondo heavy | 0.52 / 0.14 / 0.50 | 32 | 31 / 32 | 245 |

The input buffer holds at most one intent, expiring after 0.16 seconds; a newer valid
buffered request replaces the old one. Illegal requests must neither
silently charge stamina nor accumulate into a long automatic combo. Buffered input
expires; it must not replay after death or reset. Releasing guard cancels the held
guard intent. Repeated stance or hybrid requests must always return to an actionable
state after their documented recovery, even when stamina is insufficient.

Guard protects the front of the fighter. Guard entry offers a 0.10-second deflect
window (0.16 seconds for Wing Chun); success interrupts the attacker with 0.45
seconds of hit stun and gives readable feedback. Guard entry has a 0.35-second
rearm cooldown: entering during it still blocks but cannot deflect for that hold.
Holding guard cannot reopen its entry window when the cooldown expires. Sustained
guard trades incoming damage for stamina/posture pressure.
Evade invulnerability
covers only 0.08–0.30 seconds of the 0.48-second evade, which costs 20 stamina.
Posture accumulates toward a break threshold; lower is better. Posture break forces
a 1.10-second vulnerable state and recovers accumulated posture to the lesser of 35
or 35% of the threshold.
Ordinary hit stun lasts 0.28 seconds. Stamina and posture recovery are tuning hypotheses
to validate, not final game rules.

Stance switching cycles Muay Thai → Wing Chun → Taekwondo → Muay Thai with a
cost of 8 stamina and a 0.22-second transition; style changes only on completion.
The early hybrid action borrows the next style's heavy attack while preserving the
equipped stance, with 8 additional stamina cost and 0.10 seconds of extra recovery.
The core supports a selected secondary style; the initial Unreal control selects the
next style automatically. This is a constrained hybrid loadout experiment; a
player-authored technique/loadout editor is later work.

Spatial hit resolution must enforce active timing, reach, facing, visibility through
world geometry and one hit per target per swing. The source prototype uses a simple
geometric attack volume: a sphere sweep from the fighter forward to its attack
range, restricted by the attack's frontal cone and a world visibility check.
This is suitable for timing experiments but does not establish limb-accurate
collision. Production collision will use swept limb/socket
traces with traces enabled only during authored active frames.

## Arena, camera and opponents

Use a compact, bounded arena with sufficient space to test the longest attack,
evades, camera collision and disengagement. Start player and opponent separated and
facing each other. Spawn/reset must always place both above the floor and clear of
walls. A third-person spring-arm camera supports mouse free look and explicit
lock-on to the current opponent, with collision handling against arena geometry.
Lock-on must clear safely when its target disappears or dies.

The sparring opponent uses a slow, repeatable approach-and-attack loop so players can
practice guard entry, evade timing, recovery punishment and range. The boss uses a
fixed light → heavy → hybrid pattern with an additional visible telegraph before
each attack and visible recovery. It may have greater health, posture and damage,
but must follow the same hit acceptance and
defense rules as the player. Boss orientation should stop tracking early enough in
windup to make evasion meaningful. Establish the exact sequence from the source
before recording its QA replay.

The opponent must not inspect future input, react instantly to private player action
state, or use hidden habit learning. Any later adaptation needs a separate design
with observable triggers, bounded changes and counters.

## Controls

| Input | Action |
| --- | --- |
| WASD | Move |
| Mouse | Camera look |
| Left mouse button | Light attack |
| Right mouse button | Heavy attack |
| F press / hold / release | Enter deflect window / guard / release guard |
| Space | Evade |
| Q | Cycle stance |
| E | Hybrid: next style's heavy attack |
| Tab | Toggle lock-on |
| 1 / 2 | Select sparring / boss encounter |
| R | Reset current encounter |

Keyboard and mouse are the initial validation device. Gamepad mappings, remapping,
accessibility options and final camera tuning remain to be specified.

## Animation and presentation requirements

Primitive motion and state text are temporary visual aids. They cannot establish the
roadmap's final requirements for distinguishable discipline movement or animation
quality. Before declaring the vertical slice complete, provide:

- Locomotion, idle and facing transitions for each style, including lock-on strafing.
- Distinct windup, active and recovery poses for all six base attacks and borrowed
  heavy attacks, with collision windows synchronized to the animation.
- Guard entry/hold/exit, deflect success, evade and stance transition animations.
- Front/side hit reactions, posture break, death and restart behavior.
- A documented root-motion policy, interruption/cancel rules and transition tests
  at low frame rates; root motion must not move actors through arena boundaries.
- Telegraph and impact feedback that remains readable without relying on color alone.

Use state timing as the initial authority. When animation is introduced, nominate
one source of timing authority and test notify interruption/duplication; do not let
both montage notifies and the portable timer apply damage independently.

## Delivery sequence and gates

1. **Prepare source:** create the engine-independent rules, UE project scaffold,
   runtime arena, fighter adapter, opponent loop and controls. Run host rule tests
   and document their limits.
2. **Validate the engine:** record the installed UE version and toolchain; compile
   editor and game targets, open the project and fix engine/API discrepancies.
3. **Validate the loop:** run the manual scenarios in
   [PHASE_1_ACCEPTANCE.md](PHASE_1_ACCEPTANCE.md), including reset, collision,
   defensive timing, camera and deterministic boss behavior.
4. **Establish combat feel:** tune resource and timing hypotheses, introduce licensed
   animation placeholders, measure input response and compare all three styles.
5. **Package and review:** cook/package for the selected test platform, run the same
   smoke loop outside the editor, attach logs and build identity, and record remaining
   defects. Distribution/deployment requires explicit approval.

Source preparation and host tests do not satisfy the editor, animation or playable
build gates. No phase should be marked complete until its evidence exists.

## Asset and source-control policy

Keep code, configuration, test sources and design notes in Git. Track authored
`.uasset` and `.umap` files through Git LFS before the first binary asset commit;
verify LFS is installed and use locking where supported. Exclude engine binaries,
derived data, intermediates, saves and packaged outputs. Avoid binary asset edits in
parallel branches until ownership and merge/locking procedures are agreed.

Record every third-party asset's author, source URL, license, permitted uses and
attribution requirements in an asset manifest before importing it. Engine-provided
primitives remain subject to the Unreal license; do not copy or redistribute the
engine itself in this repository. Authored martial arts reference material also
requires an appropriate license or permission.
