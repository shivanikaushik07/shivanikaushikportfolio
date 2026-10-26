// Work detail spec: one markdown file per work, at src/content/works/<slug>.md
//
// Frontmatter fields (between the --- lines), all optional:
//   title   heading (falls back to the work's name in the list)
//   banner  path to the top banner image (e.g. /works/budan/banner.jpg; a gradient if absent)
//   year    year
//   role    role / credit
//   tags    array of tags: [Branding, Packaging]
//   link    external URL (the "visit" button)
// The body after the frontmatter is markdown: text, images ![](...), video <video src=...>.
//
// Put media under public/works/ and reference it with absolute /works/... paths.
// An item in works.ts links here by `slug`; items without one fall back to the placeholder detail.

export interface WorkDoc {
  slug: string
  title?: string
  banner?: string
  year?: string
  role?: string
  tags?: string[]
  link?: string
  body: string
}

// Inline every md file as a raw string at build time
const files = import.meta.glob('../content/works/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Minimal frontmatter parser (key: value, arrays as [a, b]) to avoid a Buffer-dependent library
function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  body: string
} {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, body: raw }
  const data: Record<string, string | string[]> = {}
  for (const line of m[1].split('\n')) {
    const mm = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!mm) continue
    const rawVal = mm[2].trim()
    let val: string | string[]
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      val = rawVal
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      val = rawVal.replace(/^['"]|['"]$/g, '')
    }
    data[mm[1]] = val
  }
  return { data, body: m[2].trim() }
}

const docs: Record<string, WorkDoc> = {}
for (const path in files) {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(files[path])
  docs[slug] = { slug, ...data, body } as WorkDoc
}

export function getWorkDoc(slug?: string): WorkDoc | null {
  return slug ? docs[slug] || null : null
}
