import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createMedia } from './media.js'
import { icons } from './icons.js'
import { $, $$, escapeHTML } from './utils.js'
import { setTheme, resetTheme } from './theme.js'

/**
 * Pinned card stack. Scroll progress through the section picks the active project;
 * the active card sits in front, the next two peek out underneath, passed cards lift away.
 */

// Position of a card relative to the active one (d = index - activeIndex).
function stateFor(d) {
  if (d < 0) return { yPercent: -9, scale: 1.035, autoAlpha: 0 }
  if (d === 0) return { yPercent: 0, scale: 1, autoAlpha: 1 }
  if (d === 1) return { yPercent: 5, scale: 0.94, autoAlpha: 1 }
  if (d === 2) return { yPercent: 9.5, scale: 0.88, autoAlpha: 1 }
  return { yPercent: 13, scale: 0.82, autoAlpha: 0 }
}
const shadeFor = (d) => (d <= 0 ? 0 : d === 1 ? 0.16 : 0.3)

export function initShowcase({ projects, lenis, bus, reduced }) {
  const section = $('[data-showcase]')
  const stack = $('[data-stack]')
  const rail = $('[data-rail]')
  const caption = $('[data-caption]')
  const shuffleBtn = $('[data-shuffle]')
  const skipBtn = $('[data-skip]')
  const n = projects.length
  section.style.setProperty('--n', n)

  shuffleBtn.innerHTML = icons.shuffle
  skipBtn.innerHTML = icons.down

  const cards = projects.map((p, i) => {
    const card = document.createElement('article')
    card.className = 'card'
    card.style.zIndex = String(n - i)
    card.innerHTML = `
      <div class="card__media"></div>
      <div class="card__shade"></div>
      <button class="card__hit" aria-label="Open project: ${escapeHTML(p.client)}"></button>`
    const media = createMedia(p.cover)
    card.querySelector('.card__media').appendChild(media.el)
    card.media = media
    card.shade = card.querySelector('.card__shade')
    card.querySelector('.card__hit').addEventListener('click', () => {
      if (i === active) bus.emit('open', { index: i, card })
      else scrollToIndex(i)
    })
    stack.appendChild(card)
    return card
  })

  rail.innerHTML = projects.map(() => '<span class="rail__tick"></span>').join('')
  const ticks = $$('.rail__tick', rail)

  let active = -1
  let locked = false // ignore scroll-driven index changes during programmatic jumps
  let visible = false // cards are hidden until the preloader intro runs

  function syncMedia(i) {
    cards.forEach((c, k) => {
      if (k === i) c.media.play()
      else {
        c.media.pause()
        if (k === i + 1) c.media.load() // warm up the next card
      }
    })
  }

  function renderCaption(i, dir) {
    const p = projects[i]
    const next = document.createElement('div')
    next.className = 'caption__item'
    next.innerHTML = `
      <p class="caption__meta"><span class="caption__kicker">${escapeHTML(p.kicker)}</span> <span>${escapeHTML(p.client)} · ${escapeHTML(p.date)}</span></p>
      <p class="caption__title">${escapeHTML(p.title)}</p>`
    const prev = caption.querySelector('.caption__item:not(.is-leaving)')
    caption.appendChild(next)
    if (!prev || reduced) {
      prev?.remove()
      return
    }
    prev.classList.add('is-leaving')
    gsap.to(prev, { yPercent: -60 * dir, autoAlpha: 0, duration: 0.45, ease: 'power3.in', onComplete: () => prev.remove() })
    gsap.fromTo(next, { yPercent: 60 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, delay: 0.18, ease: 'expo.out' })
  }

  function go(i, { instant = false } = {}) {
    if (i === active) return
    const dir = i > active ? 1 : -1
    active = i
    if (visible) layout({ instant })
    ticks.forEach((t, k) => t.classList.toggle('is-active', k === i))
    renderCaption(i, dir)
    setTheme(projects[i])
    syncMedia(i)
    bus.emit('project', i)
  }

  function layout({ instant = false } = {}) {
    cards.forEach((card, k) => {
      const d = k - active
      const dur = instant || reduced ? 0 : 0.95
      gsap.to(card, { ...stateFor(d), y: 0, rotation: 0, duration: dur, ease: 'expo.out', overwrite: 'auto' })
      gsap.to(card.shade, { opacity: shadeFor(d), duration: dur, ease: 'power2.out', overwrite: 'auto' })
    })
  }

  const scrollRange = () => section.offsetHeight - innerHeight
  const indexToScroll = (i) => section.offsetTop + ((i + 0.5) / n) * scrollRange()

  function scrollToIndex(i, { immediate = false } = {}) {
    locked = true
    go(i)
    lenis.scrollTo(indexToScroll(i), {
      immediate,
      duration: 1.1,
      lock: true,
      force: true,
      onComplete: () => (locked = false),
    })
    if (immediate) locked = false
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      if (locked) return
      go(Math.min(n - 1, Math.floor(self.progress * n * 0.9999)))
    },
    onLeave: () => resetTheme(),
    onEnterBack: () => setTheme(projects[active]),
  })

  shuffleBtn.addEventListener('click', () => {
    let i = active
    while (n > 1 && i === active) i = Math.floor(Math.random() * n)
    scrollToIndex(i)
  })
  skipBtn.addEventListener('click', () => {
    lenis.scrollTo(section.offsetTop + section.offsetHeight - innerHeight * 0.2, { duration: 1.4 })
  })

  // Keyboard: arrows move between projects while the stack is pinned.
  addEventListener('keydown', (e) => {
    if (document.documentElement.classList.contains('detail-open')) return
    const r = section.getBoundingClientRect()
    if (r.top > 1 || r.bottom < innerHeight - 1) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      if (active < n - 1) scrollToIndex(active + 1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      if (active > 0) scrollToIndex(active - 1)
    } else if (e.key === 'Enter' && document.activeElement === document.body) {
      bus.emit('open', { index: active, card: cards[active] })
    }
  })

  gsap.set(cards, { autoAlpha: 0 })
  gsap.set('[data-caption-wrap], [data-rail]', { autoAlpha: 0 })
  go(0, { instant: true })

  /** Preloader hands off to this: cards fly up from below and settle into the stack. */
  function intro() {
    visible = true
    const tl = gsap.timeline()
    // back cards land first, the active card lands last on top
    const order = [...cards].reverse()
    order.forEach((card, idx) => {
      const k = cards.indexOf(card)
      const d = k - active
      const s = stateFor(d)
      tl.fromTo(
        card,
        { y: innerHeight * 0.9, yPercent: s.yPercent, scale: s.scale * 0.92, rotation: k % 2 ? 2.5 : -2.5, autoAlpha: d >= 0 && d < 3 ? 1 : 0 },
        { y: 0, scale: s.scale, rotation: 0, autoAlpha: s.autoAlpha, duration: reduced ? 0 : 1.35, ease: 'expo.out' },
        reduced ? 0 : Math.max(0, idx - (n - 3)) * 0.09,
      )
      gsap.set(card.shade, { opacity: shadeFor(d) })
    })
    tl.to('[data-caption-wrap], [data-rail]', { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, reduced ? 0 : 0.6)
    return tl
  }

  return {
    intro,
    cards,
    get active() {
      return active
    },
    scrollToIndex,
    showInstant() {
      visible = true
      layout({ instant: true })
      gsap.set('[data-caption-wrap], [data-rail]', { autoAlpha: 1 })
    },
  }
}
