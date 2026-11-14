import Chapter from './components/Chapter'
import Hero from './components/Hero'
import Player from './components/Player'
import Stage from './components/Stage'
import { builtChapters, byId } from './content/albums'
import { useActiveChapter } from './hooks/useActiveChapter'
import { useChapterAccent } from './hooks/useChapterAccent'
import { usePlayer } from './hooks/usePlayer'

export default function App() {
  const { active, last } = useActiveChapter(builtChapters)
  const album = byId(last)!
  const player = usePlayer(album)
  useChapterAccent(active)

  return (
    <>
      <Stage />
      <div className="grain" aria-hidden="true" />
      <main>
        <Hero />
        {builtChapters.map((id) => {
          const a = byId(id)!
          return <Chapter key={id} album={a} activeTrack={a.id === album.id ? player.track : a.player.sampleTrack - 1} />
        })}
      </main>
      <Player album={album} visible={active !== null} player={player} />
    </>
  )
}
