import raw from '../../data/albums.json'

export type Album = (typeof raw.albums)[number]
export const site = raw.site
export const albums: Album[] = raw.albums
export const byId = (id: string) => albums.find((a) => a.id === id)
export const pad = (n: number) => String(n).padStart(2, '0')

/** Chapters that have a scene built so far, in release order. The rest slot in as their scenes land. */
export const builtChapters = ['lateralus']
