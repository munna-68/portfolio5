import { escapeHTML } from './utils.js'

/**
 * Builds a media element (video / image / youtube) from a project media object.
 * Video sources are attached lazily: nothing downloads until load() or play() is called,
 * so only the active showcase card (and the next one) ever hit the network.
 *
 * Returns { el, load, play, pause, type }
 */
export function createMedia(media, { interactive = false } = {}) {
  const el = document.createElement('div')
  el.className = `media media--${media.type}`

  if (media.type === 'video') {
    const video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'none'
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    if (media.poster) video.poster = media.poster
    el.appendChild(video)

    let loaded = false
    const load = () => {
      if (loaded) return
      loaded = true
      if (media.webm) video.insertAdjacentHTML('beforeend', `<source src="${media.webm}" type="video/webm">`)
      video.insertAdjacentHTML('beforeend', `<source src="${media.src}" type="video/mp4">`)
      video.preload = 'auto'
      video.load()
    }
    return {
      el,
      type: 'video',
      load,
      play() {
        load()
        video.play().catch(() => {})
      },
      pause() {
        video.pause()
      },
    }
  }

  if (media.type === 'youtube') {
    let loaded = false
    const params = interactive
      ? 'rel=0&modestbranding=1&playsinline=1'
      : `autoplay=1&mute=1&loop=1&playlist=${media.id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1`
    if (!interactive) el.classList.add('media--cover')
    el.style.backgroundImage = `url(https://i.ytimg.com/vi/${media.id}/hqdefault.jpg)`
    const load = () => {
      if (loaded) return
      loaded = true
      el.insertAdjacentHTML(
        'beforeend',
        `<iframe src="https://www.youtube-nocookie.com/embed/${media.id}?${params}" title="${escapeHTML(media.title ?? 'Video')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`,
      )
    }
    return { el, type: 'youtube', load, play: load, pause() {} }
  }

  // image
  const img = document.createElement('img')
  img.alt = media.alt ?? ''
  img.decoding = 'async'
  img.loading = 'lazy'
  if (media.srcset) {
    img.srcset = media.srcset
    img.sizes = media.sizes ?? '(max-width: 900px) 92vw, 1100px'
  }
  img.src = media.src
  el.appendChild(img)
  const load = () => {
    img.loading = 'eager'
  }
  return { el, type: 'image', load, play: load, pause() {} }
}
