# Install And Use Guide

This guide explains how to use AutoLammps Skill with Claude Code and Codex.

## What This Skill Does

AutoLammps Skill gives an agent a LAMMPS-specific workflow:

```text
WF-00 scheme -> WF-R reasoner -> WF-01 model -> WF-02 potential -> WF-03A input -> execution -> WF-04 analysis -> WF-05 figures
```

WF-00, WF-01, WF-02, and WF-03A require reviewer gates. The skill includes a small evidence validator so a `PASS` review is not just prompt-based.

## Install For Claude Code

Claude Code skills are folder-based. Keep this folder intact.

Recommended layout:

```text
<claude-skills-dir>/
  lammps-agent-workflow/
    SKILL.md
    README.md
    INSTALL.md
    templates/
    knowledge-capsule/
    scripts/
```

Steps:

1. Copy the whole `lammps-agent-workflow` folder into your Claude Code skills directory.
2. Restart or reload Claude Code if needed.
3. Ask Claude Code to use it explicitly:

```text
Use the lammps-agent-workflow skill. Build a LAMMPS workflow for <your task> and enforce reviewer gates.
```

For an existing input script:

```text
Use the lammps-agent-workflow skill to review in.mycase.lmp. Write review-result.json and run the evidence validator before saying PASS.
```

## Install For Codex

Codex usually reads repository instructions from `AGENTS.md`.

Recommended target project layout:

```text
your-lammps-project/
  AGENTS.md
  .codex/lammps-agent-workflow/
    templates/
    knowledge-capsule/
    scripts/
```

Steps:

1. Copy this skill's `AGENTS.md` into your project root as `AGENTS.md`.
2. If your project already has `AGENTS.md`, append this skill's `AGENTS.md` instead of overwriting existing project rules.
3. Copy `templates/`, `knowledge-capsule/`, and `scripts/` into `.codex/lammps-agent-workflow/` or another stable path.
4. Tell Codex where the support files are if they are not next to `AGENTS.md`:

```text
Follow AGENTS.md. The LAMMPS workflow support files are in .codex/lammps-agent-workflow/.
```

Example prompt:

```text
Follow AGENTS.md and use the LAMMPS WF-00 to WF-03A workflow. Create a simulation scheme, model setup packet, potential packet, input script, and reviewer JSON. Run the evidence validator before advancing.
```

## Evidence Validator

The validator checks review JSON files.

Run from a repository that contains this skill:

```bash
node scripts/validate-review-result.js <review-result.json> <project-root>
```

Example:

```bash
node scripts/validate-review-result.js templates/review-result.high-risk-pass.example.json .
```

The validator rejects invalid `PASS` results when mandatory checks are missing, triggered checks lack evidence, high-risk reviews lack dual evidence, semantic command changes lack manual/correction evidence, or local evidence paths do not exist.

## Minimal Case Layout

For real LAMMPS projects, ask the agent to keep files under:

```text
work/cases/<case-slug>/
  SIMULATION_SCHEME.md
  in.<case>.lmp
  log.lammps
  .lammps-project/
    state.md
    decisions.md
    review-log.md
    open-issues.md
    wf01.packet.json
    wf02.packet.json
    wf03a.packet.json
    runs/
```

## Important Notes

- The bundled test cases are synthetic fixtures for review testing, not production simulations.
- The bundled knowledge capsule is intentionally small; it does not replace your full local LAMMPS knowledge base.
- If you have a valuable local KB, tell the agent to cite paths and extract only necessary rules, not paste the whole KB.
