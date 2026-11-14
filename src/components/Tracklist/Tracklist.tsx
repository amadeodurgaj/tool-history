import type { CSSProperties } from 'react'
import { pad, type Album } from '../../content/albums'
import './Tracklist.css'

export default function Tracklist({ tracks, activeTrack }: { tracks: Album['tracks']; activeTrack: number }) {
  return (
    <div className={`tracks${tracks.length > 14 ? ' dense' : ''}`}>
      <header><span className="mono">Tracklist</span><span className="mono">{tracks.length} tracks</span></header>
      <ol>
        {tracks.map((t, i) => (
          <li key={t.n} className={i === activeTrack ? 'is-on' : undefined} aria-current={i === activeTrack || undefined} style={{ '--i': i } as CSSProperties}>
            <span className="mono">{pad(t.n)}</span>
            <span className="name">{t.title}</span>
            <span className="mono">{t.length}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
