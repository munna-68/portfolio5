import './styles/main.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { projects } from './data/projects.js'
import { site } from './data/site.js'
import { createBus, reducedMotion } from './modules/utils.js'
import { initHeader } from './modules/header.js'
import { initShowcase } from './modules/showcase.js'
import { initDetail, slugFromPath } from './modules/detail.js'
import { initSections } from './modules/sections.js'
import { initContact } from './modules/contact.js'
import { runPreloader } from './modules/preloader.js'

gsap.registerPlugin(ScrollTrigger)
history.scrollRestoration = 'manual'

const reduced = reducedMotion()
const bus = createBus()

const lenis = new Lenis({ lerp: reduced ? 1 : 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
lenis.stop() // released when the preloader finishes
window.scrollTo(0, 0)

const ctx = { projects, site, lenis, bus, reduced }
const header = initHeader(ctx)
const showcase = initShowcase(ctx)
const detail = initDetail({ ...ctx, showcase, header })
initSections(ctx)
initContact(ctx)

// Resolve when the first card has something to show (video frame / image), so the intro never reveals a blank card.
const firstMediaReady = new Promise((resolve) => {
  const el = showcase.cards[0].querySelector('video, img')
  if (!el) return resolve()
  if (el.tagName === 'IMG') return el.complete ? resolve() : el.addEventListener('load', resolve, { once: true })
  if (el.readyState >= 2) return resolve()
  el.addEventListener('loadeddata', resolve, { once: true })
})

const deepLink = projects.findIndex((p) => p.slug === slugFromPath())

;(async () => {
  if (deepLink > -1) showcase.scrollToIndex(deepLink, { immediate: true })
  await runPreloader({ site, showcase, header, reduced, firstMediaReady, skip: deepLink > -1 })
  lenis.start()
  ScrollTrigger.refresh()
  if (deepLink > -1) {
    history.replaceState({}, '', '/')
    detail.open(deepLink, { push: 'push' })
  }
})()

addEventListener('load', () => ScrollTrigger.refresh())
