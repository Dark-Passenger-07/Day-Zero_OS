import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('day_zero_os_theme') as Theme) || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('day_zero_os_theme', theme)
    const root = document.documentElement

    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark')
      
      let computed: 'light' | 'dark' = 'dark'
      if (t === 'system') {
        const matches = window.matchMedia('(prefers-color-scheme: dark)').matches
        computed = matches ? 'dark' : 'light'
      } else {
        computed = t
      }

      root.classList.add(computed)
      root.setAttribute('data-theme', computed)
      root.style.colorScheme = computed
    }

    applyTheme(theme)

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme('system')
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return value
}
