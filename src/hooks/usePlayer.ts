import { useEffect, useState } from 'react'
import { NullAudioSource, toSeconds } from '../lib/audio'
import type { Album } from '../content/albums'

export function usePlayer(album: Album) {
  const [src] = useState(() => new NullAudioSource())
  const [picked, setPicked] = useState<Record<string, number>>({}) // last-played track per album
  const [playing, setPlaying] = useState(false)
  const [clk, setClk] = useState({ key: '', sec: 0 })

  const last = album.tracks.length - 1
  const track = picked[album.id] ?? album.player.sampleTrack - 1 // ponytail: sample track stands in for "first or last-played"
  const key = `${album.id}:${track}`
  const seconds = toSeconds(album.tracks[track].length)
  const sec = clk.key === key ? clk.sec : 0

  useEffect(() => { src.load({ title: album.tracks[track].title, seconds }) }, [src, album, track, seconds])
  useEffect(() => { if (playing) src.play(); else src.pause() }, [src, playing])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const s = Math.floor(src.currentTime)
      setClk((c) => (c.key === key && c.sec === s ? c : { key, sec: s }))
      if (src.ended) {
        if (track < last) setPicked((p) => ({ ...p, [album.id]: track + 1 })) // idempotent if a frame repeats
        else setPlaying(false)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [src, playing, key, track, last, album.id])

  const seek = (t: number) => { src.seek(t); setClk({ key, sec: Math.floor(t) }) }
  return {
    track, playing, sec, seconds,
    seek,
    toggle: () => { if (src.ended) seek(0); setPlaying((p) => !p) },
    next: () => track < last && setPicked((p) => ({ ...p, [album.id]: track + 1 })),
    prev: () => (sec > 3 || track === 0 ? seek(0) : setPicked((p) => ({ ...p, [album.id]: track - 1 }))),
  }
}

export type PlayerState = ReturnType<typeof usePlayer>
