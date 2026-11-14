export interface View {
  w: number
  h: number
  t: number // seconds since start
  dt: number // seconds since last frame (clamped)
  reduced: boolean // prefers-reduced-motion
  small: boolean // <768px: reduced point budget, mobile comps
}

/** A scene draws into the shared fixed canvas while its element is on screen. */
export interface Scene {
  el(): HTMLElement | null
  draw(ctx: CanvasRenderingContext2D, v: View, r: DOMRect): void
}

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const INK = '#f1eee8'
