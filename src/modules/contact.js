import gsap from 'gsap'
import { icons } from './icons.js'
import { $, escapeHTML, initials, twoTone } from './utils.js'

/**
 * Conversational contact form: one question at a time, previous answers stack above,
 * the avatar fills in with the visitor's initials once they give their name.
 * Submits JSON to site.formEndpoint if set, otherwise opens a pre-filled email.
 */
export function initContact({ site, reduced }) {
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
  const stepEl = $('[data-convo-step]')
  const historyEl = $('[data-convo-history]')
  const avatar = $('[data-convo-avatar]')
  avatar.innerHTML = icons.user

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
    const html = `
      <label class="convo__q" for="convo-input">${fill(step.question)}${step.optional ? ' <span>(optional)</span>' : ''}</label>
      <div class="convo__row">
        ${fieldHTML(step)}
        <button type="submit" class="convo__next${last ? ' convo__next--send' : ''}" aria-label="${last ? 'Send' : 'Next'}">${last ? icons.check : icons.arrowRight}</button>
      </div>
      <div class="convo__foot">
        ${index > 0 ? `<button type="button" class="convo__back" data-back>Back</button>` : '<span></span>'}
        <span class="convo__count">${index + 1} / ${c.steps.length}</span>
      </div>`
    const swapIn = () => {
      stepEl.innerHTML = html
      wire(step)
      gsap.fromTo(stepEl, { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: reduced ? 0 : 0.6, ease: 'expo.out' })
    }
    if (!stepEl.innerHTML || reduced) return swapIn()
    gsap.to(stepEl, { y: -24 * dir, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: swapIn })
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
    $('[data-back]', stepEl)?.addEventListener('click', () => {
      engaged = true
      index = Math.max(0, index - 1)
      historyEl.lastElementChild?.remove()
      renderStep(-1)
    })
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
    avatar.textContent = ini
    if (!reduced) gsap.fromTo(avatar, { scale: 0.6 }, { scale: 1, duration: 0.7, ease: 'back.out(2.5)' })
  }

  function addHistory(step, v) {
    const row = document.createElement('div')
    row.className = 'convo__bubble'
    row.innerHTML = `<span>${fill(step.question)}</span><strong>${escapeHTML(Array.isArray(v) ? v.join(', ') : v || '—')}</strong>`
    historyEl.appendChild(row)
    if (!reduced) gsap.from(row, { y: 20, autoAlpha: 0, duration: 0.6, ease: 'expo.out' })
  }

  async function send() {
    const payload = { ...answers, source: location.href }
    stepEl.innerHTML = `<p class="convo__q">Sending…</p>`
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
    gsap.fromTo(stepEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' })
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
    addHistory(step, v)
    if (index < c.steps.length - 1) {
      index++
      renderStep(1)
    } else send()
  })

  renderStep()
  initScrollMotion(reduced)
}

/** The contact card settles into place and the form card tilts up as you reach the footer. */
function initScrollMotion(reduced) {
  if (reduced) return
  gsap.fromTo(
    '[data-contact-card]',
    { scale: 0.92, y: 60, borderRadius: 48 },
    { scale: 1, y: 0, borderRadius: 28, ease: 'none', scrollTrigger: { trigger: '[data-contact]', start: 'top bottom', end: 'top 25%', scrub: 0.6 } },
  )
  gsap.fromTo(
    '[data-convo]',
    { rotationX: 22, y: 140, transformPerspective: 1000, transformOrigin: '50% 100%' },
    { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '[data-contact]', start: 'top 85%', end: 'top 15%', scrub: 0.6 } },
  )
}
