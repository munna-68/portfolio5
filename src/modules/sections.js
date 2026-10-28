import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { icons } from './icons.js'
import { $, $$, escapeHTML, twoTone } from './utils.js'

export function initSections({ site, projects, bus, reduced }) {
  initStatement(site, projects, bus, reduced)
  initTestimonials(site, reduced)
  initApproach(site, reduced)
  initTeam(site, reduced)
  initFooter(site)
  initReveals(reduced)
}

/* ── "Sitekeep designs, builds and keeps [websites] …" — the word follows the active project ──
   The word is set in mono and swaps letter by letter. Its slot snaps to the new word's width
   straight away, and every other word FLIPs from where it was, so when the line breaks change
   the words glide to their new lines instead of jumping. */
function initStatement(site, projects, bus, reduced) {
  const title = $('[data-statement-title]')
  const words = (text) => text.split(' ').map((w) => `<span class="statement__w">${escapeHTML(w)}</span>`).join(' ')
  title.innerHTML = `${words(site.statement.before)} <span class="statement__slot"><span class="statement__sizer" aria-hidden="true"></span><span class="statement__layer"></span></span> ${words(site.statement.after)}`
  $('[data-statement-sub]').textContent = site.statement.sub
  const slot = $('.statement__slot', title)
  const sizer = $('.statement__sizer', title)
  const layer = $('.statement__layer', title)
  const movers = [...$$('.statement__w', title), slot]
  let current = -1

  const letters = (text) => [...text].map((ch) => `<span class="statement__ch">${ch === ' ' ? '&nbsp;' : escapeHTML(ch)}</span>`).join('')

  const show = (i) => {
    if (i === current) return
    const first = current === -1
    current = i
    const p = projects[i]

    // FLIP: where everything is now (including any glide still in flight)…
    const before = movers.map((el) => el.getBoundingClientRect())
    gsap.killTweensOf(movers)
    gsap.set(movers, { x: 0, y: 0 })
    sizer.textContent = p.industry
    title.setAttribute('aria-label', `${site.statement.before} ${p.industry} ${site.statement.after}`)
    // …and glide from there to wherever the new width puts it.
    if (!first && !reduced) {
      movers.forEach((el, k) => {
        const r = el.getBoundingClientRect()
        const dx = before[k].left - r.left
        const dy = before[k].top - r.top
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) gsap.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.85, ease: 'expo.out' })
      })
    }

    const word = document.createElement('span')
    word.className = 'statement__word'
    word.style.color = `color-mix(in oklab, ${p.accent} 84%, #000)` // keeps light accents (yellow) readable on white
    word.innerHTML = letters(p.industry)
    const prev = layer.querySelector('.statement__word:not(.is-leaving)')
    layer.appendChild(word)
    if (!prev || reduced) return prev?.remove()
    prev.classList.add('is-leaving')
    ;[...layer.querySelectorAll('.is-leaving')].forEach((el) => el !== prev && el.remove())
    gsap.to(prev.children, { yPercent: -45, opacity: 0, filter: 'blur(8px)', duration: 0.35, stagger: 0.012, ease: 'power2.in', onComplete: () => prev.remove() })
    gsap.fromTo(
      word.children,
      { yPercent: 55, opacity: 0, filter: 'blur(8px)' },
      { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, delay: 0.12, stagger: 0.025, ease: 'expo.out', clearProps: 'filter' },
    )
  }
  bus.on('project', show)
  show(0)
  addEventListener('resize', () => gsap.set(movers, { x: 0, y: 0 }))

  // Once the visitor has scrolled past the stack, keep cycling through industries.
  let timer = null
  ScrollTrigger.create({
    trigger: '[data-statement]',
    start: 'top 85%',
    end: 'bottom top',
    onToggle: (self) => {
      clearInterval(timer)
      if (self.isActive && !reduced) timer = setInterval(() => show((current + 1) % projects.length), 2600)
    },
  })
}

/* ── Testimonials: two-tone quote, pager, slow tile column ── */
function initTestimonials(site, reduced) {
  const quoteEl = $('[data-t-quote]')
  const personEl = $('[data-t-person]')
  const pager = $('[data-t-pager]')
  const items = site.testimonials
  pager.innerHTML = items.map((_, i) => `<button aria-label="Testimonial ${i + 1}"></button>`).join('')
  const dots = $$('button', pager)
  let index = -1
  let timer

  const show = (i) => {
    if (i === index) return
    index = i
    const t = items[i]
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i))
    const swap = () => {
      quoteEl.innerHTML = twoTone(t.quote)
      personEl.innerHTML = `<img src="${t.avatar}" alt="" loading="lazy"><span><strong>${escapeHTML(t.name)}</strong><span>${escapeHTML(t.role)}</span></span>`
      gsap.fromTo([quoteEl, personEl], { y: 16, autoAlpha: 0, filter: 'blur(6px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.08, ease: 'expo.out' })
    }
    if (reduced || !quoteEl.innerHTML) return swap()
    gsap.to([quoteEl, personEl], { y: -12, autoAlpha: 0, filter: 'blur(6px)', duration: 0.35, ease: 'power2.in', onComplete: swap })
  }
  const restart = () => {
    clearInterval(timer)
    if (!reduced) timer = setInterval(() => show((index + 1) % items.length), 7000)
  }
  dots.forEach((d, i) => d.addEventListener('click', () => (show(i), restart())))
  show(0)
  restart()

  const tiles = $('[data-t-tiles]')
  const imgs = site.testimonialImages
  tiles.innerHTML = [0, 1]
    .map(
      (col) =>
        `<div class="tiles__col"><div class="tiles__track">${[...imgs, ...imgs]
          .filter((_, k) => k % 2 === col)
          .map((src) => `<img src="${src}" alt="" loading="lazy">`)
          .join('')}</div></div>`,
    )
    .join('')
}

