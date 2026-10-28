import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createMedia } from './media.js'
import { icons } from './icons.js'
import { $, $$, escapeHTML } from './utils.js'
import { setTheme, resetTheme } from './theme.js'

/**
 * Card stack hero. The stack is cyclic: the active card sits in front, the next two peek out
 * underneath. Moving forward throws the front card off the top of the screen and it rejoins
 * at the back; moving back drops it in from above.
 * Wheel/trackpad over the stack (or a sideways swipe on touch) switches cards; anywhere else
 * the page scrolls normally. The active rail dot fills up like a progress bar, then autoplays
 * to the next card.
 */

const AUTOPLAY_DEFAULT = 7 // seconds per card when the cover has no usable duration
const AUTOPLAY_MIN = 5
const AUTOPLAY_MAX = 12

// Resting position for a card d places behind the active one.
function stateFor(d) {
  if (d === 0) return { yPercent: 0, scale: 1, autoAlpha: 1 }
  if (d === 1) return { yPercent: 5, scale: 0.94, autoAlpha: 1 }
  if (d === 2) return { yPercent: 9.5, scale: 0.88, autoAlpha: 1 }
  return { yPercent: 13, scale: 0.82, autoAlpha: 0 }
}
const shadeFor = (d) => (d === 0 ? 0 : d === 1 ? 0.16 : 0.3)
// Off the top of the screen, slightly tipped, as if flicked away.
const FLOWN = { yPercent: -150, rotation: -5, scale: 1, autoAlpha: 1 }

