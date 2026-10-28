import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $ } from './utils.js'

/** Fixed header: shows the "| Sitekeep" label once past the showcase, and the project title inside a detail view. */
export function initHeader({ site, lenis }) {
  const header = $('[data-header]')
  const label = $('[data-header-label]')
  $('[data-news-label]').textContent = site.news.label
  $('[data-news]').href = site.news.href

  let pastWork = false
  let override = null

  const sync = () => {
    const text = override ?? (pastWork ? site.name : null)
    header.classList.toggle('header--labelled', Boolean(text))
    if (text) label.textContent = text
  }

  ScrollTrigger.create({
    trigger: '[data-statement]',
    start: 'top 60%',
    endTrigger: 'html',
    end: 'bottom bottom',
    onToggle: (self) => {
      pastWork = self.isActive
      sync()
    },
  })

  // Smooth-scroll in-page anchors through Lenis.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a || document.documentElement.classList.contains('detail-open')) return
    const target = $(a.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target, { duration: 1.6, offset: a.getAttribute('href') === '#contact' ? -60 : 0 })
  })
  $('[data-home]').addEventListener('click', (e) => {
    if (document.documentElement.classList.contains('detail-open')) return
    e.preventDefault()
    lenis.scrollTo(0, { duration: 1.6 })
  })

  return {
    setMode(mode) {
      header.classList.toggle('header--dark', mode === 'dark')
    },
    setLabel(text) {
      override = text
      sync()
    },
    reveal(tl, at) {
      tl.fromTo(['[data-news]', '[data-cta]'], { y: -12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, at)
    },
  }
}
