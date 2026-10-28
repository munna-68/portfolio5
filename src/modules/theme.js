/**
 * The page accent + background tint follow the active project.
 * Both are registered CSS custom properties (see @property in base.css),
 * so the browser interpolates them smoothly when they change.
 */
export const BRAND = '#F26A1B'

const root = document.documentElement

export function setTheme(project) {
  root.style.setProperty('--accent', project?.accent ?? BRAND)
  root.style.setProperty('--tint', `${project?.tint ?? 0}%`)
}

export function resetTheme() {
  root.style.setProperty('--accent', BRAND)
  root.style.setProperty('--tint', '0%')
}
