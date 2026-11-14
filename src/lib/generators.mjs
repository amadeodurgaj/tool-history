export const TAU = Math.PI * 2;
const f = n => n.toFixed(1);

/** Seeded PRNG (mulberry32). Same seed => same artwork on every load. */
export function mb32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Random dust specks across a w×h area. */
export function dustPath(w, h, n, seed = 1) {
  const R = mb32(seed); let d = '';
  for (let i = 0; i < n; i++) d += 'M' + f(R() * w) + ' ' + f(R() * h) + 'h.01';
  return d;
}

/** Vogel phyllotaxis field (golden angle), n points within radius `r`. */
export function phyllotaxis(cx, cy, r, n) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const rr = r * Math.sqrt(i / n), th = i * 2.399963;
    d += 'M' + f(cx + rr * Math.cos(th)) + ' ' + f(cy + rr * Math.sin(th)) + 'h.01';
  }
  return d;
}

/**
 * Lateralus: golden/Fibonacci spiral. Squares of sizes 1,1,2,3,5,8,13,21,34,55 with quarter-circle arcs,
 * plus a ribbon of points scattered around each arc (3 points per sample: 1 on the curve + 2 jittered).
 * Returns { squares, arc, big, mid, sm }: hairline squares, hairline arc, on-curve dots, near dots, far dots.
 * Draw order/opacity used in the comp: sm .3 (ink), squares .14 (ink), arc .8 (accent), mid .55, big .95 (accent).
 * `dens` is samples per px of arc length; dens 1.1 at fit 920 gives ~7,500 points. Use ~0.4 on mobile.
 * To "draw on" with scroll, slice the dot strings by arc index (they are emitted arc by arc, in order).
 */
export function goldenSpiral({ cx = 980, cy = 760, fit = 920, dens = 1.1, seed = 7 } = {}) {
  const F = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55], R = mb32(seed);
  let C = [0, 0], u = [0, -1], arcs = [], sq = [], x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < F.length; i++) {
    const s = F[i], v = [-u[1], u[0]];
    const P = [[C[0], C[1]], [C[0] + u[0] * s, C[1] + u[1] * s], [C[0] + (u[0] + v[0]) * s, C[1] + (u[1] + v[1]) * s], [C[0] + v[0] * s, C[1] + v[1] * s]];
    P.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    arcs.push({ C: [C[0], C[1]], s, a: Math.atan2(u[1], u[0]) }); sq.push(P);
    const J = [C[0] + v[0] * s, C[1] + v[1] * s], ns = F[i + 1] || s;
    C = [J[0] - v[0] * ns, J[1] - v[1] * ns]; u = v;
  }
  const k = fit / Math.max(x1 - x0, y1 - y0), ox = cx - ((x0 + x1) / 2) * k, oy = cy - ((y0 + y1) / 2) * k;
  const X = x => ox + x * k, Y = y => oy + y * k;
  const squares = sq.map(P => 'M' + P.map(p => f(X(p[0])) + ' ' + f(Y(p[1]))).join('L') + 'Z').join('');
  let arc = '';
  arcs.forEach((a, i) => {
    const sx = a.C[0] + a.s * Math.cos(a.a), sy = a.C[1] + a.s * Math.sin(a.a);
    const ex = a.C[0] + a.s * Math.cos(a.a + Math.PI / 2), ey = a.C[1] + a.s * Math.sin(a.a + Math.PI / 2);
    if (i === 0) arc += 'M' + f(X(sx)) + ' ' + f(Y(sy));
    arc += 'A' + f(a.s * k) + ' ' + f(a.s * k) + ' 0 0 1 ' + f(X(ex)) + ' ' + f(Y(ey));
  });
  let big = '', mid = '', sm = '';
  arcs.forEach(a => {
    const r = a.s * k, cnt = Math.round(r * Math.PI / 2 * dens);
    for (let j = 0; j < cnt; j++) {
      const t = a.a + (j + R()) / cnt * Math.PI / 2;
      for (let m = 0; m < 3; m++) {
        const sg = 2.5 + 0.045 * r;
        const d = m === 0 ? 0 : (R() + R() + R() - 1.5) * sg * (m === 1 ? 1 : 1.8), rr = r + d;
        const seg = 'M' + f(X(a.C[0]) + rr * Math.cos(t)) + ' ' + f(Y(a.C[1]) + rr * Math.sin(t)) + 'h.01';
        if (m === 0) big += seg; else if (Math.abs(d) < sg * 0.9) mid += seg; else sm += seg;
      }
    }
  });
  return { squares, arc, big, mid, sm };
}

