import gsap from 'gsap'
import Lenis from 'lenis'
import { createMedia } from './media.js'
import { icons } from './icons.js'
import { $, $$, escapeHTML } from './utils.js'

/**
 * Expanded project view.
 * Opening borrows the clicked card's media element (so a playing video keeps playing),
 * FLIPs it from the card's rect to the hero slot, and fades the page to dark.
 * Inside, sections declare data-bg="dark|accent|light". The background is tied to the scroll
 * position: around each section boundary it blends from one colour to the next over BLEND of
 * the viewport, so it changes as smoothly as you scroll. The view has its own Lenis instance.
 */

const DARK = '#0c0c0c'
const LIGHT = '#f4f3f0'
const CARD_RADIUS = 22
const HERO_RADIUS = 20
const BLEND = 0.6 // share of the viewport height over which two section colours cross-fade

function isLight(hex) {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m) return false
  const [r, g, b] = m.map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4
}

export function initDetail({ projects, lenis, bus, showcase, header, reduced }) {
  const el = $('[data-detail]')
  const root = document.documentElement
  const n = projects.length

  let openIndex = null
  let busy = false
  let borrowed = null // { media, home, card }
  let galleryIO = null
  let inner = null // the detail view's own Lenis
  let contentRO = null
  let zones = [] // [{ top, color, light }] per data-bg section, in scroller coordinates
  let lightNow = null
  let lastFocus = null

  function bgFor(key, p) {
    if (key === 'accent') return { color: p.accent, light: isLight(p.accent) }
    if (key === 'light') return { color: LIGHT, light: true }
    return { color: DARK, light: false }
  }

  function applyBg(key, p) {
    const { color, light } = bgFor(key, p)
    el.style.backgroundColor = color
    setLight(light)
  }

  function setLight(light) {
    if (light === lightNow) return
    lightNow = light
    el.classList.toggle('detail--light', light)
    header.setMode(light ? 'light' : 'dark')
  }

  function measureZones(p) {
    const scroller = $('[data-scroller]', el)
    zones = $$('[data-bg]', el).map((sec) => ({ top: sec.offsetTop, ...bgFor(sec.dataset.bg, p) }))
    paint(scroller.scrollTop)
  }

  /** Background for the current scroll position, cross-fading near each section boundary. */
  function paint(scrollTop) {
    if (!zones.length || !el.classList.contains('is-settled')) return
    const vh = innerHeight
    const mid = scrollTop + vh / 2
    let k = 0
    while (k < zones.length - 1 && mid >= zones[k + 1].top) k++
    let from = zones[k]
    let to = zones[k]
    let t = 0
    const band = (vh * BLEND) / 2
    const next = zones[k + 1]
    if (next && mid > next.top - band) [to, t] = [next, (mid - (next.top - band)) / (2 * band)]
    else if (k > 0 && mid < zones[k].top + band) [from, to, t] = [zones[k - 1], zones[k], 0.5 + (mid - zones[k].top) / (2 * band)]
    t = t * t * (3 - 2 * t) // smoothstep
    el.style.backgroundColor = gsap.utils.interpolate(from.color, to.color, t)
    setLight(t < 0.5 ? from.light : to.light)
  }

  function render(p, i) {
    const next = projects[(i + 1) % n]
    el.style.setProperty('--d-accent', p.accent)
    el.innerHTML = `
      <button class="detail__close" data-close aria-label="Close project">${icons.close}<span>Close</span></button>
      <div class="detail__scroller" data-scroller data-lenis-prevent tabindex="-1">
        <div class="detail__content" data-content>
        <section class="detail__intro" data-bg="dark">
          <div class="detail__hero" data-hero>
            <button class="detail__expand" data-expand aria-label="View fullscreen">${icons.expand}</button>
          </div>
          <div class="detail__head">
            <div class="detail__head-row" data-reveal>
              <h1 class="detail__title">${escapeHTML(p.title)}</h1>
              <span class="detail__swatch" aria-hidden="true"></span>
            </div>
            <dl class="detail__meta" data-reveal>
              <div><dt>Client</dt><dd><span class="detail__badge">${escapeHTML(p.client[0])}</span>${escapeHTML(p.client)}</dd></div>
              <div><dt>Year</dt><dd>${escapeHTML(p.year)}</dd></div>
              <div><dt>Services</dt><dd>${p.services.map(escapeHTML).join(', ')}</dd></div>
              <div><dt>Made by</dt><dd>${p.team.map(escapeHTML).join(', ')}</dd></div>
            </dl>
            <div class="detail__body" data-reveal>
              <p class="detail__summary">${escapeHTML(p.summary)}</p>
              ${p.body.map((t) => `<p>${escapeHTML(t)}</p>`).join('')}
            </div>
          </div>
        </section>
        ${
          p.stats?.length
            ? `<section class="detail__stats" data-bg="accent">
                <p class="detail__label">Outcomes</p>
                <div class="detail__stats-grid">
                  ${p.stats.map((s) => `<div class="stat"><span class="stat__value">${escapeHTML(s.value)}</span><span class="stat__label">${escapeHTML(s.label)}</span></div>`).join('')}
                </div>
              </section>`
            : ''
        }
        ${p.gallery?.length ? `<section class="detail__gallery" data-bg="light" data-gallery></section>` : ''}
        ${
          p.more?.length
            ? `<section class="detail__more" data-bg="light">
                <div class="orb detail__orb" aria-hidden="true"></div>
                <div class="more__intro">
                  <p class="more__kicker">${icons.sparkle}<span>More from this project</span></p>
                  <p class="more__text">Pick a theme to see how we approached ${escapeHTML(p.client)}: ${p.more.map((m) => `<button class="more__link" data-more-go="${p.more.indexOf(m)}">${escapeHTML(m.label.toLowerCase())}</button>`).join(', ')}.</p>
                </div>
                <div class="more-stack" data-more>
                  ${p.more
                    .map(
                      (m, k) => `<article class="more-card">
                        <button class="more-card__tab" data-more-go="${k}" style="top:${28 + k * 4}px">${escapeHTML(m.label)}</button>
                        <div class="more-card__body">
                          <span class="more-card__num">${String(k + 1).padStart(2, '0')} / ${String(p.more.length).padStart(2, '0')}</span>
                          <h3>${escapeHTML(m.title)}</h3>
                          <p>${escapeHTML(m.body)}</p>
                        </div>
                      </article>`,
                    )
                    .join('')}
                  <button class="more-stack__next" data-more-next aria-label="Next theme">${icons.chevronRight}</button>
                </div>
              </section>`
            : ''
        }
        <section class="detail__next" data-bg="dark">
          <p class="detail__label">Next project</p>
          <button class="next-card" data-next>
            <span class="next-card__media" data-next-media></span>
            <span class="next-card__text">
              <span class="next-card__kicker" style="color:${next.accent}">${escapeHTML(next.kicker)}</span>
              <span class="next-card__title">${escapeHTML(next.title)}</span>
            </span>
            <span class="next-card__arrow">${icons.arrowRight}</span>
          </button>
        </section>
        </div>
      </div>`

    const gallery = $('[data-gallery]', el)
    if (gallery) {
      galleryIO = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? e.target.media.play() : e.target.media.pause())),
        { root: $('[data-scroller]', el), rootMargin: '10% 0px' },
      )
      p.gallery.forEach((m) => {
        const media = createMedia(m, { interactive: m.type === 'youtube' })
        const fig = document.createElement('figure')
        fig.className = 'detail__figure'
        fig.appendChild(media.el)
        fig.media = media
        gallery.appendChild(fig)
        galleryIO.observe(fig)
      })
    }
    const nextPoster = next.cover.type === 'video' ? next.cover.poster : next.cover.type === 'image' ? next.cover.src : null
    if (nextPoster) $('[data-next-media]', el).style.backgroundImage = `url("${nextPoster}")`

    initMore()
    $('[data-close]', el).addEventListener('click', requestClose)
    $('[data-next]', el).addEventListener('click', () => swap((i + 1) % n, { push: 'replace' }))
    $('[data-expand]', el).addEventListener('click', () => {
      const v = $('[data-hero] video, [data-hero] img, [data-hero] iframe', el)
      v?.requestFullscreen?.()
    })

    const scroller = $('[data-scroller]', el)
    inner = new Lenis({ wrapper: scroller, content: $('[data-content]', el), lerp: reduced ? 1 : 0.1, touchMultiplier: 1.4 })
    inner.on('scroll', ({ scroll }) => paint(scroll))
    contentRO = new ResizeObserver(() => measureZones(p)) // images and the gallery change section heights
    contentRO.observe($('[data-content]', el))
    document.title = `${p.client} · ${p.title} | Sitekeep`
    header.setLabel(p.title)
  }

  /** "More from this project": a small stack of theme cards with folder tabs down the right edge. */
  function initMore() {
    const stack = $('[data-more]', el)
    if (!stack) return
    const cards = $$('.more-card', stack)
    const len = cards.length
    let front = 0
    const place = (instant) => {
      cards.forEach((c, k) => {
        const d = (k - front + len) % len
        c.style.zIndex = String(len - d)
        c.classList.toggle('is-front', d === 0)
        gsap.to(c, { x: d * 30, y: d * 8, rotation: d * 1.6, scale: 1 - d * 0.035, duration: instant || reduced ? 0 : 0.8, ease: 'expo.out' })
      })
    }
    const show = (k) => {
      if (k === front) return
      const leaving = cards[front]
      front = k
      if (!reduced) gsap.fromTo(leaving, { x: 0 }, { x: -60, rotation: -4, duration: 0.25, ease: 'power2.out', onComplete: place })
      else place()
      if (reduced) return
      leaving.style.zIndex = String(len + 1)
    }
    $$('[data-more-go]', el).forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.moreGo))))
    $('[data-more-next]', stack).addEventListener('click', () => show((front + 1) % len))
    place(true)
  }

  function teardown() {
    galleryIO?.disconnect()
    contentRO?.disconnect()
    inner?.destroy()
    galleryIO = contentRO = inner = null
    zones = []
  }

  // The detail view's Lenis rides the same ticker as the page's; re-measure on resize.
  gsap.ticker.add((t) => inner?.raf(t * 1000))
  addEventListener('resize', () => openIndex !== null && measureZones(projects[openIndex]))

  function borrowMedia(i) {
    const card = showcase.cards[i]
    const home = card.querySelector('.card__media')
    borrowed = { media: card.media, home, card }
    $('[data-hero]', el).prepend(card.media.el)
    card.media.play()
    card.style.visibility = 'hidden'
    return card
  }

  function returnMedia() {
    if (!borrowed) return
    borrowed.home.appendChild(borrowed.media.el)
    borrowed.card.style.visibility = ''
    borrowed.media.play()
    borrowed = null
  }

  function pushUrl(p, mode) {
    const url = `/work/${p.slug}`
    if (mode === 'push') history.pushState({ slug: p.slug }, '', url)
    else if (mode === 'replace') history.replaceState({ slug: p.slug }, '', url)
  }

  /** Expand from the card. */
  function open(i, { push = 'push' } = {}) {
    if (busy || openIndex !== null) return
    busy = true
    openIndex = i
    const p = projects[i]
    lastFocus = document.activeElement
    root.classList.add('detail-open')
    lenis.stop()

    render(p, i)
    el.hidden = false
    lightNow = null
    setLight(false)
    el.style.backgroundColor = 'rgba(12,12,12,0)'
    const card = borrowMedia(i)
    const hero = $('[data-hero]', el)

    const a = card.getBoundingClientRect()
    const b = hero.getBoundingClientRect()
    const s = a.width / b.width
    gsap.set(hero, { x: a.left - b.left, y: a.top - b.top, scale: s, transformOrigin: '0 0', '--r': `${CARD_RADIUS / s}px` })

    const d = reduced ? 0 : 1
    gsap
      .timeline({
        onComplete: () => {
          busy = false
          el.classList.add('is-settled')
          measureZones(p)
          $('[data-scroller]', el).focus({ preventScroll: true })
        },
      })
      .to(el, { backgroundColor: DARK, duration: 0.7 * d, ease: 'power2.out' }, 0)
      .to('[data-caption-wrap], [data-rail], [data-stack]', { autoAlpha: 0, duration: 0.35 * d }, 0)
      .to(hero, { x: 0, y: 0, scale: 1, '--r': `${HERO_RADIUS}px`, duration: 1.05 * d, ease: 'expo.inOut' }, 0)
      .fromTo($$('[data-reveal]', el), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.9 * d, ease: 'expo.out' }, 0.6 * d)
      .fromTo($('[data-close]', el), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.5 * d, ease: 'back.out(2)' }, 0.7 * d)
      .fromTo($('[data-expand]', el), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 * d }, 0.9 * d)

    pushUrl(p, push)
    bus.emit('detail:open', i)
  }

  /** Collapse back into the card. */
  function close({ push = null } = {}) {
    if (busy || openIndex === null) return
    busy = true
    const scroller = $('[data-scroller]', el)
    const card = showcase.cards[openIndex]
    const d = reduced ? 0 : 1

    const flip = () => {
      el.classList.remove('is-settled')
      teardown()
      applyBg('dark', projects[openIndex])
      const hero = $('[data-hero]', el)
      const b = hero.getBoundingClientRect()
      const a = card.getBoundingClientRect()
      const s = a.width / b.width
      gsap
        .timeline({
          onComplete: () => {
            returnMedia()
            el.hidden = true
            el.innerHTML = ''
            gsap.set(el, { clearProps: 'backgroundColor' })
            root.classList.remove('detail-open')
            header.setMode('light')
            header.setLabel(null)
            document.title = 'Sitekeep · Websites, kept.'
            lenis.start()
            openIndex = null
            busy = false
            lastFocus?.focus?.({ preventScroll: true })
            bus.emit('detail:close')
          },
        })
        .to([...$$('[data-reveal]', el), $('[data-close]', el), $('[data-expand]', el)], { autoAlpha: 0, y: 12, duration: 0.25 * d, ease: 'power2.in' }, 0)
        .to(hero, { x: a.left - b.left, y: a.top - b.top, scale: s, '--r': `${CARD_RADIUS / s}px`, duration: 0.9 * d, ease: 'expo.inOut' }, 0.1 * d)
        .to(el, { backgroundColor: 'rgba(12,12,12,0)', duration: 0.6 * d, ease: 'power2.inOut' }, 0.35 * d)
        .to('[data-caption-wrap], [data-rail], [data-stack]', { autoAlpha: 1, duration: 0.5 * d }, 0.45 * d)
    }

    if (scroller.scrollTop > 2) {
      const duration = reduced ? 0 : Math.min(0.9, 0.3 + scroller.scrollTop / 4000)
      inner.scrollTo(0, { duration, easing: (t) => 1 - (1 - t) ** 3, force: true, lock: true, onComplete: flip })
    } else flip()

    if (push === 'replace') history.replaceState({}, '', '/')
  }

  /** Jump straight to another project while the detail view is open. */
  function swap(i, { push = 'replace' } = {}) {
    if (busy || openIndex === null || i === openIndex) return
    busy = true
    const scroller = $('[data-scroller]', el)
    gsap.to(scroller, {
      autoAlpha: 0,
      y: -30,
      duration: reduced ? 0 : 0.4,
      ease: 'power2.in',
      onComplete: () => {
        teardown()
        returnMedia()
        showcase.select(i)
        openIndex = i
        const p = projects[i]
        render(p, i)
        borrowMedia(i)
        applyBg('dark', p)
        measureZones(p)
        const sc = $('[data-scroller]', el)
        gsap.fromTo(sc, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.8, ease: 'expo.out', onComplete: () => (busy = false) })
        pushUrl(p, push)
      },
    })
  }

  function requestClose() {
    if (history.state?.slug) history.back() // popstate will close
    else close({ push: 'replace' })
  }

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openIndex !== null) requestClose()
  })

  addEventListener('popstate', () => {
    const slug = slugFromPath()
    const i = projects.findIndex((p) => p.slug === slug)
    if (i === -1) close()
    else if (openIndex === null) {
      lenis.scrollTo(0, { immediate: true, force: true })
      showcase.select(i)
      open(i, { push: null })
    } else swap(i, { push: null })
  })

  bus.on('open', ({ index }) => open(index))

  return {
    open,
    close,
    get isOpen() {
      return openIndex !== null
    },
  }
}

export function slugFromPath() {
  const m = location.pathname.match(/^\/work\/([^/]+)\/?$/)
  return m ? decodeURIComponent(m[1]) : null
}
