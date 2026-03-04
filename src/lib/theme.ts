export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function getStoredTheme(): Theme | null {
  const t = localStorage.getItem(STORAGE_KEY)
  return t === 'dark' || t === 'light' ? t : null
}

export function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

export function toggleTheme(current?: Theme): Theme {
  const next: Theme = (current ?? getInitialTheme()) === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
