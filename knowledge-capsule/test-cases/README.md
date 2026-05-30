# Minimal Test Case Capsule

This directory contains a very small set of synthetic LAMMPS review fixtures. They are not a full case library and should not be treated as validated research inputs.

Purpose:

- give Codex / Claude Code a few concrete patterns for the evidence gate
- test mandatory checks without exposing the valuable local case database
- provide tiny fixtures for review-result validation examples

Policy:

- keep this directory small
- prefer synthetic/minimal inputs over real project cases
- use these only as review fixtures, not as production simulations

Included fixtures:

- `tensile-safe-minimal.in`: tiny deformation skeleton demonstrating L0 freeze and non-competing NPT/deform directions.
- `reaxff-safe-minimal.in`: tiny ReaxFF skeleton demonstrating charge atom style, QEq, and element mapping notes.
- `bad-fixed-velocity.in`: intentionally bad fixture for MB-002.
- `bad-reaxff-no-qeq.in`: intentionally bad fixture for MB-004.
