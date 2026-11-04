// viewports.ts
export type ViewportName = "phone-small" | "phone" | "tablet" | "desktop";
export const VIEWPORTS: Record<ViewportName, { width: number; height: number; touch: boolean }> = {
  "phone-small": { width: 375, height: 812, touch: true },
  phone: { width: 390, height: 844, touch: true },
  tablet: { width: 768, height: 1024, touch: true },
  desktop: { width: 1440, height: 900, touch: false },
};
