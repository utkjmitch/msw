import { z } from "zod";
const Id = z.string().regex(/^[a-z0-9-]+$/);
export const ViewportNameZ = z.enum(["phone-small", "phone", "tablet", "desktop"]);
export const Role = z.enum(["visitor", "member", "admin"]);
export const Audience = z.enum(["public", "member", "admin"]);

export const Walker = z.object({
  id: Id, name: z.string().min(1), summary: z.string().min(1), role: Role,
  story: z.string().min(1), hopes: z.array(z.string()).min(1), fears: z.array(z.string()).min(1),
  background: z.string(), motivation: z.string(), frustrations: z.array(z.string()),
  tech_literacy: z.object({ level: z.enum(["low", "medium", "high"]), note: z.string() }),
  prior_knowledge: z.array(z.string()), devices: z.array(ViewportNameZ).min(1), locale: z.string(),
  patience: z.number().int().min(1).max(50), leave_triggers: z.array(z.string()).min(1),
  accessibility: z.array(z.string()).optional(),
});
export type Walker = z.infer<typeof Walker>;

export const SillyCategory = z.enum(["impatient-fingers", "wandering-attention", "unusual-arrivals",
  "language-and-text", "body-and-device", "privacy-minded", "unusual-intent", "admin-mishaps"]);
export const Move = z.enum(["reload", "double-tap", "new-tab", "switch-tab", "wait"]);
export type Move = z.infer<typeof Move>;
export const Conditions = z.object({
  network: z.union([z.literal("slow-3g"),
    z.object({ offline_at_step: z.number().int().min(1), seconds: z.number().int().min(1).max(120) })]).optional(),
  text_scale: z.number().int().min(100).max(400).optional(),
  color_scheme: z.enum(["light", "dark"]).optional(),
  reduced_motion: z.boolean().optional(),
  cookies: z.literal("declined").optional(),
  rotate_at_step: z.number().int().min(1).optional(),
  expire_session_at_step: z.number().int().min(1).optional(),
  translate: z.boolean().optional(),
});
export type Conditions = z.infer<typeof Conditions>;

export const Journey = z.object({
  id: Id, walker: Id, audience: Audience, goal: z.string().min(1), start_url: z.url(),
  arrival: z.enum(["search", "shared-link", "email", "direct"]),
  success: z.array(z.string()).min(1), step_budget: z.number().int().min(1).max(200),
  mode: z.enum(["read-only", "transact"]).default("read-only"),
  origins: z.array(z.url()).default([]), storage_state: z.string().optional(),
  viewports: z.array(ViewportNameZ).optional(), locales: z.array(z.string()).optional(),
  planned: z.boolean().default(false),
  silly: z.object({ category: SillyCategory, conditions: Conditions.default({}), moves: z.array(Move).default([]) }).optional(),
});
export type Journey = z.infer<typeof Journey>;

export const RunConfig = z.object({
  id: Id, out_dir: z.string().min(1),
  environment: z.object({ name: z.string(), kind: z.enum(["live", "test"]) }),
  allowed_for_transact: z.array(z.url()).default([]),
  payment_test_mode: z.boolean().default(false),
  mask_personal_data: z.boolean().default(true),
});
export type RunConfig = z.infer<typeof RunConfig>;

export const Finding = z.object({
  id: z.string(), run: z.string(), walker: z.string(), journey: z.string(), step: z.number().int(),
  viewport: ViewportNameZ, locale: z.string(),
  kind: z.enum(["usability", "function", "content", "accessibility", "performance", "vision-gap"]),
  source: z.enum(["walker", "instrument"]), severity: z.number().int().min(0).max(4),
  title: z.string().min(1), what_happened: z.string(), expected: z.string(),
  evidence: z.array(z.number().int()), repro: z.array(z.object({ step: z.string(), event: z.number().int() })),
  reproduced: z.boolean().default(false), fingerprint: z.string().default(""),
  silly: SillyCategory.optional(),
});
export type Finding = z.infer<typeof Finding>;

const rank = { visitor: 0, member: 1, admin: 2, public: 0 } as const;
export function audienceAllowed(role: z.infer<typeof Role>, audience: z.infer<typeof Audience>): boolean {
  return rank[audience] <= rank[role];
}
