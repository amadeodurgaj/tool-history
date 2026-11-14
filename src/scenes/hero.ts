// Hero: six-arm vortex, one arm per album accent (brief §5).
import { vortexArms } from '../lib/generators.mjs'
import { albums } from '../content/albums'
import { clamp, INK, type Scene, type View } from './types'

const TAU = Math.PI * 2
const ease = (t: number) => t * t * (3 - 2 * t)

export function heroScene(): Scene {
  let key = ''
  let arms: { small: Path2D; large: Path2D }[] = []
  let dust = new Path2D()
  let cx = 0, cy = 0, eye = 0, rot = 0

  const build = (v: View) => {
    const s = Math.hypot(v.w, v.h) / Math.hypot(1440, 900)
    // desktop = 1440×900 comp, scaled; small = 390×844 comp
    const o = v.small
      ? { n: 320, r0: 20, rMax: 0.66 * v.h, yScale: 0.9, cy: 0.415 * v.h, eye: 0.178 * v.h, cell: 731 }
      : { n: 560, r0: 34, rMax: 980 * s, yScale: 0.86, cy: 0.444 * v.h, eye: 260 * s, cell: 926 }
    cx = v.w / 2; cy = o.cy; eye = o.eye
    const g = vortexArms({ w: v.w, h: v.h, cx, cy, n: o.n, r0: o.r0, rMax: o.rMax, yScale: o.yScale, dustN: Math.round((v.w * v.h) / o.cell) })
    arms = g.arms.map((a: { small: string; large: string }) => ({ small: new Path2D(a.small), large: new Path2D(a.large) }))
    dust = new Path2D(g.dust)
  }

  return {
    el: () => document.getElementById('hero'),
    draw(ctx, v, r) {
      const k = `${v.w}x${v.h}`
      if (k !== key) { key = k; build(v) }

      const hp = clamp(-r.top / v.h)
      const alpha = 1 - ease(hp)
      if (alpha <= 0) return
      if (!v.reduced) rot += v.dt * (TAU / 260) * (1 + 3 * hp)
      const lw = v.small ? 0.92 : 1
      const dy = v.reduced ? 0 : clamp(r.top * 0.35, -120, 120)
      const dyDust = v.reduced ? 0 : clamp(r.top * 0.6, -120, 120)

      ctx.save()
      ctx.lineCap = 'round'
      ctx.globalAlpha = alpha

      ctx.save()
      ctx.translate(0, dyDust)
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * lw; ctx.globalAlpha = 0.28 * alpha
      ctx.stroke(dust)
      ctx.restore()

      ctx.translate(cx, cy + dy)
      const sc = v.reduced ? 1 : 1 + 0.6 * hp
      ctx.scale(sc, sc)
      ctx.save()
      ctx.rotate(rot)
      arms.forEach((a, i) => {
        ctx.strokeStyle = albums[i].accent
        ctx.lineWidth = 1.3 * lw; ctx.globalAlpha = 0.55 * alpha; ctx.stroke(a.small)
        ctx.lineWidth = 2.6 * lw; ctx.globalAlpha = 0.9 * alpha; ctx.stroke(a.large)
      })
      ctx.restore()

      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, eye)
      gr.addColorStop(0, 'rgba(241,238,232,.55)')
      gr.addColorStop(0.35, 'rgba(241,238,232,.12)')
      gr.addColorStop(1, 'rgba(241,238,232,0)')
      ctx.fillStyle = gr; ctx.globalAlpha = alpha
      ctx.beginPath(); ctx.arc(0, 0, eye, 0, TAU); ctx.fill()
      ctx.restore()
    },
  }
}
