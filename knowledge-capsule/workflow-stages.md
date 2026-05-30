# LAMMPS Workflow Stages

This is a compact LAMMPS-only workflow capsule. It is intentionally smaller than the full local knowledge base.

## Stage Order

```text
WF-00 -> WF-R -> WF-01 -> WF-02 -> WF-03A -> execution -> WF-04 -> WF-05
```

## WF-00: Simulation Scheme Design

- Agent role: `lammps-simulation-architect`
- Output: `work/cases/<case-slug>/SIMULATION_SCHEME.md`
- Must define D1-D7: material, objective, thermodynamic conditions, boundary/size, loading/protocol, potential family, acceptance criteria.
- Gate: `lammps-reviewer` must return `PASS` before WF-01.

## WF-R: Simulation Reasoner Advisory

- Agent role: `lammps-simulation-reasoner`
- Output: `work/cases/<case-slug>/reasoner-assessment.md` or equivalent RESULT block.
- Purpose: evaluate physical reasonableness of D1-D7.
- Gate: advisory only. It does not replace reviewer gate.

## WF-01: Model Setup

- Agent role: `lammps-input-writer`
- Output: structure file and `.lammps-project/wf01.packet.json`.
- Required checks: provenance, atom counts, box, boundary, element/type mapping, conversion side effects.
- Gate: `lammps-reviewer` must return `PASS` before WF-02.

## WF-02: Potential Configuration

- Agent role: `lammps-input-writer`
- Output: potential files/config and `.lammps-project/wf02.packet.json`.
- Required checks: `pair_style`, `pair_coeff`, element order, potential source, atom style compatibility.
- Gate: `lammps-reviewer` must return `PASS` before WF-03A.

## WF-03A: Input Script Writing

- Agent role: `lammps-input-writer`
- Output: `in.*.lmp` and `.lammps-project/wf03a.packet.json`.
- Required checks: ensemble, timestep, thermo output, dumps, restart/output plan, validation steps, self-check.
- Gate: `lammps-reviewer` must return `PASS` before execution.

## WF-03B: HPC Branch

WF-03B is not a formal workflow stage. If HPC is requested, prepare the scheduler submission only after WF-03A has passed review.

## Execution

- Agent role: `lammps-executor` or equivalent runner.
- Output: `.lammps-project/runs/<run-id>.json`, `log.lammps`, stdout/stderr as available.
- On failure: classify root cause and route back to WF-01/WF-02/WF-03A, or WF-R for design-level suspicion.

## WF-04: Data Analysis

- Agent role: `lammps-data-analyst`
- Output: `.lammps-project/runs/<run-id>-analysis.json`.
- Required checks: parse log, inspect signals, validate every D7 criterion, compare key metrics to local/literature benchmarks when available, recommend rollback if needed.

## WF-05: Visualization And Post-Processing

- Agent role: `lammps-data-analyst` or visualization specialist.
- Output: figures/scripts under `work/cases/<case-slug>/figures/` or `renders/`.
- Required checks: figures must support WF-04 conclusions and be reproducible from saved scripts.

## Stage Gate Policy

- WF-00, WF-01, WF-02, WF-03A require review.
- `PASS`: advance.
- `REVISE`: return to producer with bounded fixes.
- `BLOCKED`: stop advancement and record issue.
- Three consecutive `REVISE` decisions for one stage become blocked.
