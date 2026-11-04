// order.ts
export function readingOrder(boxes: { x: number; y: number; w: number; h: number }[]): number[] {
  const idx = boxes.map((b, i) => ({ i, cy: b.y + b.h / 2, x: b.x })).sort((a, b) => a.cy - b.cy);
  const rows: (typeof idx)[] = [];
  for (const it of idx) {
    const row = rows.at(-1);
    if (row && Math.abs(row[0].cy - it.cy) <= 12) row.push(it); else rows.push([it]);
  }
  return rows.flatMap(r => r.sort((a, b) => a.x - b.x).map(it => it.i));
}
