import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type Ref } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { WORKS, SECTION_COVERS, type GalleryItem, type WorkListItem, type WorkSection, type WorksLang } from '../data/works'
import { getWorkDoc } from '../data/workDocs'
import { workCodeRenderer } from './workBlocks'

const EASE = [0.22, 1, 0.36, 1]

// One row of the minimal list: name left, meta (views/tags) right, hairline between.
// The whole row opens the full-screen detail.
function WorkLine({ item, onOpen }: { item: WorkListItem; onOpen: (item: WorkListItem) => void }) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      <button className="wk-line-btn" onClick={() => onOpen(item)}>
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
      </button>
    </li>
  )
}

const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src)

// Gallery cell: falls back to a numbered placeholder when the image is missing,
// the same way section covers do.
function GalleryTile({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem
  index: number
  onOpen: () => void
}) {
  const [failed, setFailed] = useState(false)
  const { src, tall, wide } = typeof item === 'string' ? { src: item, tall: false, wide: false } : item
  const cls = `wk-tile${tall ? ' is-tall' : ''}${wide ? ' is-wide' : ''}`
  const label = String(index + 1).padStart(2, '0')

  if (failed) {
    return (
      <div className={`${cls} is-ph`} aria-hidden="true">
        <span className="wk-tile-no">{label}</span>
      </div>
    )
  }
  if (isVideo(src)) {
    return (
      <button className={cls} onClick={onOpen}>
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      </button>
    )
  }
  return (
    <button className={cls} onClick={onOpen}>
      <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    </button>
  )
}

