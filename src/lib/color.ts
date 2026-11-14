// Accent crossfade in oklch (brief §3). Hex in, `oklch(L C H)` string out.
export type Lch = [number, number, number]

export function toOklch(hex: string): Lch {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360]
}

export function mixLch(a: Lch, b: Lch, t: number): Lch {
  const dh = ((b[2] - a[2] + 540) % 360) - 180 // shortest way round the hue wheel
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (a[2] + dh * t + 360) % 360]
}

export const fmt = ([L, C, H]: Lch) => `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`
