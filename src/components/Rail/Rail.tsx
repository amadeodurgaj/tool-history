import type { CSSProperties } from 'react'
import { albums, pad } from '../../content/albums'
import './Rail.css'

export default function Rail({ active, decorative = false }: { active: string | null; decorative?: boolean }) {
  return (
    <nav className="rail" aria-label="Chapters" aria-hidden={decorative || undefined}>
      <ol>
        {albums.map((a) => {
          const body = (
            <>
              <span className="mono">{pad(a.order)}</span>
              <i style={{ '--c': a.accent } as CSSProperties} />
            </>
          )
          return (
            <li key={a.id} className={a.id === active ? 'is-on' : undefined}>
              {decorative ? <span>{body}</span> : <a href={`#chapter-${pad(a.order)}`} aria-current={a.id === active || undefined} aria-label={`Chapter ${a.order}: ${a.title}`}>{body}</a>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
