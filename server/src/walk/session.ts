import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { mkdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { loadWalker, loadJourney } from "../formats/load.js";
import { audienceAllowed, type RunConfig, type Walker, type Journey, type Finding, type Move, type Conditions } from "../formats/schemas.js";
import { VIEWPORTS, type ViewportName } from "../formats/viewports.js";
import { EventLog } from "../events/log.js";
import { Budget } from "./budget.js";
import { checkAct, whartonNos, type Rating, type Wharton } from "./rules.js";
import { deadParrot } from "./parrot.js";
import { installGuard, transactAllowed, type Blocked } from "../browser/guard.js";
import { perceive, optionLine, type Perception, type Option } from "../browser/perceive.js";
import { maskText } from "../browser/mask.js";
import { contextOptions, setupConditions, applyStepConditions } from "../browser/conditions.js";
import { attachInquisition, inspectPage, instrumentFindings, VITALS_INIT, type InstrumentRecord } from "../instrument/inquisition.js";
import { reproduce } from "./replay.js";

export interface LookResult { png: Buffer; text: string; url: string; options: string[]; stepsLeft: number; patienceLeft: number; notes: string[]; ended?: string }
export interface ActArgs { option: number; text?: string; how?: "tap" | "double-tap" | "new-tab"; ratings: Rating[]; wharton: Wharton }
export interface NoteArgs { kind: Finding["kind"]; severity: number; title: string; what_happened: string; expected: string }
export interface QuitResult { dir: string; alive: boolean; failures: string[]; findings: number; verified: boolean }
export interface ReplayStep { label: string; role: string; how: "tap" | "double-tap" | "new-tab"; text?: string; event: number }
type StartArgs = { walker: string; journey: string; viewport: ViewportName; locale?: string };

export class WalkSession {
  private browser?: Browser; private context?: BrowserContext; private page?: Page; private pages: Page[] = [];
  private args!: StartArgs; private walker!: Walker; private journey!: Journey; private viewport!: ViewportName; private locale!: string;
  private cond: Conditions = {}; private moves: Move[] = [];
  private log!: EventLog; private budget!: Budget; private dir!: string; private steps = 0;
  private last: (Perception & { seq: number }) | null = null;
  private seen = new Set<string>(); private inspected = new Set<string>(); private pending: string[] = [];
  private instrument: (InstrumentRecord & { step: number; event: number })[] = [];
  private findings: Finding[] = []; private acts: ReplayStep[] = []; private ended?: string;

  constructor(private run: RunConfig, private headless = true, private reproduceFindings = true) {}
  get lastState(): string | undefined { return this.last?.state; }

  async start(a: StartArgs): Promise<LookResult> {
    if (this.browser) throw new Error("a walk is already in progress; quit it first");
    this.args = a; this.walker = await loadWalker(a.walker); this.journey = await loadJourney(a.journey);
    if (this.journey.walker !== this.walker.id) throw new Error(`journey ${this.journey.id} is for walker ${this.journey.walker}`);
    if (!audienceAllowed(this.walker.role, this.journey.audience)) throw new Error(`a ${this.walker.role} cannot walk a ${this.journey.audience} journey`);
    const t = transactAllowed(this.run, this.journey); if (!t.ok) throw new Error(t.reason);
    this.viewport = a.viewport; this.locale = a.locale ?? this.walker.locale;
    this.moves = this.journey.silly?.moves ?? []; this.cond = this.journey.silly?.conditions ?? {};
    this.dir = join(this.run.out_dir, "walks", `${this.walker.id}-${this.journey.id}-${this.viewport}-${this.locale}`);
    // One folder holds one walk. Never append to, or delete, another walk's evidence.
    if (existsSync(join(this.dir, "events.jsonl"))) throw new Error(`the walk folder ${this.dir} already holds a walk; use a fresh out_dir`);
    mkdirSync(join(this.dir, "screens"), { recursive: true });
    this.log = new EventLog(join(this.dir, "events.jsonl"));
    this.budget = new Budget(this.journey.step_budget, this.walker.patience);
    this.browser = await chromium.launch({ headless: this.headless });
    try {
      this.context = await this.browser.newContext(contextOptions(this.viewport, this.locale, this.cond, this.journey.storage_state));
      await this.context.addInitScript(VITALS_INIT);
      await installGuard(this.context, { mode: this.journey.mode, origins: [this.journey.start_url, ...this.journey.origins], onBlocked: b => this.onBlocked(b) });
      // axe opens a temporary page without an opener during analysis.
      this.context.on("page", async p => { if (await p.opener()) this.adopt(p); });
      const page = await this.context.newPage(); this.adopt(page);
      if (this.moves.includes("wait")) await page.clock.install();
      const notes = await setupConditions(this.context, page, this.cond);
      this.log.append("start", { walker: this.walker.id, journey: this.journey.id, viewport: this.viewport, locale: this.locale,
        mode: this.journey.mode, conditions: this.cond, moves: this.moves, notes });
      await page.goto(this.journey.start_url).catch(e => this.pending.push(`The page did not load: ${String(e.message).split("\n")[0]}`));
      return await this.arrive();
    } catch (error) {
      await this.browser.close(); this.browser = undefined;
      throw error;
    }
  }

  async look(): Promise<LookResult> {
    if (!this.browser) throw new Error("no walk in progress");
    if (this.ended) return this.result(this.last!);
    const p = await this.snap(); await this.inspect(p.state); return this.result(p);
  }

  async act(a: ActArgs): Promise<LookResult | { refused: string }> {
    if (!this.browser) throw new Error("no walk in progress");
    if (this.ended) return { refused: `the walk has ended (${this.ended})` };
    const last = this.last;
    const now = await perceive(this.page!, { mask: this.run.mask_personal_data, moves: this.moves, tabCount: this.pages.length });
    const chk = checkAct({ option: a.option, ratings: a.ratings, state: now.state }, last ? { state: last.state, optionCount: last.options.length } : null);
    if (!chk.ok) return this.refuse(chk.reason, a.option);
    const opt = last!.options[a.option - 1];
    if (opt.kind === "element" && !(await opt.handle!.evaluate(e => e.isConnected).catch(() => false))) return this.refuse("the page changed; look again", a.option);
    if (opt.inputType === "password") return this.refuse("Walkers never type passwords; this journey needs a saved login", a.option);
    if ((a.how === "double-tap" || a.how === "new-tab") && !this.moves.includes(a.how)) return this.refuse("that move is not part of this walk", a.option);
    const how = a.how ?? "tap";
    const stored = a.text === undefined ? undefined : this.run.mask_personal_data ? maskText(a.text) : a.text;
    const ev = this.log.append("act", { option: a.option, label: optionLine(opt), how, text: stored, ratings: a.ratings, wharton: a.wharton }, last!.state);
    this.acts.push({ label: opt.name, role: opt.role, how, text: a.text, event: ev.seq });
    this.steps += 1; this.budget.spendStep(); this.budget.charge("wharton-no", whartonNos(a.wharton));
    await this.perform(opt, a).catch(e => this.pending.push(`That did not work: ${String(e.message).split("\n")[0]}`));
    for (const c of await applyStepConditions(this.context!, this.page!, this.steps, this.cond)) this.log.append("condition", { name: c, step: this.steps });
    return this.arrive(last!.state);
  }

  note(nf: NoteArgs): { id: string } {
    if (!this.last) throw new Error("look first");
    const id = `${this.walker.id}-${this.journey.id}-w${this.findings.filter(f => f.source === "walker").length + 1}`;
    const lastAct = this.acts.at(-1)?.label ?? "arrival";
    const f: Finding = { id, run: this.run.id, walker: this.walker.id, journey: this.journey.id, step: this.steps,
      viewport: this.viewport, locale: this.locale, kind: nf.kind, source: "walker", severity: nf.severity, title: nf.title,
      what_happened: nf.what_happened, expected: nf.expected, evidence: [this.last.seq],
      repro: this.acts.map(a => ({ step: `${a.how} "${a.label}"${a.text !== undefined ? " and type" : ""}`, event: a.event })),
      reproduced: false, fingerprint: createHash("sha1").update(`${this.journey.id}|${nf.kind}|${lastAct}`).digest("hex").slice(0, 12),
      ...(this.journey.silly ? { silly: this.journey.silly.category } : {}) };
    this.findings.push(f); this.log.append("note", { id, title: nf.title, severity: nf.severity }, this.last.state);
    appendFileSync(join(this.dir, "findings.jsonl"), JSON.stringify(f) + "\n");
    return { id };
  }

  async quit(reason: "done" | "run-away" | "stuck", detail?: string): Promise<QuitResult> {
    if (!this.browser) throw new Error("no walk in progress");
    try { this.log.append("quit", { reason, detail: detail ?? null, ended: this.ended ?? null }); }
    finally { await this.browser.close(); this.browser = undefined; }
    const ctx = { run: this.run.id, walker: this.walker.id, journey: this.journey.id, viewport: this.viewport, locale: this.locale };
    this.findings.push(...instrumentFindings(this.instrument, ctx));
    if (this.reproduceFindings) {
      const events = this.log.all();
      for (const f of this.findings.filter(x => x.source === "walker")) {
        const target = events.find(e => e.seq === f.evidence[0]);
        f.reproduced = !!target?.state && await reproduce(this.run, this.args, this.acts, { state: target.state, upToEvent: target.seq }, join(this.dir, "replays", f.id));
      }
    }
    const verified = this.log.verify().ok; const parrot = deadParrot(this.log.all(), this.findings);
    writeFileSync(join(this.dir, "findings.jsonl"), this.findings.map(f => JSON.stringify(f)).join("\n") + (this.findings.length ? "\n" : ""));
    writeFileSync(join(this.dir, "seal.json"), JSON.stringify({ events: this.log.all().length, head: this.log.all().at(-1)?.hmac, verified,
      alive: parrot.alive, failures: parrot.failures, steps_used: this.steps, patience_charges: this.budget.charges }, null, 2) + "\n");
    return { dir: this.dir, alive: parrot.alive, failures: parrot.failures, findings: this.findings.length, verified };
  }

  async replayAct(step: ReplayStep): Promise<boolean> {
    const opt = this.last?.options.find(o => o.name === step.label && o.role === step.role);
    if (!opt) return false;
    const other = this.last!.options.find(o => o.n !== opt.n);
    const ratings: Rating[] = [{ option: opt.n, score: 3, why: "replay" }, ...(other ? [{ option: other.n, score: 1 as const, why: "replay" }] : [])];
    const r = await this.act({ option: opt.n, text: step.text, how: step.how, ratings, wharton: { will_try: true, notices: true, associates: true, sees_progress: true } });
    return !("refused" in r);
  }

  private adopt(p: Page) {
    if (this.pages.includes(p)) return;
    this.pages.push(p); this.page = p; attachInquisition(p, r => this.record(r));
    // a page that closes itself is never the current tab
    p.on("close", () => { this.pages = this.pages.filter(x => x !== p); if (this.page === p) this.page = this.pages.at(-1); });
  }
  private record(r: InstrumentRecord, state?: string) {
    if (!this.log) return;
    const e = this.log.append("instrument", { ...r }, state ?? this.last?.state);
    this.instrument.push({ ...r, step: this.steps, event: e.seq });
    appendFileSync(join(this.dir, "instrument.jsonl"), JSON.stringify({ ...r, step: this.steps, event: e.seq }) + "\n");
  }
  private onBlocked(b: Blocked) {
    this.log.append("blocked", { ...b }, this.last?.state);
    this.pending.push(b.why === "would-submit"
      ? "Nothing seemed to happen. This walk is read-only, so the form was not sent; carry on as if it had failed."
      : "That leads off this site, which this walk does not visit.");
  }
  private refuse(reason: string, option: number) {
    this.log.append("refused", { reason, option }, this.last?.state);
    return { refused: reason };
  }
  private async settle(): Promise<number> {
    const t0 = Date.now();
    await this.page!.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});
    await this.page!.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => {});
    return Date.now() - t0;
  }
  private async snap(): Promise<Perception & { seq: number }> {
    let p: Perception;
    for (let tries = 1; ; tries++) {
      try { p = await perceive(this.page!, { mask: this.run.mask_personal_data, moves: this.moves, tabCount: this.pages.length }); break; }
      catch (e) {
        // a click can start a navigation after settle() returned; look again once the new page has loaded
        if (tries >= 3 || !/Execution context was destroyed|navigation/i.test(String(e))) throw e;
        await this.settle();
      }
    }
    const e = this.log.append("look", { url: p.url, options: p.options.map(optionLine) }, p.state);
    writeFileSync(join(this.dir, "screens", `${e.seq}.png`), p.png);
    this.last = { ...p, seq: e.seq }; return this.last;
  }
  private async inspect(state: string) {
    if (this.inspected.has(state)) return;
    this.inspected.add(state);
    await inspectPage(this.page!, r => this.record(r, state)).catch(() => {});
  }
  private async arrive(prevState?: string): Promise<LookResult> {
    if (await this.settle() > 3000) this.budget.charge("slow-page");
    await this.snap(); await this.page!.waitForTimeout(1000); const p = await this.snap();
    if (prevState !== undefined) {
      if (p.state === prevState) this.budget.charge("no-change");
      else if (this.seen.has(p.state)) this.budget.charge("repeat-state");
    }
    this.seen.add(p.state); await this.inspect(p.state);
    const ex = this.budget.exhausted();
    if (ex && !this.ended) { this.ended = ex === "steps" ? "out of steps" : "run-away: patience"; this.log.append("condition", { name: "ended", reason: this.ended }); }
    return this.result(p);
  }
  private result(p: Perception): LookResult {
    return { png: p.png, text: p.text, url: p.url, options: p.options.map(optionLine), stepsLeft: this.budget.stepsLeft,
      patienceLeft: this.budget.patienceLeft, notes: this.pending.splice(0), ...(this.ended ? { ended: this.ended } : {}) };
  }
  private async perform(opt: Option, a: ActArgs): Promise<void> {
    const page = this.page!; const dy = Math.round((page.viewportSize()?.height ?? 800) * 0.8);
    if (opt.kind === "move") {
      if (opt.move === "scroll-down") await page.evaluate(y => window.scrollBy(0, y), dy);
      else if (opt.move === "scroll-up") await page.evaluate(y => window.scrollBy(0, -y), dy);
      else if (opt.move === "back") { this.budget.charge("back"); await page.goBack({ timeout: 10_000 }); }
      else if (opt.move === "reload") await page.reload();
      else if (opt.move === "switch-tab") { this.page = this.pages[(this.pages.indexOf(page) + 1) % this.pages.length]; await this.page.bringToFront(); }
      else if (opt.move === "wait") await page.clock.fastForward(Math.max(1, Number(a.text ?? "1")) * 60_000);
      return;
    }
    const h = opt.handle!;
    if ((opt.role === "textbox" || opt.role === "combobox") && a.text !== undefined) {
      if (opt.role === "combobox") await h.selectOption({ label: a.text }); else await h.fill(a.text);
      return;
    }
    if (a.how === "new-tab") {
      const href = await h.getAttribute("href"); if (!href) throw new Error("that cannot open in a new tab");
      const tab = await this.context!.newPage(); this.adopt(tab);
      await tab.goto(new URL(href, page.url()).href); return;
    }
    const touch = VIEWPORTS[this.viewport].touch;
    const press = () => (touch ? h.tap({ timeout: 5_000 }) : h.click({ timeout: 5_000 }));
    // Touch taps do not wait for navigation. Register the wait before pressing.
    const target = await h.evaluate((el: Element) => {
      const link = el.closest<HTMLAnchorElement>("a[href]");
      const control = el as HTMLButtonElement | HTMLInputElement;
      const form = ["BUTTON", "INPUT"].includes(el.tagName) && control.type === "submit"
        && control.form?.checkValidity() ? control.form : null;
      if (!link && !form) return null;
      return link?.target || control.getAttribute("formtarget") || form?.target || "_self";
    });
    const navigation = target === "_blank"
      ? page.waitForEvent("popup", { timeout: 5_000 }).then(async p => {
        this.adopt(p); await p.waitForLoadState("domcontentloaded");
      })
      : target ? page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5_000 }) : null;
    // An aborted navigation is expected when the guard blocks a request.
    const settled = navigation?.catch(() => {});
    try { await press(); if (a.how === "double-tap") await press().catch(() => {}); }
    finally { await settled; }
  }
}
