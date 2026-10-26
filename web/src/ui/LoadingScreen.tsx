import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'

// Full-screen loading mask: reads the cover artwork's progress (store.sceneProgress) and
// fades out, then unmounts, once it is ready. (It used to read three's LoadingManager, which
// went away with the 2D scene.) Purely visual: a spinning ring that fills with real progress,
// no text. Fade-out and unmount run on CSS transitions + setTimeout rather than rAF, so they
// stay reliable when the tab is backgrounded or offscreen.
export default function LoadingScreen() {
  const progress = useStore((s) => s.sceneProgress)
  // reached: has progress ever hit 100%? One-way false→true, so staggered loads can't flicker it
  const [reached, setReached] = useState(false)
  const [hiding, setHiding] = useState(false) // fade-out started
  const [removed, setRemoved] = useState(false) // fully unmounted
  // Track the high-water mark so the ring can't shrink back as more assets register
  const peak = useRef(0)
  peak.current = Math.max(peak.current, Math.min(Math.max(progress, 0), 100))

  useEffect(() => {
    if (progress >= 100) setReached(true)
  }, [progress])

  // Once 100% is reached: hold briefly → fade → unmount. Fires once; later progress can't undo it
  useEffect(() => {
    if (!reached) return
    const t1 = setTimeout(() => setHiding(true), 400)
    const t2 = setTimeout(() => setRemoved(true), 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reached])

  if (removed) return null

  const R = 34
  const C = 2 * Math.PI * R
  const offset = C * (1 - peak.current / 100)

  return (
    <div className={`loading-screen${hiding ? ' is-hidden' : ''}`} aria-hidden="true">
      <div className="loading-ring">
        <svg viewBox="0 0 80 80">
          <circle className="lr-track" cx="40" cy="40" r={R} />
          <circle
            className="lr-arc"
            cx="40"
            cy="40"
            r={R}
            style={{ strokeDasharray: C, strokeDashoffset: offset }}
          />
        </svg>
      </div>
    </div>
  )
}