/**
 * Hero: logarithmic-ish spiral arms of dots. One arm per album accent (arms[i] ↔ album i).
 * Returns arms: [{ small, large }] (inner 55% of each arm = small dots, outer = large) and dust.
 * Comp: small stroke 1.3 @ .55, large stroke 2.6 @ .9; whole group rotates 360° per 260 s about (cx, cy).
 */
export function vortexArms({ w = 1440, h = 900, cx = 720, cy = 400, arms = 6, n = 560, r0 = 34, rMax = 980, yScale = 0.86, dustN = 1400, seed = 5 } = {}) {
  const R = mb32(seed), out = [];
  for (let a = 0; a < arms; a++) {
    let small = '', large = '';
    for (let i = 0; i < n; i++) {
      const t = i / n, r = r0 + rMax * Math.pow(t, 1.75);
      const th = a * TAU / arms + 4.8 * Math.pow(t, 0.7) + (R() - 0.5) * 0.1 * (1 + 2 * t);
      const seg = 'M' + f(cx + r * Math.cos(th)) + ' ' + f(cy + r * Math.sin(th) * yScale) + 'h.01';
      if (t < 0.55) small += seg; else large += seg;
    }
    out.push({ small, large });
  }
  return { arms: out, dust: dustPath(w, h, dustN, seed + 100) };
}

/** 01 Opiate: ~72 horizontal torn lines, jitter grows to the right; plus short vertical tears. */
export function opiateLines({ x0 = 440, xMax = 1440, y0 = 120, rows = 72, rowGap = 15.5, seed = 3 } = {}) {
  const R = mb32(seed); let thin = '', bold = '', tear = '';
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * rowGap; let x = x0 + R() * 60;
    while (x < xMax) {
      const len = 14 + R() * 120, gap = R() < 0.5 ? R() * 30 : 0, k = (x - x0) / (xMax - x0);
      const amp = 1 + k * 7 * (0.3 + R()), x1 = Math.min(xMax, x + len); let seg = '';
      for (let xx = x; xx <= x1; xx += 6) seg += (xx === x ? 'M' : 'L') + f(xx) + ' ' + f(y + (R() - 0.5) * amp * 2);
      if (R() < 0.3) bold += seg; else thin += seg;
      x = x1 + gap + 6;
    }
  }
  for (let i = 0; i < 60; i++) {
    const x = x0 + 60 + R() * 920, y = y0 + 20 + R() * 1060, h = 20 + R() * 90;
    tear += 'M' + f(x) + ' ' + f(y) + 'l' + f((R() - 0.5) * 9) + ' ' + f(h / 2) + 'l' + f((R() - 0.5) * 9) + ' ' + f(h / 2);
  }
  return { thin, bold, tear };
}

/** 02 Undertow: 46 wave lines whose spacing compresses with depth (y ∝ t^0.62), a second phase-shifted set for caustics, light beams, sinking dashes. */
export function undertowWaves({ x0 = 440, x1 = 1440, y0 = 250, depth = 1000, lines = 46, seed = 4 } = {}) {
  const R = mb32(seed); let w1 = '', w2 = '', beams = '', sink = '';
  for (let i = 0; i < lines; i++) {
    const t = i / (lines - 1), y = y0 + depth * Math.pow(t, 0.62), A = Math.max(3, 26 * (1 - t)), ph = i * 0.7; let d = '', e = '';
    for (let x = x0; x <= x1; x += 8) {
      d += (x === x0 ? 'M' : 'L') + f(x) + ' ' + f(y + A * Math.sin(x * 0.012 + ph) + A * 0.4 * Math.sin(x * 0.029 - ph * 1.7));
      e += (x === x0 ? 'M' : 'L') + f(x) + ' ' + f(y + 6 + A * Math.sin(x * 0.011 - ph + 1.6) + A * 0.5 * Math.sin(x * 0.026 + ph * 1.3));
    }
    w1 += d; w2 += e;
  }
  for (let i = 0; i < 10; i++) beams += 'M' + f(860 + i * 70) + ' 56L' + f(640 + i * 130) + ' 1260';
  for (let i = 0; i < 320; i++) { const x = 480 + R() * 960, y = 120 + Math.pow(R(), 0.7) * 1100; sink += 'M' + f(x) + ' ' + f(y) + 'v' + f(3 + R() * 22 * (y / 1200)); }
  return { w1, w2, beams, sink };
}

