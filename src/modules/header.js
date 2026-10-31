import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $ } from './utils.js'

/** Fixed header: shows the "| Sitekeep" label once past the showcase, and the project title inside a detail view. */
export function initHeader({ site, lenis, bus }) {
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

  function scrollToForm({ focus = true } = {}) {
    const isMobile = window.innerWidth <= 900
    const formCard = $('[data-convo-card]') || $('.convo-slot')
    const contactCard = $('[data-contact-card]')

    let target = isMobile ? (formCard || contactCard) : (contactCard || formCard)
    if (!target) target = $('#contact')

    let offset = 0
    if (isMobile) {
      // Position the form sheet cleanly below the fixed header (~56px high + spacing)
      offset = -72
    } else if (contactCard) {
      // Center the card vertically in the viewport with at least 72px top clearance
      const rect = contactCard.getBoundingClientRect()
      offset = -Math.max(72, Math.round((innerHeight - rect.height) / 2))
    }

    lenis.scrollTo(target, {
      duration: 1.5,
      offset,
      force: true,
      onComplete: () => {
        if (focus && bus) bus.emit('contact:focus')
      },
    })
  }

  // Smooth-scroll in-page anchors through Lenis.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return

    const href = a.getAttribute('href')
    const isCta = a.matches('[data-cta]')
    const isContactLink = isCta || href === '#contact' || href === '#form' || href === '#contact-form'

    if (isContactLink) {
      e.preventDefault()

      // If project detail view is open, close it first then scroll to the form
      if (document.documentElement.classList.contains('detail-open')) {
        bus?.once('detail:close', () => {
          requestAnimationFrame(() => scrollToForm({ focus: isCta }))
        })
        bus?.emit('close')
        return
      }

      // If preloader is still running, queue scroll until ready
      if (document.body.classList.contains('is-loading')) {
        bus?.once('ready', () => {
          scrollToForm({ focus: isCta })
        })
        return
      }

      scrollToForm({ focus: isCta })
      return
    }

    if (document.documentElement.classList.contains('detail-open')) return
    const target = $(href)
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target, { duration: 1.6 })
  })

  $('[data-home]').addEventListener('click', (e) => {
    e.preventDefault()
    if (document.documentElement.classList.contains('detail-open')) {
      bus?.emit('close')
      return
    }
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
