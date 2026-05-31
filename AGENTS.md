# LAMMPS Agent Workflow Instructions

These instructions are for Codex or other coding agents working on LAMMPS simulation tasks. This is not a generic engineering workflow. Apply it only to LAMMPS modeling, potential configuration, input writing, review, execution, analysis, visualization, HPC submission, and paper-reproduction preparation.

## Non-Negotiable Workflow

For full LAMMPS projects, use this exact stage order:

```text
WF-00 Simulation Scheme Design
  -> reviewer gate
  -> WF-R Simulation Reasoner advisory
WF-01 Model Setup
  -> reviewer gate
WF-02 Potential Configuration
  -> reviewer gate
WF-03A Input Script Writing
  -> reviewer gate
Execution
WF-04 Data Analysis
WF-05 Visualization / Post-processing
```

Do not skip reviewer gates for WF-00, WF-01, WF-02, or WF-03A. If no subagent tool exists, perform the producer pass and reviewer pass as separate labeled phases in the same conversation, and write review JSON before advancing.

## Required Files

For complex cases, keep all runnable project artifacts under:

```text
work/cases/<case-slug>/
```

Maintain:

```text
work/cases/<case-slug>/SIMULATION_SCHEME.md
work/cases/<case-slug>/.lammps-project/state.md
work/cases/<case-slug>/.lammps-project/decisions.md
work/cases/<case-slug>/.lammps-project/review-log.md
work/cases/<case-slug>/.lammps-project/open-issues.md
work/cases/<case-slug>/.lammps-project/work-log.md
work/cases/<case-slug>/.lammps-project/wf01.packet.json
work/cases/<case-slug>/.lammps-project/wf02.packet.json
work/cases/<case-slug>/.lammps-project/wf03a.packet.json
work/cases/<case-slug>/.lammps-project/runs/
```

Use the templates in `templates/` when creating new files.

## LAMMPS Roles

- Coordinator: state, routing, user summary only.
- Simulation architect: WF-00 `SIMULATION_SCHEME.md` with D1-D7.
- Simulation reasoner: advisory physical reasonableness check.
- Input writer: WF-01/WF-02/WF-03A producer.
- Reviewer: review gate; returns `PASS`, `REVISE`, or `BLOCKED`.
- Executor: run LAMMPS and capture metadata.
- Data analyst: parse logs, validate D7, recommend rollback or WF-05.
- Case librarian: retrieve closest examples and minimal KB evidence.

Never let the same logical pass both produce and approve high-risk artifacts without a separate reviewer section.

## Automatic Evidence Gate

Evidence gates must be mechanical when possible. Prompt text alone is insufficient, and the user should not need to start the gate manually.

Before accepting `PASS`, write review JSON and run:

```bash
node .codex/lammps-agent-workflow/scripts/autolammps-gate.js validate <review-json> .
```

If support files are installed somewhere else, adjust the path. Do not ask the user to run this command. Run it yourself. A stage may advance only when the command exits 0 and writes `<review-json>.gate.json` with `ok: true`.

If no script can run, manually enforce the checklist in `knowledge-capsule/mandatory-checks.md` and lower confidence to at most `medium`.

Reviewer `PASS` is invalid when:

- any triggered MB-001 through MB-007 check fails
- triggered MB checks have no evidence
- high-risk review lacks dual evidence
- command-level semantic changes lack manual/correction evidence
- referenced local evidence paths do not exist
- review output has no `confidence`

High-risk reviews include ReaxFF, COMB3, MEAM mapping, multi-element systems, deposition, oxidation, electrochemistry, restart/data continuation, deformation scripts, or any user request to check/review.

## Mandatory Checks

Load `knowledge-capsule/mandatory-checks.md` before review. The compact blocker list:

- MB-001: engineering strain must freeze L0 at the NPT-to-deform transition.
- MB-002: fixed/frozen atoms must not receive broad initial velocities.
- MB-003: `fix npt` must not control the same direction as `fix deform`.
- MB-004: ReaxFF must use charge-capable atom style and QEq.
- MB-005: `fix print` equal-style variables need safe syntax.
- MB-006: ReaxFF `pair_coeff` element names must match data atom types and ffield entries.
- MB-007: restart/data provenance must be verified.

## D1-D7 Scheme Contract

WF-00 must lock or explicitly mark uncertainty for:

- D1 material system
- D2 objective
- D3 thermodynamic conditions
- D4 boundary and size
- D5 loading/protocol
- D6 potential family
- D7 acceptance criteria

`D7` is mandatory. A run that exits with code 0 is not success unless D7 checks pass.

## Review Decision Handling

- `PASS`: advance to next stage.
- `REVISE`: return to producer with bounded fixes and increment revise count.
- `BLOCKED`: stop advancement and record blocker.
- Three consecutive `REVISE` decisions for one stage become blocked.

## Minimal Knowledge Policy

Use the bundled `knowledge-capsule/` first for safety rules. If a richer local KB exists, cite it by path but do not copy large chunks into the answer. Preserve local KB value by extracting only the rule needed for the current decision.

Use `knowledge-capsule/test-cases/` only as synthetic review fixtures. They demonstrate gate behavior and should not be copied as production-ready LAMMPS inputs.

Use the evidence ladder:

1. target artifact and user files
2. bundled knowledge capsule
3. bundled synthetic test fixtures for gate testing
4. local rules/templates/memory
5. closest local cases
6. official LAMMPS or potential docs
7. literature
8. engineering default with risk penalty

## Output Discipline

Keep user-facing responses short: current stage, decision, files, next step. Store details in artifacts. Do not dump full scripts, full logs, or full evidence chains unless requested.
