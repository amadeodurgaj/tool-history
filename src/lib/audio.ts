// Audio source interface (brief §7). Real audio is a licensing decision, not part of this build:
// the UI talks to AudioSource only, and ships with a stub that simulates time.
export interface Playable { title: string; seconds: number }

export interface AudioSource {
  load(track: Playable): void
  play(): void
  pause(): void
  seek(t: number): void
  readonly currentTime: number
  readonly duration: number
  readonly ended: boolean
  readonly analyser?: AnalyserNode
}

export class NullAudioSource implements AudioSource {
  duration = 0
  private base = 0
  private startedAt: number | null = null

  load(track: Playable) {
    this.duration = track.seconds
    this.base = 0
    if (this.startedAt !== null) this.startedAt = performance.now()
  }
  play() { if (this.startedAt === null) this.startedAt = performance.now() }
  pause() { this.base = this.currentTime; this.startedAt = null }
  seek(t: number) {
    this.base = Math.max(0, Math.min(this.duration, t))
    if (this.startedAt !== null) this.startedAt = performance.now()
  }
  get currentTime() {
    const t = this.base + (this.startedAt === null ? 0 : (performance.now() - this.startedAt) / 1000)
    return Math.min(this.duration, t)
  }
  get ended() { return this.duration > 0 && this.currentTime >= this.duration }
}

export const toSeconds = (len: string) => len.split(':').reduce((a, p) => a * 60 + Number(p), 0)
export const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
