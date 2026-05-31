# Codex Auto Gate Snippet

Add this to a target project's `AGENTS.md` if you want explicit no-manual evidence gates.

## AutoLammps Evidence Gate

For WF-00, WF-01, WF-02, and WF-03A, after writing a reviewer JSON and before reporting `PASS`, run:

```bash
node .codex/lammps-agent-workflow/scripts/autolammps-gate.js validate <review-json> .
```

Do not ask the user to run this command. Run it yourself. A stage may advance only when the command exits 0 and writes `<review-json>.gate.json` with `ok: true`.

If the target project stores support files elsewhere, adjust the script path accordingly.
