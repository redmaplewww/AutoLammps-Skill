# LAMMPS Review Guidelines

## Risk Levels

Low risk:

- single-element system
- simple equilibration or smoke test
- tiny path/step/output edits to a validated template

Medium risk:

- standard multi-element workflow
- limited modification of a known case
- common melt, solidification, tensile, shear, or annealing workflow

High risk:

- ReaxFF, COMB3, complex reactive force fields
- first use of a new potential
- MEAM or multi-file potential mapping
- multi-element or high-entropy alloy systems
- deposition, oxidation, electrochemistry, irradiation, fracture, restart/data continuation
- any user request to review/check/audit

## Evidence Requirements

- Never approve from memory alone.
- High-risk reviews need dual evidence: at least one manual/correction/official source and one local case/memory/template source.
- Command-level semantic changes require manual/correction evidence when touching `pair_style`, `pair_coeff`, `fix`, `compute`, `delete_atoms`, `atom_style`, `boundary`, `kspace_style`, or `timestep`.
- If evidence is weak, return `REVISE` or lower confidence.

## Review Focus

- structure and atom type consistency
- `atom_style`, `pair_style`, `pair_coeff`, and potential file compatibility
- timestep, thermostat, barostat, and loading stability
- fixed/mobile group definitions and velocity scope
- restart/data provenance
- thermo/dump outputs sufficient for D7 analysis
- whether a closest local example was searched before high-risk input writing

## Decisions

- `PASS`: artifact may advance.
- `REVISE`: bounded fixes are required, but the stage can be corrected by the producer.
- `BLOCKED`: major upstream issue, failed mandatory check, missing artifact, missing evidence, or required user/project decision.

## Evidence Record

```json
{
  "type": "manual|case|correction|literature|memory|artifact",
  "source": "path or URL",
  "excerpt": "short optional quote",
  "lineNumber": 1,
  "verified": true
}
```
