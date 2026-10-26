// Reusable case-study blocks for work detail pages.
//
// They are authored as fenced code blocks in the markdown, e.g.
//
//   ```bars
//   Creator | 70 | Innovation, originality, vision, problem solving.
//   ```
//
// A fence is used rather than custom HTML tags because markdown already parses
// it, the content survives untouched, and the file still reads fine as plain
// text if anyone opens it outside the site.
//
// Available fences — all optional, use only the ones a project needs:
//
//   bars     label | percent | description       labelled percentage bars
//   rows     term | description                   definition list with rules
//   grid     one media path per line              image / video grid. Options as
//                                                their own lines: `cols: N`,
//                                                `ratio: W/H`, `align: height`,
//                                                `controls`
//   figure   media path, then optional caption    single image or video +
//                                                caption. Options: `controls`,
//                                                `max: 260px` to cap the width
//                                                and centre it — for a tall
//                                                phone or full-page capture
//                                                that would otherwise dominate
//
// Anywhere a path is accepted, an .mp4 / .webm / .mov renders as video instead
// of an image. Video loops silently by default — add a `controls` line for
// something with sound or longer than a few seconds, which also stops autoplay.
//   metrics  value | label                        results / numbers panel.
//                                                Option: `cols: N`
//   palette  name | #hex | code                   colour swatches. Option:
//                                                `cols: N`. A value may also be
//                                                a full `linear-gradient(...)`
//   quote    the quote, then `— attribution`      pull quote
//   note     one or more lines                    small print, mono
//   part     one line                             numbered section divider
//   table    header row, then one row per line,   comparison matrix. Cells are
//            cells split by |                     pipe-separated. Option:
//                                                 `highlight: N` emphasises the
//                                                 Nth body row.
//   slots    one label per line                   image placeholders, for a
//                                                page written before the
//                                                artwork exists. Options:
//                                                `cols: N`, `ratio: W/H`
//
// Anything else falls through to a normal code block.
import type { ReactNode } from 'react'

const lines = (src: string) =>
  src
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const cells = (line: string) => line.split('|').map((c) => c.trim())

// Pulls `key: value` option lines out of a fence and returns them separately
// from the content lines, so every block can take options the same way.
function options(src: string, keys: string[]) {
  const opt: Record<string, string> = {}
  const items: string[] = []
  for (const l of lines(src)) {
    const m = /^([a-z]+):\s*(.+)$/i.exec(l)
    if (m && keys.includes(m[1].toLowerCase())) {
      opt[m[1].toLowerCase()] = m[2].trim()
      continue
    }
    items.push(l)
  }
  return { opt, items }
}

// `3/4`, `3:4` and `0.75` all mean the same shape.
const asRatio = (v?: string) => {
  if (!v) return ''
  const m = /^([\d.]+)\s*[/:]\s*([\d.]+)$/.exec(v)
  if (m) return `${m[1]} / ${m[2]}`
  return /^[\d.]+$/.test(v) ? v : ''
}

