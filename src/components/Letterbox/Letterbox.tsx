import type { ReactNode } from 'react'
import './Letterbox.css'

export default function Letterbox({ left, center, right }: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div className="letterbox">
      <span className="mono">{left}</span>
      <span className="mono on-ink hide-m">{center}</span>
      <span className="mono">{right}</span>
    </div>
  )
}
