import { CalendarClock, CalendarDays, Clock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { dueInfo } from "@/lib/dates"
import type { DueState } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { Todo } from "@/types/api"

// Each state has its own icon AND its own text: color only adds emphasis (NFR-5).
// Overdue is rose (never confused with "urgent"), today is amber, a date still far away stays neutral.
const STYLES: Record<DueState, { icon: LucideIcon; className: string }> = {
    overdue: {
        icon: Clock,
        className: "border-overdue-edge bg-overdue-bg text-overdue-fg",
    },
    today: {
        icon: CalendarClock,
        className: "border-today-edge bg-today-bg text-today-fg",
    },
    upcoming: {
        icon: CalendarDays,
        className: "border-later-edge bg-later-bg text-later-fg",
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