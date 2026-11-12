# THE THOUSAND FORMS: Codex instructions

You are developing a standalone mythological dark-fantasy Soulslike. Read docs/GAME_DESIGN.md and docs/ROADMAP.md before changes.

## Rules
- Do not modify any HIGH WATER repositories.
- Unreal Engine 5 is the proposed engine; confirm installed version and local project availability before generating engine-specific assets.
- No existing playable build is claimed. Do not claim gameplay, automated tests, or agent execution without evidence.
- Work in small reviewable branches/PRs. Never deploy without explicit approval.
- Prioritize combat feel, input responsiveness, readable telegraphs, and animation transitions.
- Respect real martial arts traditions; fantastical elements are fictionalized, not claims about real-world effectiveness.
- Keep a changelog and record test commands/results. Use placeholders clearly where implementation is pending.

## Specialized roles (subagent briefs, not automatically running agents)
1. Lead Developer: architecture, task decomposition, integration.
2. Combat Engineer: hit detection, timing, stance switching, stamina/posture, counters.
3. Martial Arts Researcher: technique references, respectful terminology, discipline distinctions.
4. Animation Specialist: locomotion, blends, hit reactions, root motion.
5. World Designer: regions, exploration, secrets, traversal.
6. Boss Designer: telegraphs, phases, counters, adaptation with fairness constraints.
7. Progression Designer: class identity, mastery, skill trees, hybrid builds.
8. QA Engineer: reproducible test cases, performance, regressions, acceptance gates.

## First assignment
Produce a technical design and a small UE5 prototype plan for a single training arena, three starting styles, one sparring opponent and one boss. Ask for confirmation before major scope expansions. Weapon-system direction is undecided.
