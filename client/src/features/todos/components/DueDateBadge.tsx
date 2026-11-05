import { AlertCircle, CalendarClock, CalendarDays } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { dueInfo } from "@/lib/dates"
import type { DueState } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { Todo } from "@/types/api"

// Each state has its own icon AND its own text: color only adds emphasis (NFR-5).
const STYLES: Record<DueState, { icon: LucideIcon; className: string }> = {
    overdue: {
        icon: AlertCircle,
        className: "border-destructive-text/30 bg-destructive-subtle text-destructive-text",
    },
    today: {
        icon: CalendarClock,
        className:
        "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
    },
    upcoming: {
        icon: CalendarDays,
        className: "border-border bg-secondary text-secondary-foreground",
    },
}

interface DueDateBadgeProps {
    todo: Pick<Todo, "dueDate" | "status">
    className?: string
}

export function DueDateBadge({ todo, className }: DueDateBadgeProps) {
    const info = dueInfo(todo.dueDate, todo.status)
    if (!info) return null

    const { icon: Icon, className: colors } = STYLES[info.state]
    return (
        <span
        className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
            colors,
            className,
        )}
        >
        <Icon className="size-3.5" aria-hidden="true" />
        {info.label}
        </span>
    )
}