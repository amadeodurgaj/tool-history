import { useEffect, useRef } from 'react'
import { getAccent } from '../../lib/accent'
import { heroScene } from '../../scenes/hero'
import { lateralusScene } from '../../scenes/lateralus'
import type { View } from '../../scenes/types'

/** One fixed full-viewport canvas behind the page; scenes draw only while their element is on screen. */
export default function Stage() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!, ctx = canvas.getContext('2d')!
    const scenes = [heroScene(), lateralusScene()]
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const t0 = performance.now()
    let w = 0, h = 0, dpr = 1, last = t0, raf = 0, lastKey = ''

    const resize = () => {
      w = innerWidth; h = innerHeight; dpr = Math.min(2, devicePixelRatio || 1)
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
    }
    resize()
    addEventListener('resize', resize)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const reduced = motion.matches
      // Reduced motion: scenes are static, so only redraw when something actually changed.
      const key = `${scrollY}|${w}|${h}|${getAccent()}`
      if (reduced && key === lastKey) return
      lastKey = key
      const v: View = { w, h, t: (now - t0) / 1000, dt: Math.min(0.1, (now - last) / 1000), reduced, small: w < 768 }
      last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const s of scenes) {
        const el = s.el()
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > h) continue // off-screen scenes are paused
        s.draw(ctx, v, r)
      }
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="stage" aria-hidden="true" />
}
