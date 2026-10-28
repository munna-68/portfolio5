import gsap from 'gsap'
import { $, $$, escapeHTML, wait } from './utils.js'

/**
 * Intro sequence:
 *  1. logo base draws in as a line, the three merlons pop up
 *  2. headline words rise in (blurred → sharp)
 *  3. once fonts + the first card's media are ready, headline blurs away
 *  4. the showcase cards fly up into their stack, header controls fade in
 */
export async function runPreloader({ site, showcase, header, reduced, firstMediaReady, skip = false }) {
  const pre = $('.preloader')
  const headline = $('[data-preloader-headline]')
  headline.innerHTML = site.preloader
    .map((w) => `<span class="preloader__word"><span>${escapeHTML(w)}</span></span>`)
    .join(' ')
  const words = $$('.preloader__word > span', headline)
  const base = $('.logo-mark__base')
  const merlons = $$('.logo-mark__merlon')

  const finish = () => {
    document.body.classList.remove('is-loading')
    pre.remove()
  }

  if (skip || reduced) {
    showcase.intro().progress(1)
    gsap.set(['[data-news]', '[data-cta]'], { autoAlpha: 1 })
    finish()
    return
  }

  const ready = Promise.race([Promise.all([document.fonts.ready, firstMediaReady]), wait(3200)])

  gsap.set(['[data-news]', '[data-cta]'], { autoAlpha: 0 })
  const tl = gsap.timeline()
  tl.fromTo(base, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.15)
    .fromTo(merlons, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2.4)' }, 0.75)
    .fromTo(words, { yPercent: 110, filter: 'blur(10px)', opacity: 0 }, { yPercent: 0, filter: 'blur(0px)', opacity: 1, duration: 1, stagger: 0.09, ease: 'expo.out' }, 0.45)

  await Promise.all([ready, wait(1700)])

  const out = gsap.timeline({ onComplete: finish })
  out
    .to(headline, { opacity: 0, filter: 'blur(14px)', scale: 0.96, y: -16, duration: 0.6, ease: 'power2.in' }, 0)
    .add(showcase.intro(), 0.35)
  header.reveal(out, 0.9)
  out.add(() => document.body.classList.remove('is-loading'), 0.9)
  await out
}
