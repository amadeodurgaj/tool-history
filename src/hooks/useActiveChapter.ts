import { useEffect, useState } from 'react'

/**
 * Active chapter = the one whose body crosses the viewport midline (brief §7); null on the hero.
 * `last` remembers the most recent active chapter so the player bar keeps its content while hiding.
 */
export function useActiveChapter(ids: string[]) {
  const [now, setNow] = useState<{ active: string | null; last: string }>({ active: null, last: ids[0] })

  useEffect(() => {
    const pick = () => {
      const mid = innerHeight / 2
      const hit = ids.find((id) => {
        const r = document.querySelector(`[data-chapter="${id}"]`)?.getBoundingClientRect()
        return r && r.top <= mid && r.bottom > mid
      }) ?? null
      setNow((p) => (p.active === hit ? p : { active: hit, last: hit ?? p.last }))
    }
    pick()
    addEventListener('scroll', pick, { passive: true })
    addEventListener('resize', pick)
    return () => { removeEventListener('scroll', pick); removeEventListener('resize', pick) }
  }, [ids])

  return now
}
