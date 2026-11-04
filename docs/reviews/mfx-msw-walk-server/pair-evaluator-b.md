Evaluator: evaluator-b. Model: gpt-6-astra. Lens: lens 9 (Invariant hygiene).

Lane b is the better starting point. Neither lane is clean under lens 9.
I reviewed the frozen diffs, source trees, reports, DONE records, and both rebuttals.
This is a source review. I did not rerun the build or browser tests.
The findings below concern stored truth, identity, derivation, and ignored inputs.

1. Both lanes: missing DATA-TRUTH documentation. Medium.
   Exact line in `refs/lanes/a:server/src/events/log.ts:14` and `refs/lanes/b:server/src/events/log.ts:14`:
   `const base = { seq: this.events.length + 1, ts: new Date().toISOString(), kind, state, data, prev };`
   Both introduce sequence semantics, a signing chain, evidence references, and derived findings.
   Neither tracked tree contains a subsystem DATA-TRUTH document.
   The build reports and README descriptions do not define the writer and reader contract.
   Add that document in the merge diff, covering walk identity, sequence scope, state binding, verification, and finding derivation.
   I found no existing blessed reader or status script being bypassed.

2. Both lanes: repeated walks mix independent evidence chains. High.
   Exact line in `refs/lanes/a:server/src/walk/session.ts:47` and `refs/lanes/b:server/src/walk/session.ts:47`:
   `this.dir = join(this.run.out_dir, "walks", `${this.walker.id}-${this.journey.id}-${this.viewport}-${this.locale}`);`
   Exact line in both lanes' `server/src/events/log.ts:16`:
   `this.events.push(e); appendFileSync(this.file, JSON.stringify(e) + "\n"); return e;`
   Each new EventLog starts with an empty in-memory list and a fresh key.
   A repeated walk reuses the directory, restarts sequence numbers, and appends to the old log.
   Screenshots and final findings can overwrite earlier evidence while instrument records accumulate.
   Event numbers no longer identify one coherent walk.
   Reject an occupied evidence directory or allocate a distinct walk identity before writing.
   Lane a reports a reproduced case in lane-a-report.md:99; both rebuttals acknowledge it.

3. Lane a: verification accepts a valid prefix as a complete run. High.
   Exact line in `refs/lanes/a:server/src/events/log.ts:27`:
   `return { ok: bad.length === 0, bad };`
   The loop validates only the surviving file lines.
   Removing the last event leaves a nonempty valid prefix that still verifies.
   The seal can therefore claim verification while its in-memory count describes missing events.
   Lane b repairs this live-session invariant in `refs/lanes/b:server/src/events/log.ts:32`:
   `if (lines.length !== this.events.length) bad.add(Math.min(lines.length, this.events.length) + 1);`
   Lane b also compares the final HMAC and adds truncation tests.
   Both still keep the signing key only in memory, so this is not independent verification after exit.

4. Both lanes: instrument evidence can bind to the wrong state. High.
   Exact line in `refs/lanes/a:server/src/walk/session.ts:144` and `refs/lanes/b:server/src/walk/session.ts:148`:
   `const e = this.log.append("instrument", { ...r }, state ?? this.last?.state);`
   Asynchronous page listeners supply no state and fall back to the latest look.
   During navigation, that look belongs to the previous page.
   Events then contain a signed but false association between an error and its evidence state.
   Bind records to their originating page and navigation before assigning a look state.
   Lane a reports reproduction in lane-a-report.md:103.
   Lane b acknowledges missing this defect in docs/reviews/mfx-msw-walk-server/pair-rebuttal.json, lanes.b.answer.

