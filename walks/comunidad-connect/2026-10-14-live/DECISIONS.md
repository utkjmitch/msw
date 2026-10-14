# Decisions for this walk

The live walk could not run: the box's egress proxy refuses `www.comunidadconnect.org`. See `REPORT.md`, section 2.

```yaml decision
id: D-1
question: Should the mac profile's egress allowlist admit comunidadconnect.org so the read-only live walk can run from the box?
options:
  - allow comunidadconnect.org and its asset hosts — the walk runs as written; the box can read the live public site
  - walk from the host instead — no wall change, but the walk leaves the box's evidence trail
  - wait for the dev-site walks — no live baseline for the before-and-after comparison
recommended: allow comunidadconnect.org and its asset hosts
rationale: [Likely] The walk is read-only and logged out, and the server blocks every write; the allowlist is the only thing missing.
evidence:
  - walks/comunidad-connect/2026-10-14-live/egress-blocked-attempt/first-time-learner-first-time-learner-learn-phone-en-US/instrument.jsonl
  - walks/comunidad-connect/2026-10-14-live/REPORT.md
disposition: none
private: false
```
