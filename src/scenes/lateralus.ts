import {dustPath, goldenSpiral, phyllotaxis} from '../lib/generators.mjs'
import {accentA, getAccent} from '../lib/accent'
import {clamp, INK, type Scene, type View} from './types'

const TAU = Math.PI * 2
const CHUNKS = 120
const POINTS = { desktop: 7500, small: 2500 }

function chunk(d: string) {
  const pts = d.split('M').slice(1)
  const per = Math.ceil(pts.length / CHUNKS)
  const out: Path2D[] = []
  for (let i = 0; i < pts.length; i += per) out.push(new Path2D('M' + pts.slice(i, i + per).join('M')))
  return out
}

function drawOn(ctx: CanvasRenderingContext2D, ch: Path2D[], full: Path2D, p: number, alpha: number) {
  ctx.globalAlpha = alpha
  if (p >= 1) return ctx.stroke(full)
  const x = p * ch.length, k = Math.floor(x)
  for (let i = 0; i < k; i++) ctx.stroke(ch[i])
  ctx.globalAlpha = alpha * (x - k)
  if (k < ch.length) ctx.stroke(ch[k])
}

export function lateralusScene(): Scene {
  let key = ''
  let built = 0
  let L: {
    squares: Path2D; arc: Path2D; arcLen: number
    sm: Path2D[]; mid: Path2D[]; big: Path2D[]
    smF: Path2D; midF: Path2D; bigF: Path2D
    field: Path2D; dust: Path2D; dustH: number
  } | null = null
  let p = 0

  const build = (fit: number, v: View) => {
    const dens = (POINTS[v.small ? 'small' : 'desktop'] * 1012) / (7500 * fit)
    const g = goldenSpiral({ cx: 0, cy: 0, fit, dens, seed: 7 })
    const arcLen = [...g.arc.matchAll(/A([\d.]+) /g)].reduce((s, m) => s + (+m[1] * Math.PI) / 2, 0)
    const dustH = v.h
    L = {
      squares: new Path2D(g.squares), arc: new Path2D(g.arc), arcLen,
      sm: chunk(g.sm), mid: chunk(g.mid), big: chunk(g.big),
      smF: new Path2D(g.sm), midF: new Path2D(g.mid), bigF: new Path2D(g.big),
      field: new Path2D(phyllotaxis(0, 0, (520 * fit) / 920, v.small ? 900 : 1800)),
      dust: new Path2D(dustPath(v.w, dustH, Math.round((v.w * dustH) / 2144), 21)), dustH,
    }
  }

  return {
    el: () => document.getElementById('chapter-04'),
    draw(ctx, v, r) {
      const anchor = document.querySelector('#chapter-04 [data-visual]')
      if (!anchor) return
      const a = anchor.getBoundingClientRect()
      const fit = a.height
      const q = Math.max(16, Math.round(fit / 16) * 16)
      const k = `${q}|${v.small}|${v.w}x${v.h}`
      if (k !== key) { key = k; built = q; build(q, v) }
      if (!L) return
      const s = fit / built

      const target = v.reduced ? 1 : clamp((v.h - a.top) / (v.h / 2 + a.height / 2))
      p = v.reduced ? 1 : p + (target - p) * (1 - Math.exp(-v.dt / 0.2)) // ≈0.6 s smoothing
      if (target >= 1 && p > 0.999) p = 1

      const lim = v.w < 1200 ? 40 : 120
      const mid = r.top + r.height / 2 - v.h / 2
      const dyVisual = v.reduced ? 0 : clamp(mid * (0.35 - 1), -lim, lim)
      const cx = a.left + a.width / 2, cy = a.top + a.height / 2 + dyVisual
      const lw = v.small ? 0.82 : 1

      ctx.save()
      ctx.lineCap = 'round'

      ctx.strokeStyle = INK; ctx.lineWidth = 1.2 * lw; ctx.globalAlpha = 0.22
      const off = (((v.reduced ? 0 : r.top * 0.6) % L.dustH) + L.dustH) % L.dustH
      ctx.save(); ctx.translate(0, off - L.dustH); ctx.stroke(L.dust); ctx.translate(0, L.dustH); ctx.stroke(L.dust); ctx.restore()

      ctx.translate(cx, cy)
      ctx.scale(s, s)

      const R = (620 * fit) / 920 / s
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
      gr.addColorStop(0, accentA(0.34)); gr.addColorStop(0.5, accentA(0.07)); gr.addColorStop(1, accentA(0))
      ctx.globalAlpha = Math.min(1, p * 3); ctx.fillStyle = gr
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill()

      ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * lw; ctx.globalAlpha = 0.16 * Math.min(1, p * 3); ctx.stroke(L.field)

      ctx.save()
      if (!v.reduced) ctx.rotate((v.t * TAU) / 240)
      ctx.lineWidth = 1.4 * lw
      drawOn(ctx, L.sm, L.smF, p, 0.3)
      ctx.restore()

      ctx.lineWidth = 0.8 * lw; ctx.globalAlpha = 0.14 * Math.min(1, p * 2); ctx.stroke(L.squares)

      ctx.strokeStyle = getAccent()
      ctx.lineWidth = 1.1 * lw; ctx.globalAlpha = 0.8
      ctx.setLineDash([p * L.arcLen * s, L.arcLen * 4])
      ctx.stroke(L.arc)
      ctx.setLineDash([])
      ctx.lineWidth = 2.3 * lw; drawOn(ctx, L.mid, L.midF, p, 0.55)
      ctx.lineWidth = 3.2 * lw; drawOn(ctx, L.big, L.bigF, p, 0.95)
      ctx.restore()
    },
  }
}
