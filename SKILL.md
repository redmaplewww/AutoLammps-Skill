---
name: lammps-agent-workflow
description: Use this skill for LAMMPS simulation work that needs staged planning, model setup, potential configuration, input writing, evidence-gated review, execution repair, analysis, visualization, HPC handoff, or paper-reproduction preparation. This is LAMMPS-specific and must not be generalized into a generic coding workflow.
---

# LAMMPS Agent Workflow

This skill runs the repository's LAMMPS-specific staged workflow in Claude Code or compatible coding agents. It preserves the current CLI design: specialist roles, WF-00 through WF-05 stage order, reviewer gates, evidence records, project state files, and bounded repair loops.

Do not abstract this into a generic state machine. Every rule below is for LAMMPS simulation work.

## When To Use

Use this skill when the user asks for any of the following:

- design a LAMMPS simulation scheme
- build an atomic model or convert/source a structure
- choose or configure a LAMMPS potential
- write or modify an `in.*.lmp` input script
- review, debug, or repair LAMMPS inputs
- run LAMMPS locally or prepare an HPC submission
- analyze `log.lammps`, dumps, trajectories, or run-result artifacts
- generate MD plots, OVITO visualizations, or final simulation reports
- audit a paper before LAMMPS reproduction

## Required Operating Principle

Treat all generated LAMMPS artifacts as drafts until reviewed. For WF-00, WF-01, WF-02, and WF-03A, do not advance unless the review gate returns `PASS`.

If the host environment supports subagents, delegate by role. If it does not, simulate the same roles in separate sections, write the same stage artifacts, then perform an explicit reviewer pass before moving on.

## Role Map

Use these roles exactly; do not merge producer and reviewer judgment.

| Role | Responsibility | May advance stage? |
| --- | --- | --- |
| `lammps-coordinator` | Owns state, routes work, summarizes RESULT blocks, updates `.lammps-project/` | Yes, after gate PASS |
| `lammps-simulation-architect` | Writes WF-00 `SIMULATION_SCHEME.md` with D1-D7 | No |
| `lammps-simulation-reasoner` | Advisory physical reasonableness check after WF-00 or during repair | No |
| `lammps-input-writer` | Produces WF-01 structure, WF-02 potential config, WF-03A input script | No |
| `lammps-reviewer` | Evidence-gated review for WF-00/WF-01/WF-02/WF-03A | Returns PASS/REVISE/BLOCKED |
| `lammps-executor` | Runs LAMMPS, captures logs, classifies recoverable failures | No |
| `lammps-data-analyst` | WF-04 analysis, D7 validation, rollback recommendation, WF-05 trigger | No |
| `lammps-case-librarian` | Retrieves closest local examples and minimal reusable rules | No |
| `lammps-paper-researcher` | Retrieves paper evidence when paper context is needed | No |

## LAMMPS Stage Order

Follow this order for full workflows:

```text
WF-00 Simulation Scheme Design
  -> lammps-reviewer gate
  -> WF-R Simulation Reasoner advisory
WF-01 Model Setup
  -> lammps-reviewer gate
WF-02 Potential Configuration
  -> lammps-reviewer gate
WF-03A Input Script Writing
  -> lammps-reviewer gate
Execution
  -> run-result / repair classification
WF-04 Data Analysis
  -> D7 validation / rollback recommendation
WF-05 Visualization / Post-processing
```

WF-03B is not a separate stage. It is an optional HPC branch after WF-03A receives `PASS`.

## Workflow Modes

Default to `autonomous-escalation`: proceed without asking for low-risk choices, but stop for missing user files, irreversible actions, expensive external runs, or unresolved product-defining ambiguity.

For explicit `workflow-auto` requests, never ask questions; infer safe defaults, record assumptions, downgrade confidence when evidence is weak, and produce a final report.

## State Files

For complex or multi-turn cases, initialize or maintain:

```text
work/cases/<case-slug>/
  SIMULATION_SCHEME.md
  versions/vNNN-<label>/
  inputs/{raw,structures,potentials,scripts}/
  outputs/{logs,dumps,data}/
  reports/
  figures/
  manifests/
  .lammps-project/
    state.md
    decisions.md
    review-log.md
    open-issues.md
    work-log.md
    wf01.packet.json
    wf02.packet.json
    wf03a.packet.json
    runs/
```

Use `versions/vNNN-<label>/` for distinct scheme, potential, structure, or protocol attempts. Keep user/raw inputs, generated inputs, runtime outputs, reports, figures, and provenance manifests in their categorized folders; do not place new calculation artifacts in the repository root or `work/` top level.

Update `.lammps-project/state.md` after every stage transition. Append key decisions to `.lammps-project/decisions.md`. Append reviewer gate results to `.lammps-project/review-log.md`.

## Evidence Gate Is Automatic

Prompt instructions alone are not enough for evidence quality. The gate is embedded into the workflow and must be run by the agent, not by the user.

1. **Reviewer judgment**: reviewer must inspect artifact, mandatory checks, and evidence references.
2. **Mechanical validation**: before accepting reviewer `PASS`, run the bundled gate script.
3. **Sidecar proof**: the gate writes `<review-json>.gate.json`; coordinator accepts `PASS` only when the sidecar has `ok: true`.

