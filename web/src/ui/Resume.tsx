import { motion } from 'framer-motion'
import { ZooopLogo } from './ZooopLogo'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'

// Social links shown under a timeline entry (optional).
// Add entries as { id, label, href } and give each id an icon in ./SocialIcons.
// const SOCIAL_LINKS = [{ id: 'linkedin', label: 'LinkedIn', href: 'https://…' }]

// Résumé data (bilingual). The English is the source copy.
interface ResumeGroup {
  heading?: string
  logo?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
}
// Timeline entries, oldest first. One entry = one camera stop in the scene,
// so the count here must stay equal to FOCUS_POINTS in data/focusPoints.ts (currently 5).
const ENTRIES: ResumeEntry[] = [
  {
    period: 'Education',
    place: 'M.Des \u2014 Graphic Design',
    role: 'BFA \u2014 Applied Arts',
  },
  {
    period: '2021 \u2013 2023',
    place: 'Growth Jockey Pvt. Ltd.',
    groups: [
      {
        heading: 'Brand Manager',
        sub: '2021 \u2013 2022',
        items: [
          'Developed impactful brand strategies and designs.',
          'Worked with clients across beauty & FMCG, electric vehicles (EV), hospitality, entertainment and electronics to grow visibility and engagement.',
        ],
      },
      {
        heading: 'Senior Manager \u2014 UI/UX',
        sub: '2022 \u2013 2023',
        items: [
          'Oversaw the design and user experience of digital products.',
          'Led a team building intuitive, user-centric interfaces focused on usability and engagement.',
          'Aligned design strategy with business objectives and user needs across cross-functional teams.',
        ],
      },
    ],
  },
  {
    period: '2023 \u2013 2025',
    place: 'Healic Health Pvt. Ltd.',
    role: 'Senior Manager \u2014 Design',
    points: [
      'Led a team of designers creating cohesive visual branding across digital and physical platforms.',
      'Branding, marketing campaigns, digital content, print graphics and illustration.',
      'Kept every piece of communication aligned with the company\u2019s purpose and image.',
    ],
  },
  {
    period: '2025 \u2013 2026',
    place: 'Kreo Design & Innovation',
    role: 'Asst. Creative Director',
    points: [
      'Led cross-functional teams in crafting brand identities, digital experiences and marketing campaigns.',
    ],
  },
  {
    period: 'Feb 2026 \u2013 Present',
    place: 'Valarie Group',
    role: 'Asst. Creative Director',
    points: [
      'Led cross-functional teams in crafting brand identities, digital experiences and marketing campaigns.',
    ],
  },
]

// Both languages point at the same English entries for now.
const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
  en: { title: 'R\u00e9sum\u00e9', entries: ENTRIES },
  zh: { title: 'R\u00e9sum\u00e9', entries: ENTRIES },
}

// Each entry maps in order to a focus anchor (a camera stop); the order must match entries.
// That list is the single source of truth: data/focusPoints.ts (Scene2D.tsx reads it too).
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading =
    group.logo === 'zooop' ? (
      <a
        className="zooop-logo-link"
        href={group.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ZOOOP"
      >
        <ZooopLogo className="zooop-logo" animated />
      </a>
    ) : group.link ? (
      <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
        {group.heading}
      </a>
    ) : (
      <span>{group.heading}</span>
    )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {group.logoImg && (
          <span className="tl-group-logo">
            <img src={group.logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body wraps the text (the dot stays outside as the timeline marker) so mobile
          can give it a card backing; it hugs the content height, without tl-entry's layout
          padding. A plain div, not motion: framer variants pass through it via React context,
          so the leaves remain direct stagger children of tl-entry and the intro is unchanged. */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          {entry.logo && (
            <span className="tl-logo-chip">
              <img src={entry.logo.src} alt={entry.logo.alt} loading="lazy" />
            </span>
          )}
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
