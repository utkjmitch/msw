export type PatienceCharge = "slow-page" | "no-change" | "back" | "repeat-state" | "wharton-no";
export class Budget {
  charges: { reason: PatienceCharge; n: number }[] = [];
  constructor(public stepsLeft: number, public patienceLeft: number) {}
  spendStep() { this.stepsLeft -= 1; }
  charge(reason: PatienceCharge, n = 1) { if (n > 0) { this.patienceLeft -= n; this.charges.push({ reason, n }); } }
  exhausted(): null | "steps" | "patience" {
    if (this.patienceLeft <= 0) return "patience";
    if (this.stepsLeft <= 0) return "steps";
    return null;
  }
}
