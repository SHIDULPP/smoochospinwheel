/**
 * Pointer is fixed at the top (12 o'clock / -90° in standard math).
 * Segments are drawn starting from the top, going clockwise.
 * Segment i occupies [i * slice, (i+1) * slice) in clockwise degrees from top.
 * Center of segment i is at (i + 0.5) * slice clockwise from top.
 *
 * To land segment center under the pointer, rotate the wheel so that
 * the segment center moves to the top: rotation = 360 - centerAngle (+ full turns).
 */
export function getTargetRotation(
  selectedIndex: number,
  segmentCount: number,
  currentRotation: number,
  minTurns = 5,
  maxTurns = 7,
): number {
  const slice = 360 / segmentCount;
  const centerFromTop = (selectedIndex + 0.5) * slice;
  // Wheel rotates clockwise visually via positive CSS rotate degrees
  const landing = (360 - centerFromTop) % 360;
  const turns = minTurns + Math.floor(Math.random() * (maxTurns - minTurns + 1));
  const base = Math.ceil(currentRotation / 360) * 360;
  return base + turns * 360 + landing;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
