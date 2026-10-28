const svg = (body, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`

export const icons = {
  shuffle: svg('<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>'),
  down: svg('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
  close: svg('<path d="M6 6l12 12"/><path d="M18 6 6 18"/>'),
  arrowRight: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  arrowUpRight: svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
  chevronRight: svg('<path d="m9 6 6 6-6 6"/>'),
  sparkle: svg('<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="6.5" cy="6.5" r=".6"/><circle cx="17.5" cy="6.5" r=".6"/><circle cx="6.5" cy="17.5" r=".6"/><circle cx="17.5" cy="17.5" r=".6"/>'),
  plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  expand: svg('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/>'),
  linkedin: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16"/><path d="M8 7.8v.01"/><path d="M12 16v-3.2c0-1.5 1-2.3 2.1-2.3S16 11.3 16 12.8V16"/><path d="M12 10.5V16"/>'),
  design: svg('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16"/><path d="M9 20V9"/>'),
  build: svg('<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/>'),
  keep: svg('<path d="M4 20V8h3v3h3V8h4v3h3V8h3v12z"/><path d="M10 20v-4h4v4"/>'),
}