export function initShowcase({ projects, bus, reduced }) {
  const section = $('[data-showcase]')
  const stage = $('[data-stage]')
  const stack = $('[data-stack]')
  const rail = $('[data-rail]')
  const caption = $('[data-caption]')
  const shuffleBtn = $('[data-shuffle]')
  const root = document.documentElement
  const n = projects.length

  shuffleBtn.innerHTML = icons.shuffle

  const cards = projects.map((p, i) => {
    const card = document.createElement('article')
    card.className = 'card'
    card.innerHTML = `
      <div class="card__media"></div>
      <div class="card__shade"></div>
      <button class="card__hit" aria-label="Open project: ${escapeHTML(p.client)}"></button>`
    const media = createMedia(p.cover)
    card.querySelector('.card__media').appendChild(media.el)
    card.media = media
    card.shade = card.querySelector('.card__shade')
    card.querySelector('.card__hit').addEventListener('click', () => {
      if (Date.now() - swipedAt < 400) return
      if (i === active) bus.emit('open', { index: i, card })
      else go(i, { dir: 1 })
    })
    stack.appendChild(card)
    return card
  })

  rail.innerHTML = projects
    .map((p, i) => `<button class="rail__dot" aria-label="Show ${escapeHTML(p.client)}" data-i="${i}"><span class="rail__fill"></span></button>`)
    .join('')
  const dots = $$('.rail__dot', rail)
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i, { dir: i > active ? 1 : -1 })))

  let active = -1
  let visible = false // cards are hidden until the preloader intro runs
  const depth = (k) => (k - active + n) % n

  function syncMedia(i) {
    cards.forEach((c, k) => {
      if (k === i) c.media.play()
      else {
        c.media.pause()
        if (k === (i + 1) % n) c.media.load() // warm up the next card
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
    gsap.to(prev, { yPercent: -60 * dir, autoAlpha: 0, filter: 'blur(4px)', duration: 0.45, ease: 'power3.in', onComplete: () => prev.remove() })
    gsap.fromTo(next, { yPercent: 60 * dir, autoAlpha: 0, filter: 'blur(4px)' }, { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, delay: 0.2, ease: 'expo.out' })
  }

  function go(i, { dir = 1, instant = false } = {}) {
    if (i === active) return
    const prev = active
    active = i
    if (visible) layout({ instant, prev, dir })
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i))
    renderCaption(i, dir)
    setTheme(projects[i])
    syncMedia(i)
    autoplay.restart()
    bus.emit('project', i)
  }

  function layout({ instant = false, prev = -1, dir = 1 } = {}) {
    const dur = instant || reduced ? 0 : 1
    cards.forEach((card, k) => {
      const d = depth(k)
      card.style.zIndex = String(n - d)
      gsap.to(card.shade, { opacity: shadeFor(d), duration: dur * 0.8, ease: 'power2.out', overwrite: 'auto' })

      if (dur && dir > 0 && k === prev) {
        // thrown off the top, then quietly rejoins the back of the stack
        card.style.zIndex = String(n + 1)
        gsap.to(card, {
          ...FLOWN,
          duration: 0.85,
          ease: 'power3.in',
          overwrite: true,
          onComplete: () => {
            const dd = depth(k)
            card.style.zIndex = String(n - dd)
            gsap.set(card, { ...stateFor(Math.max(dd, 3)), rotation: 0 })
            if (dd < 3) gsap.to(card, { ...stateFor(dd), duration: 0.6, ease: 'expo.out' })
          },
        })
        return
      }
      if (dur && dir < 0 && k === active) {
        // dropped back in from above
        card.style.zIndex = String(n + 1)
        gsap.fromTo(card, FLOWN, {
          ...stateFor(0),
          rotation: 0,
          duration: 1.1,
          ease: 'expo.out',
          overwrite: true,
          onComplete: () => (card.style.zIndex = String(n - depth(k))),
        })
        return
      }
      gsap.to(card, { ...stateFor(d), y: 0, rotation: 0, duration: dur, delay: dur && dir > 0 ? 0.12 : 0, ease: 'expo.out', overwrite: 'auto' })
    })
  }

  const step = (dir) => go((active + dir + n) % n, { dir })

  /* ── Autoplay: the active dot's fill runs for the card's duration, then advances ── */
  const autoplay = (() => {
    let tween = null
    const blockers = new Set(['intro'])
    const durationFor = (i) => {
      const v = cards[i].querySelector('video')
      const d = v?.duration
      return Number.isFinite(d) && d > 0 ? gsap.utils.clamp(AUTOPLAY_MIN, AUTOPLAY_MAX, d) : AUTOPLAY_DEFAULT
    }
    const sync = () => tween && (blockers.size ? tween.pause() : tween.resume())
    return {
      restart() {
        tween?.kill()
        $$('.rail__fill', rail).forEach((f) => gsap.set(f, { scaleY: 0 }))
        if (reduced || active < 0) return
        tween = gsap.fromTo($('.rail__fill', dots[active]), { scaleY: 0 }, { scaleY: 1, duration: durationFor(active), ease: 'none', onComplete: () => step(1) })
        sync()
      },
      block(reason, on) {
        on ? blockers.add(reason) : blockers.delete(reason)
        sync()
      },
    }
  })()

  // Only run while the stack is on screen, the tab is visible and no project is open.
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onToggle: (self) => autoplay.block('offscreen', !self.isActive),
  })
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom 35%',
    onLeave: () => resetTheme(),
    onEnterBack: () => setTheme(projects[active]),
  })
  document.addEventListener('visibilitychange', () => autoplay.block('hidden', document.hidden))
  bus.on('detail:open', () => autoplay.block('detail', true))
  bus.on('detail:close', () => autoplay.block('detail', false))

  /* ── Wheel / trackpad over the stack switches cards instead of scrolling the page ── */
  let acc = 0
  let lastWheel = 0
  let lastMag = 0
  let lockUntil = 0
  let coasting = false // ignoring the trackpad's inertia tail after a switch
  stage.addEventListener(
    'wheel',
    (e) => {
      if (!visible || root.classList.contains('detail-open')) return
      e.preventDefault()
      const now = performance.now()
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      const mag = Math.abs(delta)
      const gap = now - lastWheel
      lastWheel = now
      if (now < lockUntil) return void (lastMag = mag)
      if (coasting) {
        // a pause or a fresh, stronger push means a new gesture
        if (gap > 160 || mag > lastMag * 1.4 + 4) coasting = false
        else return void (lastMag = mag)
      }
      lastMag = mag
      if (gap > 220) acc = 0
      acc += delta
      if (Math.abs(acc) >= 28) {
        step(Math.sign(acc))
        acc = 0
        coasting = true
        lockUntil = now + 420
      }
    },
    { passive: false },
  )

  /* ── Touch: sideways swipe switches cards; vertical swipes scroll the page ── */
  let touch = null
  let swipedAt = 0
  stage.addEventListener('touchstart', (e) => (touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }), { passive: true })
  stage.addEventListener(
    'touchend',
    (e) => {
      if (!touch) return
      const dx = e.changedTouches[0].clientX - touch.x
      const dy = e.changedTouches[0].clientY - touch.y
      touch = null
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        swipedAt = Date.now()
        step(dx < 0 ? 1 : -1)
      }
    },
    { passive: true },
  )

  shuffleBtn.addEventListener('click', () => {
    let i = active
    while (n > 1 && i === active) i = Math.floor(Math.random() * n)
    go(i, { dir: 1 })
  })

  // Keyboard: left/right move between projects while the stack is on screen.
  addEventListener('keydown', (e) => {
    if (root.classList.contains('detail-open') || !visible) return
    if (e.target.closest?.('input, textarea, [contenteditable]')) return
    const r = section.getBoundingClientRect()
    if (r.bottom < innerHeight * 0.5) return
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'Enter' && document.activeElement === document.body) bus.emit('open', { index: active, card: cards[active] })
  })

  gsap.set(cards, { autoAlpha: 0 })
  gsap.set('[data-caption-wrap], [data-rail]', { autoAlpha: 0 })
  go(0, { instant: true })

  /** Preloader hands off to this: cards fly up from below and settle into the stack. */
  function intro() {
    visible = true
    const tl = gsap.timeline({ onComplete: () => autoplay.block('intro', false) })
    // back cards land first, the active card lands last on top
    const order = [...cards].sort((a, b) => depth(cards.indexOf(b)) - depth(cards.indexOf(a)))
    order.forEach((card, idx) => {
      const d = depth(cards.indexOf(card))
      const s = stateFor(d)
      card.style.zIndex = String(n - d)
      tl.fromTo(
        card,
        { y: innerHeight * 0.9, yPercent: s.yPercent, scale: s.scale * 0.92, rotation: idx % 2 ? 2.5 : -2.5, autoAlpha: d < 3 ? 1 : 0 },
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
    /** Jump straight to a project (used by the detail view and deep links). */
    select(i) {
      go(i, { instant: true })
    },
    showInstant() {
      visible = true
      layout({ instant: true })
      gsap.set('[data-caption-wrap], [data-rail]', { autoAlpha: 1 })
      autoplay.block('intro', false)
    },
  }
}
