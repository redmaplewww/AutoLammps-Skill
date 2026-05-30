# LAMMPS Mandatory Checks

These are compact blocker rules. Before returning `PASS` for WF-00, WF-01, WF-02, or WF-03A, review MB-001 through MB-007. If a rule is triggered and violated, the review decision must be `BLOCKED`.

## MB-001: Engineering Strain L0 Freeze

- Trigger: tensile/deformation workflow, especially NPT equilibration followed by `fix deform`.
- Check: freeze the reference length at the NPT-to-deform transition; strain and printed strain must use that frozen value, not a dynamic `lx` baseline.
- Block if: strain uses dynamic current box length as initial reference.
- Evidence pointer: local confirmed lesson CL-007 or LAMMPS `fix deform`/variable docs.

## MB-002: Fixed/Frozen Atoms Must Not Receive Broad Velocity

- Trigger: model has fixed/frozen/boundary atoms and uses `velocity` commands.
- Check: velocity initialization excludes fixed groups and targets only mobile atoms.
- Block if: `velocity all ...` or equivalent includes fixed/frozen atoms.
- Evidence pointer: local confirmed lesson CL-003 or validated fixed-boundary case.

## MB-003: `fix npt` Must Not Compete With `fix deform`

- Trigger: `fix npt` and `fix deform` are both present.
- Check: the barostat does not control the same box direction that `fix deform` changes.
- Block if: `fix npt` controls/couples the deforming direction.
- Evidence pointer: local confirmed lesson CL-011, LAMMPS `fix npt`/`fix deform` docs, or validated tensile case.

## MB-004: ReaxFF Requires Charge Handling

- Trigger: `pair_style reaxff` or `pair_style reax/c`.
- Check: use `atom_style charge` or `full`; include suitable QEq such as `fix qeq/reaxff` or `fix qeq/shielded`.
- Block if: ReaxFF runs with default zero charges or no compatible QEq.
- Evidence pointer: local confirmed lesson CL-001 and LAMMPS QEq docs.

## MB-005: `fix print` Equal-Style Variable Syntax

- Trigger: any `fix print` command.
- Check: equal-style variables are printed using safe immediate/evaluated syntax appropriate for the target LAMMPS version, such as `$(v_varname)` when needed.
- Block if: bare `v_varname` appears where it would print literal text or stale values.
- Evidence pointer: local pending/confirmed lesson PL-008 or LAMMPS `fix print`/variable docs.

## MB-006: ReaxFF `pair_coeff` Element Mapping

- Trigger: ReaxFF `pair_coeff` line or any multi-element potential mapping.
- Check: element names are in atom-type order, match the data file Masses/type meaning, and exist in the ffield/potential file.
- Block if: element order is copied from another case without verification, or ffield/data mapping conflicts.
- Evidence pointer: local confirmed lesson CL-010, validated ReaxFF case, or potential docs.

## MB-007: Restart/Data Provenance

- Trigger: `read_restart`, continuation from a data file, or reuse of intermediate structure.
- Check: file source, generation time, box dimensions, atom counts, and intended phase/state are recorded.
- Block if: continuation source is unknown or box/model provenance is not verified.
- Evidence pointer: local confirmed lesson CL-006 or case run metadata.

## Output Requirement

Each review JSON must include all MB IDs. Example:

```json
{
  "mandatory_check_results": {
    "MB-001": { "triggered": false },
    "MB-002": { "triggered": true, "passed": true, "evidence": [{ "type": "memory", "source": "knowledge/memory/confirmed-lessons.md", "verified": true }] }
  }
}
```
