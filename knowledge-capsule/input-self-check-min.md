# LAMMPS Input Writer Self-Check

Before sending WF-01/WF-02/WF-03A artifacts to review, include these fields in the handoff packet:

- `files_changed`
- `source_examples`
- `manual_refs`
- `assumptions`
- `risk_points`
- `self_check_passed_items`
- `review_focus`

## General

- Cite at least one local case/template or explain why none exists.
- Record key assumptions and engineering defaults.
- Keep runnable case files under `work/cases/<case-slug>/`.
- Include outputs needed for D7 validation.

## ReaxFF

- Use charge-capable atom style.
- Include compatible QEq.
- Verify `pair_coeff` element order against data atom types and ffield entries.
- Use conservative timestep and monitor QEq convergence.

## MEAM

- Verify library file, material file, and pair_coeff mapping syntax.
- Do not modify data atom types to match a copied example without provenance.

## HEA / Multi-Element Metals

- Verify all elements are covered by the potential.
- Record random seed, composition, lattice/source assumptions.
- Use staged minimization/equilibration before production loading.

## Tensile / Deformation

- Freeze initial box length at the correct transition point.
- Ensure NPT does not control the deforming direction.
- Output strain, stress, temp, and box lengths needed for post-processing.

## Restart / Data Continuation

- Verify file provenance, generation time, atom count, box dimensions, and intended physical phase.
