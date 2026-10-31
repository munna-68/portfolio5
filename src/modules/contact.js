import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { icons } from './icons.js'
import { $, escapeHTML, initials, twoTone } from './utils.js'

/**
 * Conversational contact form: one question at a time, in a fixed-size frosted "sheet".
 * The current question sits at the bottom of the white screen; once answered, the answer glides
 * up into a compact list under the avatar (click one to go back to it) and the next question
 * rises in from below. From the second question on, the screen lifts a little to reveal a Back
 * bar underneath. The avatar fills in with the visitor's initials once they give their name.
 * The sheet drops in when it scrolls into view and can be tugged by its handle.
 * Submits JSON to site.formEndpoint if set, otherwise opens a pre-filled email.
 */
export function initContact({ site, bus, reduced }) {
  const c = site.contact
  $('[data-contact-title]').innerHTML = twoTone(c.title)
  const emailLink = $('[data-email]')
  emailLink.href = `mailto:${site.email}`
  emailLink.textContent = site.email
  const copyBtn = $('[data-copy]')
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      copyBtn.textContent = 'Copied'
    } catch {
      copyBtn.textContent = 'Press ⌘C'
    }
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1800)
  })

  const form = $('[data-convo]')
  const card = $('[data-convo-card]')
  const stepEl = $('[data-convo-step]')
  const historyEl = $('[data-convo-history]')
  const avatar = $('[data-convo-avatar]')
  form.addEventListener('input', (e) => form.classList.toggle('has-value', !!e.target.value?.trim()))
  $('[data-back]', card).addEventListener('click', () => goBack(index - 1))

  const answers = {}
  let index = 0
  let engaged = false // only steal focus once the visitor is using the form
  const first = () => (answers.name ?? '').trim().split(/\s+/)[0] ?? ''
  const fill = (s) => s.replace('{first}', escapeHTML(first() || 'there'))

  function fieldHTML(step) {
    const val = answers[step.id]
    if (step.type === 'chips') {
      const chosen = new Set([].concat(val ?? []))
      return `<div class="convo__chips" role="group">${step.options
        .map((o) => `<button type="button" class="chip${chosen.has(o) ? ' is-on' : ''}" aria-pressed="${chosen.has(o)}">${escapeHTML(o)}</button>`)
        .join('')}</div>`
    }
    if (step.type === 'textarea') {
      return `<textarea class="convo__input" id="convo-input" rows="3" placeholder="${escapeHTML(step.placeholder ?? '')}">${escapeHTML(val ?? '')}</textarea>`
    }
    return `<input class="convo__input" id="convo-input" type="${step.type}" autocomplete="${step.autocomplete ?? 'off'}" placeholder="${escapeHTML(step.placeholder ?? '')}" value="${escapeHTML(val ?? '')}">`
  }

  function renderStep(dir = 1) {
    const step = c.steps[index]
    const last = index === c.steps.length - 1
    card.classList.toggle('has-bar', index > 0)
    const html = `
      <label class="convo__q" for="convo-input">${fill(step.question)}${step.optional ? ' <span>(optional)</span>' : ''}</label>
      <div class="convo__row">
        ${fieldHTML(step)}
        <button type="submit" class="convo__next${last ? ' convo__next--send' : ''}" aria-label="${last ? 'Send' : 'Next'}">${last ? icons.check : icons.arrowRight}</button>
      </div>`
    const swapIn = () => {
      stepEl.innerHTML = html
      form.classList.toggle('has-value', !!answers[step.id]?.length)
      wire(step)
      // forward: the next question rises in from below; back: it settles down from above
      gsap.fromTo(
        stepEl,
        { y: 46 * dir, opacity: 0 },
        { y: 0, opacity: 1, duration: reduced ? 0 : 0.6, delay: reduced || dir < 0 ? 0 : 0.08, ease: 'expo.out' },
      )
    }
    // going forward, the old step has already glided into the history (see glide())
    if (!stepEl.innerHTML || reduced || dir > 0) return swapIn()
    gsap.to(stepEl, { y: 40, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: swapIn })
  }

  /** Jump back to step k, dropping it and everything after it from the history. */
  function goBack(k) {
    if (k < 0 || k >= index) return
    engaged = true
    index = k
    ;[...historyEl.children].slice(k).forEach((row) => row.remove())
    renderStep(-1)
  }

  function wire(step) {
    const input = $('#convo-input', stepEl)
    if (input && engaged) input.focus({ preventScroll: true })
    if (step.type === 'textarea') {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.requestSubmit()
      })
    }
    if (step.type === 'chips') {
      stepEl.querySelectorAll('.chip').forEach((chip) =>
        chip.addEventListener('click', () => {
          if (!step.multi) stepEl.querySelectorAll('.chip').forEach((o) => o !== chip && (o.classList.remove('is-on'), o.setAttribute('aria-pressed', 'false')))
          const on = chip.classList.toggle('is-on')
          chip.setAttribute('aria-pressed', String(on))
          if (!step.multi && on) setTimeout(() => form.requestSubmit(), 220)
        }),
      )
    }
  }

  function readValue(step) {
    if (step.type === 'chips') {
      const on = [...stepEl.querySelectorAll('.chip.is-on')].map((b) => b.textContent)
      return step.multi ? on : on[0]
    }
    return $('#convo-input', stepEl).value.trim()
  }

  function valid(step, v) {
    if (step.optional) return true
    if (Array.isArray(v)) return v.length > 0
    if (!v) return false
    if (step.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    return true
  }

  function updateAvatar() {
    const ini = initials(answers.name)
    if (!ini) return
    avatar.classList.add('has-initials')
    $('.convo__initials', avatar).textContent = ini
    if (!reduced) gsap.fromTo(avatar, { scale: 0.6 }, { scale: 1, duration: 0.7, ease: 'back.out(2.5)' })
  }

  /**
   * Add the answer to the history list, then FLIP it so the typed answer appears to slide up from
   * the input into its smaller, dimmer slot while the question label fades away.
   */
  function glide(step, v) {
    const field = $('#convo-input', stepEl) ?? $('.convo__chips', stepEl)
    const from = field.getBoundingClientRect()
    const fromSize = parseFloat(getComputedStyle(field).fontSize)
    const olds = [...historyEl.children].map((el) => [el, el.getBoundingClientRect().top])

    const k = index
    const row = document.createElement('button')
    row.type = 'button'
    row.className = 'convo__bubble'
    row.setAttribute('aria-label', `Edit: ${step.question.replace('{first}', first())}`)
    row.innerHTML = `<span>${escapeHTML(Array.isArray(v) ? v.join(', ') : v || '—')}</span>`
    row.addEventListener('click', () => goBack(k))
    historyEl.appendChild(row)
    if (reduced) return

    const label = $('.convo__q', stepEl)
    const rest = [...stepEl.children].filter((el) => el !== label)
    gsap.to(label, { y: -10, opacity: 0, duration: 0.3, ease: 'power2.out' })
    gsap.to(rest, { opacity: 0, duration: 0.15, delay: 0.05 })
    const text = row.firstElementChild
    const to = text.getBoundingClientRect()
    const scale = step.type === 'chips' ? 1 : fromSize / parseFloat(getComputedStyle(text).fontSize)
    gsap.from(text, { x: from.left - to.left, y: from.top + (from.height - to.height * scale) / 2 - to.top, scale, opacity: 1, duration: 0.6, ease: 'expo.out' })
    // earlier answers make room by sliding up
    olds.forEach(([el, top]) => gsap.from(el, { y: top - el.getBoundingClientRect().top, duration: 0.6, ease: 'expo.out' }))
  }

  async function send() {
    const payload = { ...answers, source: location.href }
    card.classList.remove('has-bar')
    stepEl.innerHTML = `<p class="convo__q">Sending…</p>`
    gsap.set(stepEl, { opacity: 1 })
    let ok = true
    if (site.formEndpoint) {
      try {
        const res = await fetch(site.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        ok = res.ok
      } catch {
        ok = false
      }
    } else {
      const body = c.steps
        .map((s) => `${s.question.replace('{first}', first())}\n${[].concat(answers[s.id] ?? '').join(', ')}`)
        .join('\n\n')
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(`New project enquiry from ${answers.name}`)}&body=${encodeURIComponent(body)}`
    }
    stepEl.innerHTML = ok
      ? `<div class="convo__done"><span class="convo__done-icon">${icons.check}</span><p>${fill(c.done)}</p></div>`
      : `<div class="convo__done"><p>Something went wrong. Email us at <a href="mailto:${site.email}">${site.email}</a>.</p></div>`
    gsap.fromTo(stepEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: 'expo.out' })
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    engaged = true
    const step = c.steps[index]
    const v = readValue(step)
    if (!valid(step, v)) {
      gsap.fromTo(stepEl.querySelector('.convo__row'), { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      return
    }
    answers[step.id] = v
    if (step.id === 'name') updateAvatar()
    glide(step, v)
    if (index < c.steps.length - 1) {
      index++
      renderStep(1)
    } else send()
  })

  renderStep()
  initScrollMotion(reduced)
  initGrip(card, reduced)

  if (bus) {
    bus.on('contact:focus', () => {
      engaged = true
      const field = $('#convo-input', stepEl) || $('.chip', stepEl)
      field?.focus?.({ preventScroll: true })
    })
  }
}

/** Tug the sheet by its handle: it follows with some resistance, tilts, and springs back on release. */
function initGrip(card, reduced) {
  const grip = $('[data-convo-grip]', card)
  let start = null
  const move = (e) => {
    if (!start) return
    const x = (e.clientX - start.x) * 0.35
    const y = (e.clientY - start.y) * 0.35
    gsap.set(card, { x, y, rotation: gsap.utils.clamp(-4, 4, (x / 140) * 4) })
  }
  const end = () => {
    if (!start) return
    start = null
    card.classList.remove('is-dragging')
    gsap.to(card, { x: 0, y: 0, rotation: 0, duration: reduced ? 0 : 0.9, ease: 'elastic.out(1, 0.5)' })
  }
  grip.addEventListener('pointerdown', (e) => {
    start = { x: e.clientX, y: e.clientY }
    grip.setPointerCapture(e.pointerId)
    card.classList.add('is-dragging')
    gsap.killTweensOf(card)
  })
  grip.addEventListener('pointermove', move)
  grip.addEventListener('pointerup', end)
  grip.addEventListener('pointercancel', end)
}

/** As you reach the footer the contact card settles into place, and the sheet drops in from above with a little swing. */
function initScrollMotion(reduced) {
  if (reduced) return
  gsap.fromTo(
    '[data-contact-card]',
    { scale: 0.94, y: 50 },
    { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '[data-contact]', start: 'top bottom', end: 'top 20%', scrub: 0.6 } },
  )
  const drop = $('[data-convo-drop]')
  gsap.set(drop, { y: -150, rotation: -7, autoAlpha: 0 })
  ScrollTrigger.create({
    trigger: '[data-contact-card]',
    start: 'top 72%',
    once: true,
    onEnter: () =>
      gsap
        .timeline()
        .to(drop, { autoAlpha: 1, duration: 0.15 }, 0)
        .to(drop, { y: 0, duration: 0.8, ease: 'back.out(1.3)' }, 0)
        .to(drop, { rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.45)' }, 0),
  })
}
