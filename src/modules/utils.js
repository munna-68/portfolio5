export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

export const escapeHTML = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/** "Muted text **strong text**" → spans for the two-tone headline style. */
export const twoTone = (s = '') =>
  escapeHTML(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')

/** Tiny event bus shared between modules. */
export function createBus() {
  const map = new Map()
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set())
      map.get(evt).add(fn)
      return () => map.get(evt).delete(fn)
    },
    emit(evt, payload) {
      map.get(evt)?.forEach((fn) => fn(payload))
    },
  }
}
