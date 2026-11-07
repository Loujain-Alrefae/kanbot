import type { ComponentProps } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/theme.store"

type Props = {
  className?: string
  variant?: ComponentProps<typeof Button>["variant"]
}

export function ThemeToggle({ className, variant = "ghost" }: Props) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const isDark = theme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"
  const Icon = isDark ? Sun : Moon

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={className}
    >
      <Icon className="size-5" aria-hidden="true" />
    </Button>
  )
}