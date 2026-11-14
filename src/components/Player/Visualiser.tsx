import type { CSSProperties } from 'react'
import { goldenBarHeights } from '../../lib/generators.mjs'

// Lateralus: 32 golden-angle bars. Per-album styles (spikes, sine layers, …) land with their chapters.
const BARS = goldenBarHeights(32, 8, 34).map(
  (h, i) => ({ '--h': `${h}px`, '--o': (0.55 + 0.45 * ((i % 3) / 2)).toFixed(2), '--d': `-${((i * 0.382) % 1.618).toFixed(2)}s` }) as CSSProperties,
)

/** Animates while the bar's `data-playing` is true (see Player.css); at rest otherwise. */
export default function Visualiser() {
  return <div className="viz" aria-hidden="true">{BARS.map((s, i) => <i key={i} style={s} />)}</div>
}
