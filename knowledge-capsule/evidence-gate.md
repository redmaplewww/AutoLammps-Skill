# Automatic Mechanical Evidence Gate

The LAMMPS reviewer gate should not rely on instructions alone. A model can forget to apply evidence rules or can mark weak reviews as `PASS`. The agent should run this gate automatically; the user should not need to start it manually.

## Required Review Artifact

Reviewer must write a JSON file based on `templates/review-result.json`. The coordinator should accept only the JSON result, not a free-form paragraph.

Recommended path:

```text
work/cases/<case-slug>/.lammps-project/reviews/<stage>.review.json
```

## Validation Layers

### Layer 1: Schema

Run:

```bash
node scripts/autolammps-gate.js validate <review-json> <project-root>
```

This wraps `scripts/validate-review-result.js`, validates required fields and enum values, and writes `<review-json>.gate.json`.

### Layer 2: LAMMPS Gate Logic

Reject `PASS` if:

- any MB-001 through MB-007 key is missing
- any triggered MB check has no evidence
- any triggered MB check has `passed: false`
- high-risk review lacks manual/correction evidence
- high-risk review lacks case/memory/artifact evidence
- semantic commands were touched but no manual/correction evidence is present
- a local evidence path is missing
- `confidence` is absent or not in `high|medium|low`

### Layer 3: Coordinator Acceptance

Coordinator may advance only if:

- reviewer decision is `PASS`
- mechanical validation passes
- `<review-json>.gate.json` exists and has `ok: true`
- review artifact path is recorded in `review-log.md`
- stage state is updated in `.lammps-project/state.md`

## Semantic Commands That Require Manual/Correction Evidence

- `pair_style`
- `pair_coeff`
- `fix`
- `compute`
- `delete_atoms`
- `atom_style`
- `boundary`
- `kspace_style`
- `timestep`

## High-Risk Trigger Examples

- ReaxFF / COMB3
- MEAM mapping
- multi-element or high-entropy alloy systems
- deformation, fracture, deposition, oxidation, electrochemistry
- restart/data continuation
- user explicitly asks for review/check/audit

## Manual Fallback

If no script can run, the coordinator must read the review JSON and manually enforce Layer 2. In this fallback mode, final review confidence cannot exceed `medium` unless all evidence paths were independently checked.
