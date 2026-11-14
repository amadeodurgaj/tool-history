// Single source of truth for the live accent. Writes the `--accent` CSS variable and
// exposes the same value to canvas scenes, so DOM and canvas crossfade together.
import { fmt, mixLch, toOklch, type Lch } from './color'

const DURATION = 900
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) // in-out cubic ≈ (.65,0,.35,1)

let live: Lch = toOklch('#E0BC5E') // where the accent is right now, even mid-fade
let current = '#E0BC5E'
let raf = 0

export const getAccent = () => current
/** Live accent with alpha, for canvas gradients: `oklch(L C H / a)`. */
export const accentA = (a: number) => current.replace(/\)$/, ` / ${a})`)

function set(lch: Lch) {
  live = lch
  const css = fmt(lch)
  current = css
  document.documentElement.style.setProperty('--accent', css)
}

export function setAccent(hex: string, instant: boolean) {
  cancelAnimationFrame(raf)
  const to = toOklch(hex)
  if (instant) return set(to)
  const from = live, t0 = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / DURATION)
    set(mixLch(from, to, ease(t)))
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
