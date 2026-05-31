# AutoLammps-Skill

AutoLammps Skill packages a LAMMPS-specific agent workflow for Claude Code and Codex-style coding agents.

## Quick Start

### Claude Code

1. Put this whole folder in your Claude Code skills directory.
2. Keep the folder layout unchanged: `SKILL.md`, `templates/`, `knowledge-capsule/`, and `scripts/` must stay together.
3. In Claude Code, ask for a LAMMPS task such as: `Use the lammps-agent-workflow skill to review this input script`.
4. For review gates, Claude Code should write a review JSON and run the gate automatically:

```bash
node scripts/autolammps-gate.js validate <stage>.review.json <project-root>
```

### Codex

1. Copy `AGENTS.md` from this folder into your LAMMPS project root.
2. Also copy `templates/`, `knowledge-capsule/`, and `scripts/` into the same project, for example under `.codex/lammps-agent-workflow/` or directly in the repo root.
3. If your project already has an `AGENTS.md`, append this file's content instead of replacing your existing instructions.
4. Start Codex with a LAMMPS task and explicitly mention the workflow, for example: `Follow AGENTS.md and run WF-00 to WF-03A with reviewer gates`. Codex should run the bundled gate script itself before advancing.

### Recommended Minimal Layout In A Target Project

```text
your-lammps-project/
  AGENTS.md                         # for Codex
  .codex/lammps-agent-workflow/      # optional location for support files
    templates/
    knowledge-capsule/
    scripts/
```

For Claude Code, the skill folder itself is the unit you install; for Codex, `AGENTS.md` is the instruction file and the other directories are supporting references.

## Contents

- `SKILL.md`: Claude Code skill entrypoint.
- `AGENTS.md`: Codex/repo-local instruction entrypoint.
- `INSTALL.md`: step-by-step installation and usage guide.
- `templates/`: minimal project state, packet, review, and analysis templates.
- `knowledge-capsule/`: small LAMMPS safety and workflow rule capsule.
- `knowledge-capsule/test-cases/`: tiny synthetic review fixtures for gate testing.
- `scripts/autolammps-gate.js`: no-manual wrapper for installing, scanning, and validating gates.
- `scripts/validate-review-result.js`: low-level mechanical evidence validator.

## Scope

This skill is only for LAMMPS work:

- simulation scheme design
- model setup
- potential configuration
- LAMMPS input writing and review
- LAMMPS execution and repair
- log/data analysis
- visualization/post-processing
- HPC handoff after WF-03A
- paper-reproduction preparation for LAMMPS cases

It intentionally does not provide a generic software engineering workflow.

## Installing For Claude Code

Copy this directory into a Claude Code skills directory, or copy `SKILL.md` plus the bundled `templates/`, `knowledge-capsule/`, and `scripts/` files into your preferred skill location. Do not install only `SKILL.md`; the templates and evidence-gate script are part of the skill.

## Installing For Codex

Copy `AGENTS.md` into the target LAMMPS project root, or merge it into the existing `AGENTS.md`. Keep `templates/`, `knowledge-capsule/`, and `scripts/` nearby so the agent can reference them. Codex does not need `SKILL.md`, but keeping it in the repository is useful for Claude Code users.

## Evidence Gate Design

The evidence system should not rely only on prompt instructions. This skill therefore includes an embedded mechanical gate:

1. Reviewer writes a JSON result using `templates/review-result.json`, usually named `<stage>.review.json`.
2. Agent runs `scripts/autolammps-gate.js validate <stage>.review.json <project-root>`.
3. The gate writes `<review-json>.gate.json`.
4. Coordinator accepts `PASS` only if the sidecar says `ok: true`.

The script checks the structural parts that prompts often miss: mandatory check coverage, triggered evidence, failed blockers, high-risk dual evidence, command-level manual evidence, and local path existence. The user should not have to run this manually during normal use.

## Knowledge Protection

The bundled knowledge capsule is deliberately small. It contains only the minimum safety rules needed to prevent common high-cost LAMMPS failures. It does not include full local case libraries, paper notes, or long historical memory files.

When a target repo has a valuable local KB, cite paths and extract only the needed rule. Do not paste the full KB into prompts or reports.

The `test-cases/` subdirectory contains only synthetic miniature fixtures. They are for review examples and validation tests, not production simulations.

## Recommended Case Layout

```text
work/cases/<case-slug>/
  SIMULATION_SCHEME.md
  in.<case>.lmp
  log.lammps
  figures/
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

## Core Rule

Generated LAMMPS scripts are drafts. WF-00, WF-01, WF-02, and WF-03A must pass review before advancing.
