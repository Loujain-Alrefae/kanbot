import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/theme.store"

export function ThemeToggle({ className }: { className?: string }) {
    const theme = useThemeStore((s) => s.theme)
    const toggle = useThemeStore((s) => s.toggle)
    const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode"

    return (
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={label} title={label} className={className}>
        {theme === "dark" ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
        </Button>
    )
}