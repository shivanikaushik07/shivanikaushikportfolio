// Works data. Pure data — Works.tsx only renders it.
//
// Section fields:
//   id        unique key (used for the framer layoutId shared-element animation
//             and to look up the cover in SECTION_COVERS)
//   no        '01'…'07'
//   title     section heading
//   tagline   one line, shown next to the heading
//   items[]   the projects: { name, meta?, tags?, link? }
//             clicking one opens a full-screen detail. Add a `slug` and a
//             matching src/content/works/<slug>.md to give it a real page;
//             without one it falls back to the shared placeholder below.
//   groups[]  grouped projects instead of items: { heading, items: string[] }
//   awards[]  award chips (optional)
//   footer    a line of small print at the bottom (optional)

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  // gallery sections show a grid of images instead of a clickable project list.
  // Paths that 404 render as a numbered placeholder tile, so it is safe to list
  // files before they exist. .mp4 / .webm entries render as looping video.
  // `tall` / `wide` make a tile span 2 rows / 2 columns, so portrait and
  // landscape pieces keep their shape instead of being cropped square.
  gallery?: GalleryItem[]
  // 'camera' wraps the zoomed view in a viewfinder UI (corner marks, thirds, frame count)
  galleryStyle?: 'camera'
  awards?: string[]
  footer?: string
}

// Expected filenames for a gallery section: public/works/gallery/<id>/01.jpg …
// Drop images in with those names and they light up automatically.
// Camera data shown in the photography lightbox overlay.
// Anything left blank renders as "--" instead of a made-up number.
export interface ShotMeta {
  camera?: string // body + lens, e.g. 'Nikon D5300 · 35mm f/1.8'
  focal?: string // e.g. '35mm'
  aperture?: string // e.g. 'f/2.8'
  shutter?: string // e.g. '1/250'
  iso?: string // e.g. '200'
}

export type GalleryItem =
  | string
  | { src: string; tall?: boolean; wide?: boolean; shot?: ShotMeta }

const galleryFile = (id: string, name: string) =>
  `${import.meta.env.BASE_URL}works/gallery/${id}/${name}`

const galleryPaths = (id: string, n: number): string[] =>
  Array.from(
    { length: n },
    (_, i) => `${import.meta.env.BASE_URL}works/gallery/${id}/${String(i + 1).padStart(2, '0')}.jpg`
  )

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

// ── Photography: camera settings ──────────────────────────────────────────
// None of the files you sent carried EXIF, so these are blank on purpose —
// a wrong f-stop printed next to your own photo is worse than no f-stop.
// Fill any field in and it replaces the "--" in the viewfinder overlay;
// leave the rest blank and they stay as "--".
const PHOTO_SHOTS: Record<string, ShotMeta> = {
  '01.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '02.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '03.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '04.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '05.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '06.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '07.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '08.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
  '09.jpg': { camera: '', focal: '', aperture: '', shutter: '', iso: '' },
}

const PHOTOS: GalleryItem[] = Object.keys(PHOTO_SHOTS).map((name) => ({
  src: galleryFile('photography', name),
  shot: PHOTO_SHOTS[name],
}))

// TAGLINES are placeholders — replace with your own wording.
const SECTIONS: WorkSection[] = [
  {
    id: 'branding',
    no: '01',
    title: 'Branding',
    tagline: 'Identity systems and rebrands',
    items: [
      { name: 'Pi Rebranding', meta: 'Identity system', slug: 'pi-rebranding' },
      { name: 'Budan Rebranding', meta: 'Coffee equipment', slug: 'budan' },
      { name: 'Bespoke', meta: 'Brand guidelines', slug: 'bespoke-guidelines' },
    ],
  },
  {
    id: 'uiux',
    no: '02',
    title: 'UI/UX',
    tagline: 'Product and interface design',
    items: [
      { name: 'HR Dashboard', meta: 'Growth Jockey', slug: 'intellsys' },
      { name: 'Build with US', meta: 'Growth Jockey', slug: 'build-with-us' },
      { name: 'Finding the Best Battery & Inverter Combo', meta: 'Livguard', slug: 'livguard' },
    ],
  },
  {
    id: 'meta-ads',
    no: '03',
    title: 'Meta Ads',
    tagline: 'Paid social campaigns',
    items: [
      { name: 'Bespoke', meta: 'Content plan & creative', slug: 'bespoke-meta-ads' },
      { name: 'Seoul Tonic', meta: 'Creative experiment', slug: 'seoul-tonic-meta-ads' },
    ],
  },
  {
    id: 'illustration',
    no: '04',
    title: 'Illustrations & Animations',
    tagline: 'Visual storytelling and motion',
    // 10 tiles fill a 4x3 grid exactly: the two portrait animations span two
    // rows each, everything else is a single cell.
    gallery: [
      { src: galleryFile('illustration', 'gif-waterfall.mp4'), tall: true },
      { src: galleryFile('illustration', 'gif-cafe.mp4'), tall: true },
      galleryFile('illustration', 'gif-boy.mp4'),
      galleryFile('illustration', 'gif-logo.mp4'),
      ...galleryPaths('illustration', 6),
    ],
  },
  {
    id: 'photography',
    no: '05',
    title: 'Photography',
    tagline: 'Product and brand imagery',
    gallery: PHOTOS,
    galleryStyle: 'camera',
  },
]

const LABELS = {
  title: 'Works',
  closeLabel: 'Back',
  openLabel: 'Explore',
  hint: 'Keep scrolling',
  awardsLabel: 'Awards',
  visitLabel: 'Visit site',
  detailPlaceholder: 'Project write-up coming soon.',
  phImageLabel: 'Image / Video',
  phButtonLabel: 'Link',
  countLabel: (n: number) => `${n} works`,
}

// Both languages point at the same English content for now.
export const WORKS: Record<'zh' | 'en', WorksLang> = {
  en: { ...LABELS, sections: SECTIONS },
  zh: { ...LABELS, sections: SECTIONS },
}

// Section covers — the full-height image on each gallery card.
// Drop 3:2 images (1200x800) at public/works/covers/<id>.jpg.
// Missing files fall back to a big numbered gradient, so this is safe to leave
// pointing at files that do not exist yet.
export const SECTION_COVERS: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, `${import.meta.env.BASE_URL}works/covers/${s.id}.jpg`])
)

// Count the works in a section (items or groups), used by the index row on hover
export function sectionCount(section: WorkSection): number {
  if (section.gallery) return section.gallery.length
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