/* ── Approach accordion ── */
function initApproach(site, reduced) {
  const a = site.approach
  $('[data-approach-title]').innerHTML = twoTone(a.title)
  $('[data-approach-body]').textContent = a.body
  const link = $('[data-approach-link]')
  link.href = a.link.href
  link.innerHTML = `<img src="${a.link.thumb}" alt="" loading="lazy"><span>${escapeHTML(a.link.label)}</span><span class="mini-card__arrow">${icons.chevronRight}</span>`

  const acc = $('[data-accordion]')
  acc.innerHTML = a.steps
    .map(
      (s, i) => `
      <div class="accordion__item${i === 0 ? ' is-open' : ''}">
        <button class="accordion__head" aria-expanded="${i === 0}">
          <span class="accordion__icon">${icons[s.icon] ?? ''}</span>
          <span class="accordion__title">${escapeHTML(s.title)}</span>
          <span class="accordion__plus">${icons.plus}</span>
        </button>
        <div class="accordion__panel"><div>
          <p>${escapeHTML(s.body)}</p>
          <ul>${s.tags.map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
        </div></div>
      </div>`,
    )
    .join('')
  $$('.accordion__item', acc).forEach((item) => {
    $('.accordion__head', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open')
      $$('.accordion__item', acc).forEach((o) => {
        o.classList.remove('is-open')
        $('.accordion__head', o).setAttribute('aria-expanded', 'false')
      })
      if (open) {
        item.classList.add('is-open')
        $('.accordion__head', item).setAttribute('aria-expanded', 'true')
      }
      setTimeout(() => ScrollTrigger.refresh(), 600)
    })
  })
}

/* ── Team: overlapping portrait bubbles that rotate, client logo marquee ── */
function initTeam(site, reduced) {
  const t = site.team
  $('[data-team-title]').innerHTML = twoTone(t.title)
  $('[data-team-body]').textContent = t.body
  const track = $('[data-marquee] .marquee__track')
  const logos = t.clients.map((c) => `<span class="marquee__logo">${escapeHTML(c)}</span>`).join('')
  track.innerHTML = logos + logos

  const bubbles = $('[data-bubbles]')
  const nameEl = $('[data-person-name]')
  const linkEl = $('[data-person-link]')
  linkEl.innerHTML = icons.linkedin
  $('[data-person-next]').innerHTML = icons.chevronRight
  bubbles.innerHTML = t.people.map((p) => `<div class="bubble"><img src="${p.photo}" alt="${escapeHTML(p.name)}" loading="lazy"></div>`).join('')
  const els = $$('.bubble', bubbles)
  let front = 0

  // slot 0 = front (right), 1 & 2 = smaller and blurred behind it to the left, 3+ hidden
  const slots = [
    { xPercent: 0, yPercent: 0, scale: 1, filter: 'blur(0px) grayscale(1)', opacity: 1, zIndex: 4 },
    { xPercent: -76, yPercent: 16, scale: 0.7, filter: 'blur(3px) grayscale(1)', opacity: 0.85, zIndex: 3 },
    { xPercent: -128, yPercent: 4, scale: 0.6, filter: 'blur(6px) grayscale(1)', opacity: 0.7, zIndex: 2 },
    { xPercent: -170, yPercent: 10, scale: 0.4, filter: 'blur(8px) grayscale(1)', opacity: 0, zIndex: 1 },
  ]
  const place = (instant) => {
    els.forEach((el, k) => {
      const slot = slots[Math.min((k - front + els.length) % els.length, slots.length - 1)]
      gsap.to(el, { ...slot, duration: instant || reduced ? 0 : 0.9, ease: 'expo.out' })
    })
    const p = t.people[front]
    linkEl.href = p.link
    const prev = nameEl.firstElementChild
    const next = document.createElement('div')
    next.innerHTML = `<strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.role)}</span>`
    nameEl.appendChild(next)
    if (prev) {
      gsap.to(prev, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: 'power2.in', onComplete: () => prev.remove() })
      gsap.fromTo(next, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, delay: 0.1, ease: 'expo.out' })
    }
  }
  $('[data-person-next]').addEventListener('click', () => {
    front = (front + 1) % els.length
    place()
  })
  els.forEach((el, k) =>
    el.addEventListener('click', () => {
      front = k
      place()
    }),
  )
  place(true)
}

function initFooter(site) {
  $('[data-footer-cols]').innerHTML = site.footer.columns
    .map(
      (c) =>
        `<div class="footer__col"><p>${escapeHTML(c.title)}</p>${c.links.map((l) => `<a href="${l.href}">${escapeHTML(l.label)}</a>`).join('')}</div>`,
    )
    .join('')
  $('[data-footer-copy]').textContent = `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`
  $('[data-footer-legal]').textContent = site.footer.legal
}

/* ── Generic scroll reveals ── */
function initReveals(reduced) {
  if (reduced) return
  const targets = [
    '.statement__title',
    '.statement__sub',
    '.testimonials__card',
    '.testimonials__tiles',
    '.approach__intro > *',
    '.approach__side',
    '.team__intro > *',
    '.team__people',
  ]
  gsap.set(targets.join(','), { y: 50, autoAlpha: 0 })
  ScrollTrigger.batch(targets.join(','), {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out' }),
  })
}
