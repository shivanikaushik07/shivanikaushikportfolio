import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import Scene2D from './scene/Scene2D'
// The film-grain overlay is off. To bring it back, restore the import below and <NoiseOverlay />.
// import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'

type Lang = 'en' | 'zh'

const COPY = {
  en: {
    title: 'About Shivani',
    paragraphs: [
      "I'm Shivani \u2014 a Brand and Communication Designer with over four years of experience building brand narratives that hold up across platforms. I lead creative teams, carry design projects from concept to execution, and grow brand visibility through branding, art direction, photography, UI/UX and motion graphics.",
      'What I enjoy most is turning a complicated idea into a visual story \u2014 one that lines up with the business goal and still looks like the brand.',
    ],
  },
  zh: {
    title: 'About Shivani',
    paragraphs: [
      "I'm Shivani \u2014 a Brand and Communication Designer with over four years of experience building brand narratives that hold up across platforms. I lead creative teams, carry design projects from concept to execution, and grow brand visibility through branding, art direction, photography, UI/UX and motion graphics.",
      'What I enjoy most is turning a complicated idea into a visual story \u2014 one that lines up with the business goal and still looks like the brand.',
    ],
  },
}

function Hero({ lang, cueOpacity }: { lang: Lang; cueOpacity: MotionValue<number> }) {
  const { title, paragraphs } = COPY[lang]
  // Drive the fade from page scroll rather than the about block's own position: once the
  // text moved to the top of the hero it was already past the old trigger line at scrollY=0,
  // which made the whole block start out transparent.
  const { scrollY } = useScroll()
  const blur = useTransform(scrollY, [0, 420], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollY, [0, 420], [1, 0])
  // Parallax: the heading rises faster and its letter-spacing opens up; the body rises slower
  const titleY = useTransform(scrollY, [0, 840], [0, -96])
  const bodyY = useTransform(scrollY, [0, 840], [0, -52])
  const titleSpacing = useTransform(scrollY, [0, 840], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div
        className="about"
        lang={lang}
        style={{ filter: blur, opacity }}
      >
        {/* Intro animation goes on the inner element, so its fill can't lock opacity and
            override the scroll-driven opacity on the outer one */}
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {title}
          </motion.h1>
          {paragraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : 'SCROLL DOWN'}</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button className="lang-toggle" onClick={onToggle} aria-label="Switch language">
      {lang === 'en' ? 'ZH' : 'EN'}
    </button>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const { scrollY } = useScroll()
  // Works overlay: as the section's top travels from the bottom of the viewport to the middle,
  // that progress drives the scene's darkening and blur
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'] // half the original darkening (was 0.82)
  )
  const fogBlur = useTransform(worksProgress, [0, 1], ['blur(0px)', 'blur(10px)'])
  // Scroll darkening: dim the scene past the hero so the résumé text stays readable
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.22])
  // The hero's scroll cue fades out with it
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // The gradient at the bottom of the hero fades once scrolling starts
  const heroGradientOpacity = useTransform(scrollY, [0, 240], [1, 0])
  // Frosted right rail: fades in at the résumé (the hero has no frosting)
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // The hero's decorative frame and corner marks fade on scroll
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* Loading mask: covers the screen until the artwork has loaded, then fades */}
      <LoadingScreen />

      {/* Fixed illustration background */}
      <div className="scene-bg">
        <Scene2D />
      </div>

      {/* Scroll-darkening overlay */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* Fixed works overlay: darkening only (halved); the blur is commented out for now */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg /* , backdropFilter: fogBlur, WebkitBackdropFilter: fogBlur */ }}
        aria-hidden="true"
      />

      {/* Fixed frosted right rail, fading in at the résumé */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* Gradient under the hero, fading on scroll — commented out for now */}
      {/* <motion.div
        className="hero-gradient"
        style={{ opacity: heroGradientOpacity }}
        aria-hidden="true"
      /> */}

      {/* Language toggle hidden for now; the site is English only */}
      {/* <LangToggle lang={lang} onToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))} /> */}

      {/* Hero decoration: hairline inner frame, corner registration marks and corner
          metadata, all fading on scroll */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">Shivani Kaushik</span>
          <span>Brand &amp; Communication Designer</span>
        </div>
        <div className="hero-meta hm-tr">Portfolio — 2026</div>
        <div className="hero-meta hm-bl">Brand · Story · Craft</div>
        <div className="hero-meta hm-right">Based in India</div>
      </motion.div>


      {/* Scrollable content */}
      <main className="content">
        <Hero lang={lang} cueOpacity={cueOpacity} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
      </main>
    </>
  )
}