/**
 * 03 Ænima: a 25×25 grid pushed through a swirl about (cx, cy); angle offset decays with radius and grows toward the bottom.
 * `swirl` (default 3.4) is the scroll-driven strength: animate 0 → 3.4+ with progress for "collapsing into a vortex".
 * Stroke both `rows` and `cols` with a diagonal gradient #D1962F → #7AA2E3 (userSpaceOnUse, top-left to bottom-right).
 * Every 7th row is glitch-offset +14px, every 11th −10px (offset 5).
 */
export function aenimaGrid({ cx = 990, cy = 770, span = 1000, cells = 24, samples = 100, swirl = 3.4, seed = 6 } = {}) {
  const R = mb32(seed);
  const sw = (x, y) => {
    const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx) + swirl * Math.exp(-r / 190) * (0.2 + 0.8 * Math.min(1, Math.max(0, (y - 240) / 1000)));
    const rr = r * (1 - 0.3 * Math.exp(-r / 260));
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  };
  let rows = '', cols = '', blocks = '', eye = '';
  for (let i = 0; i <= cells; i++) {
    const p = i * span / cells, ry = cy - span / 2 + p, cxx = cx - span / 2 + p, g = (i % 7 === 3) ? 14 : (i % 11 === 5 ? -10 : 0);
    for (let j = 0; j <= samples; j++) {
      const t = cx - span / 2 + j * span / samples, u = cy - span / 2 + j * span / samples, ph = sw(t, ry), pv = sw(cxx, u);
      rows += (j ? 'L' : 'M') + f(ph[0] + g) + ' ' + f(ph[1]);
      cols += (j ? 'L' : 'M') + f(pv[0]) + ' ' + f(pv[1]);
    }
  }
  for (let i = 0; i < 70; i++) blocks += 'M' + f(560 + R() * 860) + ' ' + f(300 + R() * 900) + 'h' + f(10 + R() * 26); // stroke-width 6, butt caps
  for (let k = 0; k < 90; k++) { const a = k * TAU / 90; eye += 'M' + f(cx + 22 * Math.cos(a)) + ' ' + f(cy + 22 * Math.sin(a)) + 'h.01'; }
  return { rows, cols, blocks, eye };
}

/**
 * 05 10,000 Days: two sets of dotted orbital ellipses (set A rotates cw 220 s, set B ccw 320 s), a clock face of
 * 60 ticks (every 5th is a major tick, accent), two hands, and falling light streaks (loop a ±40px translateY).
 */