const colStyle = (cols: number, ratio?: string) => {
  const style: Record<string, string> = { ['--wk-g-cols']: String(cols) }
  const r = asRatio(ratio)
  if (r) style['--wk-g-ratio'] = r
  return style as never
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

// One path, either kind of media. Silent looping autoplay is the default
// because most case-study motion is a few seconds of brand animation; a clip
// with sound asks for `controls`, which also turns autoplay off.
function Media({
  src,
  alt,
  controls,
  elRef,
}: {
  src: string
  alt?: string
  controls?: boolean
  elRef?: (el: any) => void
}) {
  if (isVideo(src)) {
    // Two different jobs. Without controls it is ambient motion: muted and
    // looping, which is also the only way browsers allow autoplay. With
    // controls the viewer presses play, so it must NOT be muted — the clip
    // would otherwise be silent until they found the unmute button — and it
    // plays once rather than looping.
    return controls ? (
      <video ref={elRef} src={src} controls playsInline preload="metadata" />
    ) : (
      <video ref={elRef} src={src} autoPlay muted loop playsInline preload="metadata" />
    )
  }
  return <img ref={elRef} src={src} alt={alt || ''} loading="lazy" />
}

function Bars({ src }: { src: string }) {
  const rows = lines(src).map(cells)
  return (
    <div className="wk-bars">
      {rows.map(([label, pct, desc], i) => {
        const value = Math.max(0, Math.min(100, Number(pct) || 0))
        return (
          <div className="wk-bar" key={i}>
            <div className="wk-bar-head">
              <span className="wk-bar-label">{label}</span>
              <span className="wk-bar-pct">{value}%</span>
            </div>
            <div className="wk-bar-track">
              <span className="wk-bar-fill" style={{ width: `${value}%` }} />
            </div>
            {desc && <p className="wk-bar-desc">{desc}</p>}
          </div>
        )
      })}
    </div>
  )
}

function Rows({ src }: { src: string }) {
  const rows = lines(src).map(cells)
  return (
    <dl className="wk-rows">
      {rows.map(([term, desc], i) => (
        <div className="wk-row" key={i}>
          <dt>{term}</dt>
          {desc && <dd>{desc}</dd>}
        </div>
      ))}
    </dl>
  )
}

function Grid({ src }: { src: string }) {
  const all = lines(src)
  let cols = 2
  let ratio = ''
  let byHeight = false
  let controls = false
  const items: string[] = []
  for (const l of all) {
    if (/^controls$/i.test(l)) { controls = true; continue }
    const c = /^cols:\s*(\d+)$/i.exec(l)
    if (c) { cols = Math.max(1, Math.min(6, Number(c[1]))); continue }
    // `ratio: 3/4` forces every cell to one shape. It crops nothing (cells use
    // object-fit: contain) but can leave small empty margins.
    const r = /^ratio:\s*([\d.]+)\s*[/:]\s*([\d.]+)$|^ratio:\s*([\d.]+)$/i.exec(l)
    if (r) { ratio = r[3] ? r[3] : `${r[1]} / ${r[2]}`; continue }
    // `align: height` lays the row out so every image ends up the SAME HEIGHT
    // with its own natural width — which is how a row of posters is usually
    // designed. Nothing is cropped and nothing is letterboxed.
    if (/^align:\s*height$/i.test(l)) { byHeight = true; continue }
    items.push(l)
  }

  if (byHeight) {
    // Widths must be proportional to each image's aspect ratio for the heights
    // to match. That ratio is only known once the image has loaded, so each
    // one sets its own flex-grow on load.
    // A ref, not onLoad: a cached image can already be complete before React
    // attaches the handler, in which case onLoad never fires and the row keeps
    // equal widths — which is exactly the uneven-height bug this is here to fix.
    // Video reports its size as videoWidth/Height on `loadedmetadata`, an image
    // as naturalWidth/Height on `load`. Same job, different names and event.
    const sizeToAspect = (el: any) => {
      if (!el) return
      const video = el.tagName === 'VIDEO'
      const size = () => [
        video ? el.videoWidth : el.naturalWidth,
        video ? el.videoHeight : el.naturalHeight,
      ]
      const apply = () => {
        const fig = el.parentElement
        const [w, h] = size()
        if (fig && h) fig.style.flexGrow = String(w / h)
      }
      const ready = video ? el.readyState >= 1 : el.complete && el.naturalHeight
      if (ready) apply()
      else el.addEventListener(video ? 'loadedmetadata' : 'load', apply, { once: true })
    }
    return (
      <div className="wk-imgrid is-row">
        {items.map((src2, i) => (
          <figure key={i}>
            <Media src={src2} controls={controls} elRef={sizeToAspect} />
          </figure>
        ))}
      </div>
    )
  }

  const style: Record<string, string> = { ['--wk-g-cols']: String(cols) }
  if (ratio) style['--wk-g-ratio'] = ratio
  return (
    <div className={`wk-imgrid${ratio ? ' is-fixed' : ''}`} style={style as never}>
      {items.map((src2, i) => (
        <figure key={i}>
          <Media src={src2} controls={controls} />
        </figure>
      ))}
    </div>
  )
}

function Figure({ src }: { src: string }) {
  const { opt, items } = options(src, ['max'])
  const controls = items.some((l) => /^controls$/i.test(l))
  const [media, ...rest] = items.filter((l) => !/^controls$/i.test(l))
  const caption = rest.join(' ')
  // A full-page phone capture is many times taller than it is wide; at the
  // full column width it would run for thousands of pixels. `max` caps it and
  // centres it instead, which is how such a capture is normally shown.
  const style = opt.max ? ({ maxWidth: opt.max, marginInline: 'auto' } as const) : undefined
  return (
    <figure className="wk-figure" style={style}>
      <Media src={media} alt={caption} controls={controls} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// Results panel: big number over a short label, in a hairline grid.
function Metrics({ src }: { src: string }) {
  const { opt, items } = options(src, ['cols'])
  const rows = items.map(cells)
  const cols = Math.max(1, Math.min(4, Number(opt.cols) || Math.min(rows.length, 4)))
  return (
    <div className="wk-metrics" style={colStyle(cols)}>
      {rows.map(([value, label], i) => (
        <div className="wk-metric" key={i}>
          <div className="wk-metric-v">{value}</div>
          {label && <div className="wk-metric-k">{label}</div>}
        </div>
      ))}
    </div>
  )
}

// Relative luminance, to decide whether a swatch takes dark or light type.
// Only #rgb / #rrggbb are measured; anything else (a gradient) is assumed dark.
function isLight(value: string) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!m) return false
  let h = m[1]
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.38
}

// Colour swatches: name, the value itself, and an optional system code.
function Palette({ src }: { src: string }) {
  const { opt, items } = options(src, ['cols'])
  const rows = items.map(cells)
  const cols = Math.max(1, Math.min(6, Number(opt.cols) || Math.min(rows.length, 4)))
  return (
    <div className="wk-pal" style={colStyle(cols)}>
      {rows.map(([name, value, code], i) => (
        <div
          className={`wk-sw${isLight(value || '') ? ' is-light' : ''}`}
          key={i}
          style={{ background: value }}
        >
          <span className="wk-sw-name">{name}</span>
          {code && <span className="wk-sw-code">{code}</span>}
          {value && !value.startsWith('linear-gradient') && (
            <span className="wk-sw-hex">{value.toUpperCase()}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Pull quote. A line opening with an em dash or `--` is the attribution.
function Quote({ src }: { src: string }) {
  const body: string[] = []
  let cite = ''
  for (const l of lines(src)) {
    const m = /^(?:—|--)\s*(.+)$/.exec(l)
    if (m) cite = m[1]
    else body.push(l)
  }
  return (
    <blockquote className="wk-quote">
      <p>{body.join(' ')}</p>
      {cite && <cite>{cite}</cite>}
    </blockquote>
  )
}

// Small print: caveats, do/don't lists, a figure's source. Mono, muted.
function Note({ src }: { src: string }) {
  return (
    <div className="wk-note">
      {lines(src).map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  )
}

// Section divider for a page covering several brands or phases.
function Part({ src }: { src: string }) {
  return <div className="wk-part">{lines(src).join(' ')}</div>
}

// Comparison matrix — a competitive landscape, a feature grid. The first line
// is the header; `highlight: N` marks the row that is "us".
// It sits at the same width as a full-width image. Five columns of prose do not
// fit there, so it scrolls sideways with the first column pinned — the row
// label stays on screen while you pan. Cells carry data-label for any future
// stacked layout.
function Table({ src }: { src: string }) {
  const { opt, items } = options(src, ['highlight'])
  if (!items.length) return null
  const [head, ...body] = items.map(cells)
  const hi = Number(opt.highlight) || 0
  return (
    <div className="wk-table-wrap">
      <table className="wk-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className={r + 1 === hi ? 'is-hi' : undefined}>
              {row.map((cell, i) => (
                <td key={i} data-label={head[i]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Labelled placeholders, so a write-up can ship before the artwork does.
// Swap the fence to `grid` / `figure` once the images exist.
function Slots({ src }: { src: string }) {
  const { opt, items } = options(src, ['cols', 'ratio'])
  const cols = Math.max(1, Math.min(4, Number(opt.cols) || 1))
  return (
    <div className="wk-slots" style={colStyle(cols, opt.ratio || '16/9')}>
      {items.map((label, i) => (
        <div className="wk-slot" key={i}>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

const BLOCKS: Record<string, (p: { src: string }) => ReactNode> = {
  bars: Bars,
  rows: Rows,
  grid: Grid,
  figure: Figure,
  metrics: Metrics,
  palette: Palette,
  quote: Quote,
  note: Note,
  part: Part,
  table: Table,
  slots: Slots,
}

// Drop-in `code` renderer for ReactMarkdown.
export function workCodeRenderer({
  className,
  children,
  ...props
}: {
  className?: string
  children?: ReactNode
  [k: string]: unknown
}) {
  const lang = /language-(\w+)/.exec(className || '')?.[1]
  const Block = lang ? BLOCKS[lang] : undefined
  if (Block) return Block({ src: String(children ?? '') })
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}
