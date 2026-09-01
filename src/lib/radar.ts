export interface RadarPoint {
  x: number;
  y: number;
}

/** Position of the `index`-th of `total` axes on a radar chart, at the given 1-5 `level`. */
export function radarPoint(index: number, level: number, total: number, center = 170, maxR = 130): RadarPoint {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (maxR * level) / 5;
  return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
}
