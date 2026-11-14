# TOOL: A History

A fan-made, scroll-driven site about the band TOOL's studio albums. Unofficial; not affiliated with the band. All visuals are generated from points and lines. No official artwork, logos or audio.

```
npm run dev      # dev server
npm run build    # type-check + production build
npm run lint
```

## Structure

```
data/albums.json         all copy: albums, tracklists, accents, captions (content source)
tokens/                  colour, type, spacing, motion tokens (tokens.css is loaded globally)
reference/               original design artboards (reference only)

src/
  main.tsx               entry: tokens + base styles + <App/>
  App.tsx                composition: Stage, grain, Hero, Chapters, Player
  components/            one folder per component: Name.tsx + Name.css + index.ts
    Hero/                full-screen title over the vortex
    Chapter/             one album chapter (data-driven from albums.json)
    Tracklist/           numbered tracks, active row in accent
    Letterbox/           56px bar shared by Hero and Chapter
    Rail/                six-dot chapter rail
    Player/              sticky bar: Player, Visualiser, glyphs
    Stage/               the single fixed <canvas> that hosts the active scene
  scenes/                canvas scenes: hero.ts, lateralus.ts, types.ts (Scene/View contract)
  hooks/                 usePlayer, useActiveChapter, useChapterAccent
  lib/                   accent (oklch crossfade), color, audio (AudioSource + NullAudioSource), generators.mjs
  content/albums.ts      typed access to data/albums.json, plus `builtChapters`
  styles/base.css        reset, type utilities, fixed layers (canvas, grain)
```

## Adding a chapter

1. Add the id to `builtChapters` in `src/content/albums.ts`.
2. Add a scene in `src/scenes/<album>.ts` (a `Scene`: `el()` + `draw()`), and register it in `components/Stage/Stage.tsx`.
3. Add the album's glyph in `components/Player/glyphs.ts` (and its visualiser style in `Visualiser.tsx`).

Scenes locate their artwork by reading the `[data-visual]` element inside their chapter, so layout stays in CSS.

## Audio

The player talks to an `AudioSource` interface (`src/lib/audio.ts`) and ships with `NullAudioSource`, a stub that simulates time. Real audio needs licensing and is a product decision.
