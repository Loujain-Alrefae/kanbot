import { create } from "zustand"

export type Theme = "light" | "dark"
const KEY = "kanbot-theme"

function readInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch {
    /* storage can be unavailable */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

// Runs once when the module is first imported, before React renders.
const initialTheme = readInitialTheme()
applyTheme(initialTheme)

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark"
    applyTheme(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* the toggle still works for this session */
    }
    set({ theme: next })
  },
}))