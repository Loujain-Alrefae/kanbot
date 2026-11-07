import { ChevronDown, ChevronUp, ChevronsUp, Equal } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PRIORITY_LABELS } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { TodoPriority } from "@/types/api"

const STYLES: Record<TodoPriority, { icon: LucideIcon; className: string }> = {
    low: {
        icon: ChevronDown,
        className: "border-prio-low-edge bg-prio-low-bg text-prio-low-fg",
    },
    medium: {
        icon: Equal,
        className: "border-prio-med-edge bg-prio-med-bg text-prio-med-fg",
    },
    high: {
        icon: ChevronUp,
        className:
        "border-orange-300 bg-orange-100 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
    },
    urgent: {
        icon: ChevronsUp,
        className: "border-destructive-text/30 bg-destructive-subtle text-destructive-text",
    },
}

interface PriorityBadgeProps {
    priority: TodoPriority
    className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const { icon: Icon, className: colors } = STYLES[priority]
    return (
        <span
        className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium",
            colors,
            className,
        )}
        >
        <Icon className="size-3.5" aria-hidden="true" />
        {PRIORITY_LABELS[priority]}
        </span>
    )
}