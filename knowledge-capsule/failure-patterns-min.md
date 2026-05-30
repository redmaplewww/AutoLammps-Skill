# LAMMPS Failure Patterns Minimal Playbook

## Lost Atoms

Likely causes: bad geometry, overlap, too-large timestep, unstable boundary/loading, aggressive heating.

First actions: inspect structure, minimize first, reduce timestep, check boundary and group definitions.

## Bond Atoms Missing

Likely causes: topology mismatch, unstable geometry, incompatible atom style or data topology.

First actions: verify data file topology, atom style, and potential compatibility.

## Non-Numeric Atom Coordinates / Energy Explosion

Likely causes: dense overlap, timestep too large, damping too weak, field/heating ramp too aggressive.

First actions: check overlap, add staged equilibration, reduce timestep, ramp loads/temperature.

## Invalid Pair Style / Pair Coeff

Likely causes: missing package, wrong potential file, wrong element mapping, copied pair_coeff syntax.

First actions: compare to closest local case and official LAMMPS docs; verify package availability and element order.

## Segmentation Fault / Abnormal Abort

Likely causes: damaged data file, illegal mixed potential combination, unstable or unsupported command combination.

First actions: reduce to minimal reproduction and inspect most recent input changes.

## Continuation Gives Wrong Results

Likely causes: wrong restart/data source, inherited old box/vacuum/layer state.

First actions: verify restart/data provenance, dimensions, atom counts, and intended simulation phase.

## Completion Is Not Success

A zero exit code is only a run signal. It is not success unless D7 acceptance criteria pass.
