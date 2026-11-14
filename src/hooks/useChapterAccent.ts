import { useEffect } from 'react'
import { byId } from '../content/albums'
import { setAccent } from '../lib/accent'

/** Crossfades `--accent` to the active chapter's colour (instant under reduced motion). */
export function useChapterAccent(active: string | null) {
  useEffect(() => {
    if (active) setAccent(byId(active)!.accent, matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [active])
}
