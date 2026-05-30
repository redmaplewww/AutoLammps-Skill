# LAMMPS Potential Selection Minimal Notes

This file is a small checklist, not a potential database.

## Common Families

- EAM / `eam/alloy`: metals and many alloys; verify element coverage and order.
- MEAM: metallic and directional alloy systems; verify `library.meam`, material files, and mapping syntax.
- Tersoff: covalent systems such as Si/C/SiC-like cases; verify element order.
- ReaxFF / `reaxff` / `reax/c`: reactive chemistry; requires charge-capable atom style and QEq.
- LJ / Coulomb hybrids: simple coarse or approximate interaction models; require explicit parameter justification.

## Selection Checklist

- Does the potential cover every element in the structure?
- Does `atom_style` match the potential and needed topology/charge fields?
- Does `pair_style` match supplied files and installed LAMMPS packages?
- Does `pair_coeff` element order match atom types in the data file?
- Is there a closer local case or official example?
- Are limitations recorded in D6 and D7 interpretation?

## Minimum Policy

- Do not invent a force field from memory when a local case, official doc, OpenKIM/NIST entry, or paper source should be checked.
- If only an engineering default is available, mark confidence down and make D7 acceptance criteria conservative.