export function orbits({ cx = 1000, cy = 790, clockR = 410, seed = 8 } = {}) {
  const R = mb32(seed);
  const ell = (rx, ry, rot, N = 180) => {
    let line = '', dot = '';
    for (let j = 0; j < N; j++) {
      const t = TAU * j / N, x = rx * Math.cos(t), y = ry * Math.sin(t);
      const px = cx + x * Math.cos(rot) - y * Math.sin(rot), py = cy + x * Math.sin(rot) + y * Math.cos(rot);
      line += (j ? 'L' : 'M') + f(px) + ' ' + f(py);
      if (j % 6 === 0) dot += 'M' + f(px) + ' ' + f(py) + 'h.01';
    }
    return [line + 'Z', dot];
  };
  let ringsA = '', dotsA = '', ringsB = '', dotsB = '';
  [[500, 130, -0.35], [500, 130, 0.35], [450, 190, 1.0], [400, 100, 1.9]].forEach(q => { const e = ell(...q); ringsA += e[0]; dotsA += e[1]; });
  [[470, 240, 2.6], [520, 90, 0.0], [380, 160, 2.3], [330, 70, 0.9]].forEach(q => { const e = ell(...q); ringsB += e[0]; dotsB += e[1]; });
  let ticks = '', major = '';
  for (let k = 0; k < 60; k++) {
    const a = k * TAU / 60 - Math.PI / 2, m5 = k % 5 === 0, r1 = m5 ? clockR : clockR - 10, r2 = clockR + 10;
    const seg = 'M' + f(cx + r1 * Math.cos(a)) + ' ' + f(cy + r1 * Math.sin(a)) + 'L' + f(cx + r2 * Math.cos(a)) + ' ' + f(cy + r2 * Math.sin(a));
    if (m5) major += seg; else ticks += seg;
  }
  const hand = (len, ang) => 'M' + cx + ' ' + cy + 'L' + f(cx + len * Math.cos(ang)) + ' ' + f(cy + len * Math.sin(ang));
  const hands = (h1 = -1.05, h2 = 0.62) => hand(250, h1) + hand(360, h2); // call with progress-driven angles
  let fallDim = '', fallBright = '';
  for (let i = 0; i < 700; i++) {
    const x = 480 + R() * 960, y = 56 + R() * 1180;
    if (y < 270 && x < 1010) continue; // keep the title area clear
    const seg = 'M' + f(x) + ' ' + f(y) + 'v' + f(6 + R() * 44 * (y / 1200));
    if (y > 640 && R() < 0.5) fallBright += seg; else fallDim += seg;
  }
  return { ringsA, dotsA, ringsB, dotsB, ticks, major, hands, fallDim, fallBright };
}

/**
 * 06 Fear Inoculum: seven petal layers r(t)=R·(0.56+0.44|cos(n·t/2+L·0.4)|), n = 16,14,12,10,8,6,5.
 * Three groups rotate at 180/240/300 s per turn: A=layers 0,3,6 (cw), B=1,4 (ccw), C=2,5 (cw).
 */
export function mandala({ cx = 1000, cy = 790 } = {}) {
  const petal = (n, R0, L) => {
    let d = '';
    for (let j = 0; j <= 360; j++) {
      const t = TAU * j / 360, r = R0 * (0.56 + 0.44 * Math.abs(Math.cos(n * t / 2 + L * 0.4))), a = t + L * 0.13;
      d += (j ? 'L' : 'M') + f(cx + r * Math.cos(a)) + ' ' + f(cy + r * Math.sin(a));
    }
    return d + 'Z';
  };
  const ring = (r, N) => { let d = ''; for (let j = 0; j < N; j++) { const a = TAU * j / N; d += 'M' + f(cx + r * Math.cos(a)) + ' ' + f(cy + r * Math.sin(a)) + 'h.01'; } return d; };
  const L = [[16, 470], [14, 400], [12, 330], [10, 262], [8, 198], [6, 138], [5, 80]];
  let rings = '', spokes = '';
  [480, 410, 340, 272, 208, 146, 90].forEach(r => { rings += 'M' + f(cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + f(2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + f(-2 * r) + ' 0'; });
  for (let k = 0; k < 64; k++) { const a = k * TAU / 64; spokes += 'M' + f(cx + 30 * Math.cos(a)) + ' ' + f(cy + 30 * Math.sin(a)) + 'L' + f(cx + 520 * Math.cos(a)) + ' ' + f(cy + 520 * Math.sin(a)); }
  return {
    gA: petal(...L[0], 0) + petal(...L[3], 3) + petal(...L[6], 6),
    gB: petal(...L[1], 1) + petal(...L[4], 4),
    gC: petal(...L[2], 2) + petal(...L[5], 5),
    dotsA: ring(492, 160) + ring(300, 100), dotsB: ring(430, 128) + ring(360, 110),
    rings, spokes
  };
}

/** Lateralus player visualiser: bar heights from the golden angle (21 bars in the comps' mini version, 32 on desktop). */
export function goldenBarHeights(n = 32, min = 8, amp = 34) {
  return Array.from({ length: n }, (_, i) => Math.round(min + amp * (0.5 + 0.5 * Math.sin(i * 2.399963))));
}
