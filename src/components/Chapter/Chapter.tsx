import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { albums, pad, type Album } from '../../content/albums'
import Letterbox from '../Letterbox'
import Rail from '../Rail'
import Tracklist from '../Tracklist'
import './Chapter.css'

export default function Chapter({ album, activeTrack }: { album: Album; activeTrack: number }) {
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)
  const n = pad(album.order)
  const next = albums[album.order] // order is 1-based, so this is the following album
  const reel = album.reelLine.slice(album.reel.length + 3) // "Reel IV · 2001 · …" → "2001 · …"

  // Reveal once, when the chapter's top crosses 80% of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { rootMargin: '0px 0px -20% 0px' })
    io.observe(ref.current!)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} id={`chapter-${n}`} data-chapter={album.id} className={`chapter${seen ? ' in' : ''}`} aria-labelledby={`title-${album.id}`}>
      <div className="scrim" aria-hidden="true" />

      <Letterbox left={<>Chapter {n} / {pad(albums.length)}</>} center="TOOL: A History" right={album.releaseLabel} />
      <div className="ghost display" aria-hidden="true">{n}</div>

      <h2 id={`title-${album.id}`} className="title display" style={{ '--tf': album.titleFontSize } as CSSProperties}>
        <span className="sr">{album.title}</span>
        <span aria-hidden="true">
          {Array.from(album.title).map((c, i) => <span key={i} className="ch" style={{ '--i': i } as CSSProperties}>{c === ' ' ? ' ' : c}</span>)}
        </span>
      </h2>

      {/* Anchor for the canvas scene: scenes read this element's rect to place the artwork. */}
      <div className="visual" data-visual aria-hidden="true" />

      <div className="reel">
        <i aria-hidden="true" />
        <span className="mono"><span className="reel-n">{album.reel} · </span>{reel}</span>
      </div>
      <p className="story rv-story">{album.story}</p>
      <Tracklist tracks={album.tracks} activeTrack={activeTrack} />

      <a className="next" href={next ? `#chapter-${pad(next.order)}` : '#closing'}>
        <span className="mono">Next</span>
        <b className="display">{next ? next.title : 'Closing'}</b>
        {next && <span className="mono">{next.year}</span>}
        <svg aria-hidden="true" width="40" height="10" viewBox="0 0 40 10" fill="none" stroke="currentColor"><path d="M0 5H38M34 1l4 4-4 4" /></svg>
      </a>

      <Rail active={album.id} />
      <span className="fig mono">{album.sceneCaption}</span>
    </section>
  )
}