5. Both lanes: display names are treated as replay identities. Lane b broadens the collision risk. Medium.
   Exact line in `refs/lanes/a:server/src/walk/session.ts:128` and `refs/lanes/b:server/src/walk/session.ts:134`:
   `const opt = this.last?.options.find(o => o.name === step.label && o.role === step.role);`
   Duplicate names select the first match, even when the original act selected another control.
   Both also truncate names before matching in `server/src/browser/options.ts:21`:
   `|| (html.type === "submit" ? html.value : "") || "").replace(/\s+/g, " ").trim().slice(0, 120);`
   Lane b additionally changes the matching key in `refs/lanes/b:server/src/browser/perceive.ts:12`:
   `if (o.mask) for (const option of options) option.name = maskText(option.name);`
   Two distinct email aria-labels can become the same role and `[masked]` name.
   Replay can select the wrong control; matching final state alone does not establish matching action identity.
   Preserve masking, but separate display text from internal identity and reject ambiguous replay matches.
   This collision finding is source-derived, not browser-reproduced.

6. Both lanes: payment eligibility ignores its declared input. High.
   Exact line in `refs/lanes/a:server/src/formats/schemas.ts:51` and `refs/lanes/b:server/src/formats/schemas.ts:52`:
   `payment_test_mode: z.boolean().default(false),`
   The complete `transactAllowed` function ends with `return { ok: true };` in both lanes' `server/src/browser/guard.ts:28`.
   It checks environment and origins but never reads payment_test_mode.
   Session action handling has no payment-specific eligibility check either.
   A permitted-origin payment action receives the same decision whether this input is true or false.
   Read the flag at the payment decision and record the resulting refusal or authorization.
   The lane b rebuttal also identifies the unused input in docs/reviews/mfx-msw-walk-server/pair-rebuttal.json, lanes.b.answer.

The rebuttals support findings 2–4, but they are not substitutes for source evidence.
Lane a's claim about lane b blocking a legitimate payment POST needs an origin qualification.
The exact guard condition is `if ((mainNav || MUTATING.has(req.method())) && !allowed.has(origin))` in `refs/lanes/b:server/src/browser/guard.ts:13`.
An explicitly allowed payment origin passes this condition in transact mode.
Unlisted background POSTs are nevertheless labeled `left-site`, so that stored reason now covers more than navigation.

Both lanes cover the twelve plan tasks and include docs/reports/2026-10-11-plan-a-build.md.
Lane a records task commits and deviations in lane-a-report.md:29 and :74.
Lane b records original and repair commits, plus reasons, in lane-b-report.md:24, :42, and :73.
Lane b's original Task 9 and Task 11 commits were red; later repairs restore the final gates.
Thus its final build passes, but the original test-pass-before-commit sequence was not met throughout.

Lane a reports clean typecheck and 30 passing tests in 11 files; its DONE evidence names the frozen head.
Lane b's DONE evidence reports clean typecheck and 35 passing tests in 12 files at its frozen head.
Lane b's report still describes generation 1 and an earlier code head; its DONE record uses generation 2.
Exact line at lane-b-report.md:50: “Final code tested: `c8ad2a5ef033a51c168b6076f05963e2efed5ac2`, generation 1. The following documentation commit changes no executable source or tests. DONE.json records the final HEAD and the actual revision that produced each gate result.”
Its gate provenance needs refreshing to match the final evidence rather than implying one final run.
Lane a tested on Node 20 despite the Node 22 requirement; it records this deviation and reason at lane-a-report.md:77.

I found no removed planned assertion or reduced implemented severity floor.
Lane a lengthens the disappearance timer; lane b makes removal deterministic and retains refusal and budget assertions.
Unimplemented spec floors remain disclosed gaps, not proof of complete spec enforcement.
Both explicitly skip Task 12 step 3 for the host.
I found no private client data, secrets, or concrete external host paths in the added public files reviewed.
Local DONE packets are not tracked deliverables and should remain outside the public tree.

Prefer lane b for its stronger log-completeness invariant and regression coverage.
Its `bar: gap` also fits the unresolved evidence defects better than lane a's `bar: met`.
The strongest counterargument is lane a's better diagnosis of state attribution, backed by a reported stdio reproduction.
Lane b misses that diagnosis and introduces additional masked-name collisions.
Take lane b's implementation as the base, preserve lane a's attribution evidence, and repair the shared storage contract before trusting derived reports.
