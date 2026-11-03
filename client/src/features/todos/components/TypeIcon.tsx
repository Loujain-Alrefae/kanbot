import { BookOpen, Bug, CheckSquare } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { TYPE_LABELS } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { TodoType } from "@/types/api"

const ICONS: Record<TodoType, LucideIcon> = {
    story: BookOpen,
    task: CheckSquare,
    bug: Bug,
}

// Color only decorates: the icon shape and the text already tell the type apart (NFR-5).
const ICON_COLORS: Record<TodoType, string> = {
    story: "text-emerald-700 dark:text-emerald-300",
    task: "text-sky-700 dark:text-sky-300",
    bug: "text-red-700 dark:text-red-300",
}

interface TypeIconProps {
    type: TodoType
    /** false = icon only (the text stays for screen readers). */
    showLabel?: boolean
    className?: string
}

export function TypeIcon({ type, showLabel = true, className }: TypeIconProps) {
    const Icon = ICONS[type]
    return (
        <span
        className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium text-foreground",
            className,
        )}
        >
        <Icon className={cn("size-3.5", ICON_COLORS[type])} aria-hidden="true" />
        <span className={showLabel ? undefined : "sr-only"}>{TYPE_LABELS[type]}</span>
        </span>
    )
}