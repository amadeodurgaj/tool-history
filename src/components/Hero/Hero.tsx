import { site } from '../../content/albums'
import Letterbox from '../Letterbox'
import Rail from '../Rail'
import './Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <Letterbox
        left={<>Fan project<span className="hide-m"> · Not affiliated</span></>}
        center={site.title}
        right={<><span className="hide-m">{site.heroMeta[1]}</span><span className="m-only">1992 — 2019</span></>}
      />
      <Rail active={null} decorative />
      <div className="hero-copy">
        <h1 id="hero-title" className="display">Tool:<br className="m-only" /> A History</h1>
        <p className="tagline">{site.tagline}</p>
      </div>
      <div className="cue" aria-hidden="true">
        <span className="mono">Scroll</span>
        <div className="cue-line"><div className="cue-dot" /></div>
      </div>
    </section>
  )
}
