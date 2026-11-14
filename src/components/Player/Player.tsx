import { useEffect, type CSSProperties } from 'react'
import { pad, type Album } from '../../content/albums'
import type { PlayerState } from '../../hooks/usePlayer'
import { clock } from '../../lib/audio'
import { GLYPHS } from './glyphs'
import Visualiser from './Visualiser'
import './Player.css'

export default function Player({ album, visible, player: p }: { album: Album; visible: boolean; player: PlayerState }) {
  const t = album.tracks[p.track]
  const ratio = p.seconds ? p.sec / p.seconds : 0
  const nn = `${pad(t.n)} / ${pad(album.tracks.length)}`

  useEffect(() => {
    if (!visible) return
    const h = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || (e.target as Element).closest('button, input, a, select, textarea, [contenteditable]')) return
      e.preventDefault(); p.toggle()
    }
    addEventListener('keydown', h)
    return () => removeEventListener('keydown', h)
  })

  return (
    <div className={`player${visible ? ' on' : ''}`} data-playing={p.playing} role="region" aria-label="Player" inert={!visible}>
      <div className="p-info">
        <svg className="glyph" aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--accent)" strokeWidth="1.4"><path d={GLYPHS[album.id]} /></svg>
        <div className="p-text" aria-live="polite">
          <span key={album.id} className="display fade">{album.title}</span>
          <span key={t.n} className="mono fade">
            <span className="p-sub-d">Track {nn} · {t.title}</span>
            <span className="p-sub-m">{nn.replace(/ /g, '')} · {clock(p.sec)}</span>
          </span>
        </div>
      </div>

      <div className="p-ctl">
        <button className="ibtn" aria-label="Previous track" onClick={p.prev}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="1.6" height="12" /><path d="M14 2v12L4.5 8z" /></svg>
        </button>
        <button className="play" aria-label={p.playing ? 'Pause' : 'Play'} onClick={p.toggle}>
          {p.playing
            ? <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="1" width="3.5" height="14" /><rect x="9.5" y="1" width="3.5" height="14" /></svg>
            : <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M2 1v14l11-7z" /></svg>}
        </button>
        <button className="ibtn" aria-label="Next track" onClick={p.next}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><rect x="13.4" y="2" width="1.6" height="12" /><path d="M2 2v12l9.5-6z" /></svg>
        </button>
        <span className="mono time">{clock(p.sec)}</span>
        <div className="seek" style={{ '--p': ratio } as CSSProperties}>
          <div className="fill" /><div className="handle" />
          <input type="range" min={0} max={p.seconds} step={1} value={p.sec} aria-label="Seek" aria-valuetext={`${clock(p.sec)} of ${clock(p.seconds)}`} onChange={(e) => p.seek(+e.target.value)} />
        </div>
        <span className="mono time">{clock(p.seconds)}</span>
      </div>

      <Visualiser />
    </div>
  )
}
