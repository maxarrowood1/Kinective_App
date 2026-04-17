import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'
export type FontSize = 'small' | 'medium' | 'large'

export interface AccentPreset {
  name: string
  hex: string
  hover: string
  rgb: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'Blue',   hex: '#58a6ff', hover: '#79c0ff', rgb: '88, 166, 255' },
  { name: 'Purple', hex: '#a371f7', hover: '#c49bff', rgb: '163, 113, 247' },
  { name: 'Green',  hex: '#3fb950', hover: '#56d364', rgb: '63, 185, 80' },
  { name: 'Orange', hex: '#f0883e', hover: '#ffa657', rgb: '240, 136, 62' },
  { name: 'Pink',   hex: '#f778ba', hover: '#ff9fd1', rgb: '247, 120, 186' },
]

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small:  '13px',
  medium: '15px',
  large:  '17px',
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function applyAccent(name: string) {
  const preset = ACCENT_PRESETS.find(p => p.name === name) ?? ACCENT_PRESETS[0]
  const root = document.documentElement
  root.style.setProperty('--accent', preset.hex)
  root.style.setProperty('--accent-hover', preset.hover)
  root.style.setProperty('--accent-rgb', preset.rgb)
}

function applyFontSize(size: FontSize) {
  document.documentElement.style.setProperty('--font-size-base', FONT_SIZE_MAP[size])
}

export function useSettings() {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) ?? 'dark'
  )
  const [accent, setAccentState] = useState<string>(() =>
    localStorage.getItem('accent') ?? 'Blue'
  )
  const [fontSize, setFontSizeState] = useState<FontSize>(() =>
    (localStorage.getItem('fontSize') as FontSize) ?? 'medium'
  )

  useEffect(() => {
    applyTheme(theme)
    applyAccent(accent)
    applyFontSize(fontSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  const setAccent = (name: string) => {
    setAccentState(name)
    localStorage.setItem('accent', name)
    applyAccent(name)
  }

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem('fontSize', size)
    applyFontSize(size)
  }

  return { theme, accent, fontSize, setTheme, setAccent, setFontSize }
}
