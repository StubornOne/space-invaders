export function clamp(val: number, min: number, max: number): number {
  if (val < min) return min
  if (val > max) return max
  return val
}

export interface Rect {
  x1: number,
  y1: number,
  x2: number,
  y2: number
}