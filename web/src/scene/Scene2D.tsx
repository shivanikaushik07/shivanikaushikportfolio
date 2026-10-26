import { useEffect, useRef } from 'react'
import { FOCUS_POINTS } from '../data/focusPoints'
import { useStore } from '../store'

// 2D scene: one illustration in place of the original 3D character.
// The scroll contract is unchanged from the old 3D Scene — it reads the positions of
// [data-point="focus-N"] and .wk-gallery, so Resume.tsx needed no edits. The only
// difference is that this drives a CSS transform instead of a camera.

// Activation line: an entry takes the camera when its heading crosses this fraction of the
// viewport. Mid-screen, because entry bodies are taller than their headings — at 0.3 the
// camera ran a beat behind the text, still on the previous bandage while you read the next.
const NODE_LINE = 0.5
const DAMPING = 0.085 // per-frame interpolation toward the target; lower is stickier

// Camera stops: where the five bandages sit on the cover, as percentages measured off the
// artwork. The order matches FOCUS_POINTS, hence the five résumé entries — scroll to an
// entry and the view pushes in to its bandage.
const POINTS = [
  { x: 48.0, y: 53.0 }, // Education — MIT
  { x: 53.8, y: 57.0 }, // Growth Jockey
  { x: 49.2, y: 60.8 }, // Healic
  { x: 51.5, y: 40.5 }, // Kreo
  { x: 65.5, y: 31.8 }, // Valarie
]

// A native-resolution crop of the face, covering everything the zoom can reveal
// (x 36–78%, y 20–72%). Its percentage coordinates share the base image's frame, so it
// lines up automatically. It fades in on zoom and is not loaded for the first screen.
const FACE = { x: 36, y: 20, w: 42, h: 52 }

// tx/ty = where in the viewport the focus point should land. Nodes sit left of centre to
// leave room for the résumé text on the right.
const HERO = { scale: 1, x: 50, y: 50, tx: 50, ty: 50 }
const WORKS = { scale: 1.1, x: 50, y: 55, tx: 50, ty: 50 }
const NODE_SCREEN = { tx: 30, ty: 50 }
const NODE_SCALE = 5.0

// Below this the résumé runs over the artwork rather than beside it, so there is no empty
// side to push the bandage into. The zoom still runs, but gentler and aimed at the top of
// the screen, above where the text panel sits. Keep in step with the matching ≤900px block
// in styles.css, which gives that text its backing.
const NARROW = '(max-width: 900px)'
const NODE_SCREEN_NARROW = { tx: 50, ty: 24 }
const NODE_SCALE_NARROW = 3.0

export default function Scene2D() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLImageElement>(null)
  const setSceneProgress = useStore((s) => s.setSceneProgress)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    // Keep target and current separate and interpolate each frame, so scrolling never jumps
    const cur = { ...HERO }
    const target = { ...HERO }

    let nodes: (Element | null)[] = []
    let gallery: Element | null = null
    const findEls = () => {
      nodes = FOCUS_POINTS.map((n) => document.querySelector(`[data-point="${n}"]`))
      gallery = document.querySelector('.wk-gallery')
    }
    findEls()

    const narrow = window.matchMedia(NARROW)

    const pickTarget = () => {
      // Pull back to the wide shot once the works section is in view
      if (gallery) {
        const r = gallery.getBoundingClientRect()
        if (r.top < window.innerHeight * 0.5) {
          Object.assign(target, WORKS)
          return
        }
      }
      const line = window.innerHeight * NODE_LINE
      // The active node is the last entry whose top has crossed the line
      let active = -1
      nodes.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) active = i
      })
      if (active < 0) {
        Object.assign(target, HERO)
        return
      }
      const p = POINTS[Math.min(active, POINTS.length - 1)]
      const screen = narrow.matches ? NODE_SCREEN_NARROW : NODE_SCREEN
      target.scale = narrow.matches ? NODE_SCALE_NARROW : NODE_SCALE
      target.x = p.x
      target.y = p.y
      target.tx = screen.tx
      target.ty = screen.ty
    }

    let raf = 0
    const tick = () => {
      pickTarget()
      cur.scale += (target.scale - cur.scale) * DAMPING
      cur.x += (target.x - cur.x) * DAMPING
      cur.y += (target.y - cur.y) * DAMPING
      cur.tx += (target.tx - cur.tx) * DAMPING
      cur.ty += (target.ty - cur.ty) * DAMPING
      // Translate in pixels: the stage is larger than the viewport (it covers), so a
      // percentage is not a viewport position. Measure the stage, not wrap — wrap already
      // carries the very transform being computed.
      const st = wrap.parentElement!.getBoundingClientRect()
      const dx = (cur.tx / 100) * window.innerWidth - st.left - (cur.x / 100) * st.width * cur.scale
      const dy = (cur.ty / 100) * window.innerHeight - st.top - (cur.y / 100) * st.height * cur.scale
      wrap.style.transformOrigin = '0 0'
      wrap.style.transform = `translate(${dx}px, ${dy}px) scale(${cur.scale})`
      // Only fade the high-res crop in past a certain zoom; the first screen shouldn't pay for it
      if (faceRef.current)
        faceRef.current.style.opacity = String(Math.min(1, Math.max(0, (cur.scale - 1.6) / 1.2)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // The works section mounts later, so look the elements up again
    const onResize = () => findEls()
    window.addEventListener('resize', onResize)
    const retry = setTimeout(findEls, 1200)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      clearTimeout(retry)
    }
  }, [])

  return (
    <div className="scene2d">
      {/* The full dark scene; the stage takes its aspect ratio and covers the viewport */}
      <div className="scene2d-stage">
        <div className="scene2d-wrap" ref={wrapRef}>
          <img
            className="scene2d-art"
            src={`${import.meta.env.BASE_URL}scene/cover.jpg`}
            alt=""
            onLoad={() => setSceneProgress(100)}
            onError={() => setSceneProgress(100)}
          />

          <img
            className="scene2d-face"
            ref={faceRef}
            src={`${import.meta.env.BASE_URL}scene/cover-face.jpg`}
            alt=""
            loading="lazy"
            style={{ left: `${FACE.x}%`, top: `${FACE.y}%`, width: `${FACE.w}%`, height: `${FACE.h}%` }}
          />




        </div>
      </div>
    </div>
  )
}
