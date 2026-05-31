# Claude Code Auto Gate Instructions

Paste this into a Claude Code project instruction file if your Claude Code setup does not automatically load `SKILL.md`.

When using AutoLammps Skill:

1. Write every WF-00/WF-01/WF-02/WF-03A review as JSON.
2. Save review JSON as `.lammps-project/reviews/<stage>.review.json` when possible.
3. Immediately run the gate yourself before saying `PASS`:

```bash
node <path-to-AutoLammps-Skill>/scripts/autolammps-gate.js validate <review-json> <project-root>
```

4. Only advance if the command exits 0 and creates `<review-json>.gate.json` with `ok: true`.
5. If the gate fails, treat the review as `REVISE` or `BLOCKED` and fix the review/artifact first.

The user should not need to start the evidence gate manually.