// One full-height section card: full-bleed image on the left, text on the right
// (number + title + list). A gallery section (section.gallery) instead fills the whole
// card with an image grid — no small cover, no list.
function SectionCard({
  section,
  data,
  onOpen,
  onOpenImage,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
  onOpenImage: (p: LightboxState) => void
}) {
  const [coverError, setCoverError] = useState(false)
  const cover = SECTION_COVERS[section.id]
  const head = (
    <div className="wk-card-head">
      <span className="wk-card-no">{section.no}</span>
      <h3 className="wk-card-title">{section.title}</h3>
      <span className="wk-card-tagline">{section.tagline}</span>
    </div>
  )

  if (section.gallery) {
    return (
      <div className="wk-card is-gallery">
        {head}
        <div
          className="wk-grid"
          // Column count follows the image count: grid-auto-rows:1fr makes cells fill the
          // card, and too few columns squashes them into bars, so keep them near square
          style={{ ['--wk-cols' as string]: String(section.gallery.length > 9 ? 4 : section.gallery.length > 4 ? 3 : 2) } as CSSProperties}
        >
          {section.gallery.map((it, i) => (
            <GalleryTile
              key={typeof it === 'string' ? it : it.src}
              item={it}
              index={i}
              onOpen={() =>
                onOpenImage({
                  items: section.gallery!,
                  index: i,
                  camera: section.galleryStyle === 'camera',
                  label: section.title,
                })
              }
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="wk-card">
      {head}
      {/* No cover, no placeholder — better to draw nothing than a big numbered box */}
      {cover && !coverError && (
        <div className="wk-card-cover">
          <img src={cover} alt="" onError={() => setCoverError(true)} />
        </div>
      )}
      <SectionWorks section={section} data={data} onOpen={onOpen} />
    </div>
  )
}

// Gallery lightbox: click a cell for the full-size original, arrow keys to page through
interface LightboxState {
  items: GalleryItem[]
  index: number
  camera?: boolean
  label?: string
}

function Lightbox({
  items,
  index,
  camera,
  label,
  onClose,
  onIndex,
}: LightboxState & {
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const current = items[index]
  const src = typeof current === 'string' ? current : current.src
  const shot = typeof current === 'string' ? undefined : current.shot
  // Show "--" for anything missing: that's how a camera display shows a parameter it
  // couldn't read, and it beats inventing a number
  const dash = (v?: string) => (v && v.trim() ? v.trim() : '--')
  const many = items.length > 1
  const go = (step: number) => onIndex((index + step + items.length) % items.length)

  return (
    <>
      <motion.div
        className="wk-lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        className="wk-lightbox"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.32, ease: EASE }}
        onClick={onClose}
      >
        <button className="wk-detail-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {many && (
          <button
            className="wk-lb-nav is-prev"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        {/* The key must change for the new image/video to actually reload */}
        <div
          className={`wk-lb-media${camera ? ' is-camera' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo(src) ? (
            <video key={src} src={src} autoPlay muted loop playsInline controls />
          ) : (
            <img key={src} src={src} alt="" />
          )}
          {camera && (
            <span className="wk-cam" aria-hidden="true">
              <span className="wk-cam-c tl" />
              <span className="wk-cam-c tr" />
              <span className="wk-cam-c bl" />
              <span className="wk-cam-c br" />
              <span className="wk-cam-grid" />
              <span className="wk-cam-tag">
                <span className="wk-cam-dot" />
                {label}
              </span>
              {shot?.camera && <span className="wk-cam-body">{shot.camera}</span>}
              <span className="wk-cam-exif">
                <span className="wk-cam-val">{dash(shot?.focal)}</span>
                <span className="wk-cam-val">{dash(shot?.aperture)}</span>
                <span className="wk-cam-val">{shot?.shutter ? `${shot.shutter}s` : '--'}</span>
                <span className="wk-cam-val">ISO {dash(shot?.iso)}</span>
              </span>
              <span className="wk-cam-frame">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </span>
          )}
        </div>

        {many && (
          <button
            className="wk-lb-nav is-next"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            aria-label="Next"
          >
            ›
          </button>
        )}

        {many && !camera && (
          <span className="wk-lb-count" aria-hidden="true">
            {index + 1} / {items.length}
          </span>
        )}
      </motion.div>
    </>
  )
}

// The list of works in a section: flat items, grouped groups, plus awards and footer print
function SectionWorks({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
}) {
  return (
    <div className="wk-card-body">
      {section.items && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} />
          ))}
        </ul>
      )}

      {section.groups &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            <div className="wk-sub-head">{g.heading}</div>
            <ul className="wk-list">
              {g.items.map((it, i) => (
                <WorkLine key={i} item={{ name: it }} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        ))}

      {(section.awards || section.footer) && (
        <div className="wk-foot">
          {section.awards && (
            <p className="wk-foot-line">
              <span className="wk-foot-label">{data.awardsLabel}</span>
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

// Full-screen detail: renders the work's md (banner + title + markdown body + external
// link), falling back to a placeholder banner plus meta/tags when there is no md.
function WorkDetail({
  item,
  data,
  onClose,
  onOpenImage,
}: {
  item: WorkListItem
  data: WorksLang
  onClose: () => void
  onOpenImage: (p: LightboxState) => void
}) {
  const [bannerError, setBannerError] = useState(false)
  const doc = getWorkDoc(item.slug)
  const title = (doc && doc.title) || item.name
  const banner = doc && doc.banner
  // With an md, show everything; without one, the detail keeps just the title and the
  // shared placeholder copy
  const link = doc ? doc.link || item.link : null
  const tags = doc ? doc.tags || item.tags : null
  // The subtitle omits the year; tags render separately as badges
  const sub = doc ? [item.meta, doc.role].filter(Boolean).join('  ·  ') : ''

  // Click an image in the body to enlarge it. Event delegation rather than a callback
  // threaded through every block: the markdown blocks are pure render functions and
  // shouldn't grow a props layer just for this. Only <img> counts — videos have their own
  // controls, so a click there belongs to play/pause.
  const zoomFromBody = (e: MouseEvent<HTMLDivElement>) => {
    const hit = (e.target as HTMLElement).closest('img')
    if (!hit) return
    const all = Array.from(e.currentTarget.querySelectorAll('img'))
    const index = all.indexOf(hit as HTMLImageElement)
    if (index < 0) return
    onOpenImage({ items: all.map((img) => img.getAttribute('src') || ''), index })
  }

  return (
    <>
      <motion.div
        className="wk-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="wk-detail"
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 6 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        <button className="wk-detail-close" onClick={onClose} aria-label={data.closeLabel}>
          ✕
        </button>

        {banner && !bannerError ? (
          <div className="wk-detail-banner">
            {/* The banner is cropped to its container; clicking shows the full original */}
            <img
              src={banner}
              alt={title}
              onError={() => setBannerError(true)}
              onClick={() => onOpenImage({ items: [banner], index: 0 })}
            />
          </div>
        ) : (
          <div className="wk-detail-banner is-ph" aria-hidden="true">
            <span className="wk-detail-ph-text">{title}</span>
          </div>
        )}

        <article className="wk-detail-article">
          <header className="wk-detail-head">
            <h3 className="wk-detail-title">{title}</h3>
            {sub && <div className="wk-detail-sub">{sub}</div>}
            {tags && tags.length > 0 && (
              <div className="wk-detail-tags">
                {tags.map((t, i) => (
                  <span key={i} className="wk-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {doc && doc.body ? (
            <div className="wk-md" onClick={zoomFromBody}>
              {/* fenced blocks (bars / rows / grid / figure) become components */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{ code: workCodeRenderer as never }}
              >
                {doc.body}
              </ReactMarkdown>
            </div>
          ) : (
            // No md: demonstrate what a detail page supports — intro text, an image/video
            // placeholder and a jump button
            <>
              <p className="wk-detail-desc">{data.detailPlaceholder}</p>
              <div className="wk-detail-ph-img" aria-hidden="true">
                <span className="wk-detail-ph-img-label">{data.phImageLabel}</span>
              </div>
              <span className="wk-detail-link is-ph" role="button" aria-disabled="true">
                {data.phButtonLabel} <span aria-hidden="true">↗</span>
              </span>
            </>
          )}

          {link && (
            <a
              className="wk-detail-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.visitLabel} <span aria-hidden="true">↗</span>
            </a>
          )}
        </article>
      </motion.div>
    </>
  )
}

export default function Works({ lang, innerRef }: { lang: 'en' | 'zh'; innerRef: Ref<HTMLElement> }) {
  const data = WORKS[lang]
  const sections = data.sections
  const count = sections.length

  const [active, setActive] = useState<WorkListItem | null>(null) // the item whose detail is open
  const [lightbox, setLightbox] = useState<LightboxState | null>(null) // the enlarged gallery image

  // Pin vertical scroll and turn it into horizontal travel: measure how far the card row can
  // actually move (in px), then map scroll progress onto it
  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start start', 'end end'],
  })

  // track width - viewport width = the distance to travel; re-measured on resize/language change
  const [scrollRange, setScrollRange] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setScrollRange(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [count, lang])

  // Interpolate in px (smoother than vw strings); scroll distance maps 1:1 to travel
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  // The "keep scrolling" cue fades once the row reaches the end
  const hintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // Lock scrolling while a detail is open, and close on Escape
  useEffect(() => {
    if (!active && !lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // The lightbox sits above the detail, so Escape only closes the topmost layer
        if (lightbox) setLightbox(null)
        else setActive(null)
        return
      }
      if (!lightbox) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const step = e.key === 'ArrowLeft' ? -1 : 1
        setLightbox((lb) =>
          lb ? { ...lb, index: (lb.index + step + lb.items.length) % lb.items.length } : lb
        )
      }
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active, lightbox])

  return (
    <section className="works" lang={lang} ref={innerRef}>
      <div
        className="wk-gallery"
        ref={galleryRef}
        style={{ height: `calc(100vh + ${scrollRange}px)` }}
      >
        <div className="wk-gallery-sticky">
          <span className="wk-gallery-title">{data.title}</span>

          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {sections.map((s) => (
              <SectionCard
                key={s.id}
                section={s}
                data={data}
                onOpen={setActive}
                onOpenImage={setLightbox}
              />
            ))}
          </motion.div>

          <div className="wk-progress" aria-hidden="true">
            <motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} />
          </div>
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            {data.hint}
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            index={lightbox.index}
            camera={lightbox.camera}
            label={lightbox.label}
            onClose={() => setLightbox(null)}
            onIndex={(index) => setLightbox((lb) => (lb ? { ...lb, index } : lb))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <WorkDetail
            key={active.slug || active.name}
            item={active}
            data={data}
            onClose={() => setActive(null)}
            onOpenImage={setLightbox}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