Default command:

```bash
node scripts/autolammps-gate.js validate <stage>.review.json <project-root>
```

If the skill is installed inside another directory, use that script path. Do not ask the user to run it. Run it yourself before reporting `PASS`.

For batch checking a project:

```bash
node scripts/autolammps-gate.js scan <project-root>
```

If scripts cannot run, manually verify every item in the Mechanical Evidence Gate checklist below and mark confidence no higher than `medium`.

Mechanical Evidence Gate checklist:

- `decision` is exactly `PASS`, `REVISE`, or `BLOCKED`.
- `mandatory_check_results` includes MB-001 through MB-007.
- Every triggered MB check has an evidence item.
- `PASS` is forbidden if any triggered MB check has `passed: false`.
- High-risk reviews include dual evidence: at least one manual/correction source plus at least one case/memory/local source.
- Semantic command changes cite manual/correction evidence when touching `pair_style`, `pair_coeff`, `fix`, `compute`, `delete_atoms`, `atom_style`, `boundary`, `kspace_style`, or `timestep`.
- Referenced local evidence paths exist, or remote URLs are explicitly marked remote.
- `confidence` is `high`, `medium`, or `low` and matches evidence strength.

## Mandatory Checks

Load `knowledge-capsule/mandatory-checks.md` before every WF-00, WF-01, WF-02, and WF-03A review. These checks are blockers when triggered and violated.

The compact blocker list is MB-001 through MB-007:

- MB-001 engineering strain L0 freeze
- MB-002 fixed/frozen atoms must not receive broad initial velocities
- MB-003 `fix npt` must not compete with `fix deform` in the same direction
- MB-004 ReaxFF must use charge-capable atom style and QEq
- MB-005 `fix print` equal-style variables must use safe syntax
- MB-006 ReaxFF `pair_coeff` element names must match data atom types and ffield entries
- MB-007 restart/data provenance must be verified

## Stage Rules

### WF-00 Simulation Scheme Design

Write `SIMULATION_SCHEME.md` using D1-D7:

- D1 material system
- D2 objective
- D3 thermodynamic conditions
- D4 boundary and size
- D5 loading/protocol
- D6 potential family
- D7 acceptance criteria

Each D item needs assumptions, risk, and evidence pointers. After review PASS, run WF-R advisory before WF-01.

### WF-01 Model Setup

Produce structure files and `.lammps-project/wf01.packet.json`. Verify provenance, atom counts, box dimensions, element/type mapping, boundary assumptions, and whether model conversion changed type order.

### WF-02 Potential Configuration

Produce `.lammps-project/wf02.packet.json`. Record `pair_style`, potential files, exact `pair_coeff`, element mapping, evidence refs, and known risks. Do not invent potentials from memory when local examples or official docs should be checked.

### WF-03A Input Script Writing

Produce `in.*.lmp` and `.lammps-project/wf03a.packet.json`. Include thermo output, dumps, restart/output plan, validation steps, and writer self-check. Review must pass before execution.

### Execution

Run only after WF-03A `PASS`. Save run metadata in `.lammps-project/runs/<run-id>.json`. On failure, classify the root cause, then route back to WF-01/WF-02/WF-03A or WF-R if design-level.

### WF-04 Analysis

Analyze logs and outputs against D7, not merely exit code. Write `.lammps-project/runs/<run-id>-analysis.json` with metrics, signals, failure modes, confidence, literature/local comparison, and rollback recommendation.

### WF-05 Visualization

Generate figures only after analysis identifies what should be visualized. Use scalar color maps only for field evidence and save reproducible scripts alongside figures.

## REVISE And BLOCKED Rules

- `PASS`: coordinator may advance.
- `REVISE`: route back to producer with bounded fixes.
- `BLOCKED`: stop advancement and record blocker in `open-issues.md`.
- Three consecutive `REVISE` results for the same stage become `blocked-by-review-loop`.

## Knowledge Use Policy

The bundled `knowledge-capsule/` is intentionally small. It contains only non-negotiable stage and safety knowledge. If the target repo has a richer local KB, use it as evidence by path, but do not copy it wholesale into prompts or reports.

The bundled `knowledge-capsule/test-cases/` directory contains a few synthetic fixtures for reviewer-gate testing. Use them as minimal examples of safe and unsafe patterns, not as validated production simulations.

Use this evidence ladder:

1. target artifact and user-provided files
2. bundled `knowledge-capsule/`
3. bundled synthetic fixtures in `knowledge-capsule/test-cases/` when testing the gate or demonstrating a pattern
4. local `knowledge/rules/`, `knowledge/templates/`, `knowledge/memory/confirmed-lessons.md`
5. local `knowledge/cases/raw/` or `work/cases/` closest examples
6. official LAMMPS docs / OpenKIM / potential docs
7. literature or paper notes
8. engineering default, only with explicit risk and confidence penalty

## Final Reporting

Report stage, decision, key artifacts, and next step. Do not paste full scripts, logs, or full evidence chains unless the user explicitly asks.
