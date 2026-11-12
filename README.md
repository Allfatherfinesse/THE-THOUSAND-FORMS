# THE THOUSAND FORMS

A standalone mythological dark-fantasy combat project. Read [AGENTS.md](AGENTS.md),
[game design](docs/GAME_DESIGN.md) and [roadmap](docs/ROADMAP.md) before changes.

**Phase 1 status: source prototype prepared; Unreal build and gameplay unverified.**
This checkout now contains a native UE5 project and engine-independent combat rules.
No Unreal installation was available in the preparation environment, so there is
no generated arena map, animation asset or packaged playable build yet. No roadmap
phase is complete. The exact engine version remains to be selected and validated.

## What is prepared

- Runtime graybox arena with third-person camera, lock-on and encounter reset.
- Three provisional styles: Muay Thai, Wing Chun and Taekwondo; six base attacks.
- Light/heavy attacks, guard/deflect, evade, stamina, posture, hit reactions,
  timed stance switching and a borrowed heavy attack from the next style.
- One sparring opponent and one boss, selected separately in the same arena.
  The boss repeats a visible light → heavy → hybrid pattern.
- HUD, primitive timing markers, input/state/impact logs and portable rule tests.

These are fictional game-balance experiments. The primitive shapes do not represent
finished or authentic martial arts animations. Unarmed actions are a temporary
prototype constraint; the production weapon direction remains undecided.

## Test the combat rules without Unreal

Requires Bash and a C++17 compiler (`g++` by default; override with `CXX`).

```sh
bash Tests/run_combat_tests.sh
SANITIZE=1 bash Tests/run_combat_tests.sh
```

The runner compiles into a temporary directory and removes it afterward. The host
suite currently contains 22 scenarios; it does not test Unreal collision, rendering
or gameplay. See [recorded evidence](docs/TEST_RESULTS.md) for the actual runs and
the local LeakSanitizer limitation. A GitHub Actions workflow runs these checks;
its presence alone is not evidence of a successful remote run.

## Build and open with Unreal Engine 5

Install a licensed UE5 editor and its supported native compiler/SDK on a Linux or
Windows machine. Python 3.9+ is required for this build driver. No engine or third-party
art is bundled. The engine association is intentionally empty; the driver invokes
the selected installation directly. Build settings follow that engine's defaults
until a successful version is recorded and pinned.

Set `UE_ROOT` to the directory containing `Engine`, for example:

```sh
# Linux: replace this path with your actual installation.
export UE_ROOT=/path/to/UnrealEngine
```

```powershell
# Windows PowerShell: replace this path with your actual installation.
$env:UE_ROOT = 'C:\path\to\UnrealEngine'
```

Run from the repository root, using `python` instead of `python3` if appropriate:

```sh
python3 Scripts/ue.py doctor
python3 Scripts/ue.py build
python3 Scripts/ue.py bootstrap
python3 Scripts/ue.py editor
```

`doctor` checks the actual engine version and tool paths. `build` compiles the
native editor module. `bootstrap` then creates `/Game/Maps/TrainingArena` with a
player start and lighting; the native game mode spawns the arena and opponents.
Existing maps are preserved. If bootstrap fails, inspect `Saved/Logs` and any
partially created map before retrying. `editor` opens the map; press **Play**.
The local version record is `Saved/Phase1Environment.json`. Commands fail with an
explicit error if an engine or prerequisite is missing.

Before committing generated `.umap`/`.uasset` files, install Git LFS and run
`git lfs install` in this checkout. LFS patterns are supplied in `.gitattributes`.
Keep engine files, build outputs, caches and editor saves out of Git.

| Input | Action |
| --- | --- |
| WASD / Mouse | Move / camera |
| LMB / RMB | Light / heavy |
| F press / hold / release | Deflect entry / guard / release |
| Space | Evade (movement direction, otherwise backward) |
| Q / E | Cycle style / next-style heavy hybrid |
| Tab | Toggle lock-on |
| 1 / 2 / R | Sparring / boss / reset current encounter |

After editor validation, package a local **Development** build:

```sh
python3 Scripts/ue.py package
```

Output goes to `Builds/Linux` or `Builds/Win64`. This command builds/cooks locally;
it does not distribute or deploy anything. No package has been produced here.

## Review and next gate

See the [technical design](docs/PHASE_1_TECHNICAL_DESIGN.md),
[acceptance checklist](docs/PHASE_1_ACCEPTANCE.md) and
[changelog](CHANGELOG.md). The next required gate is compiling in an installed UE5
editor, then observing the complete sparring/boss/reset loop. Animation, camera,
input latency and performance acceptance remain open.

Known prototype limitations: world positions are sampled once per rendered frame
even though both combat models share 120 Hz stepping; simultaneous impacts favor
the player; stalls beyond 250 ms are discarded by combat catch-up. There is no
navigation around interior obstacles, player-authored loadout UI, gamepad mapping,
save system, networking or finished animation. The arena interior is kept clear.
