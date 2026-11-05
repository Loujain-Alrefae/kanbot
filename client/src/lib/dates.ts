import { differenceInCalendarDays, parseISO } from "date-fns"
import { formatDate } from "@/lib/format"
import type { TodoStatus } from "@/types/api"

export type DueState = "overdue" | "today" | "upcoming"

export interface DueInfo {
    state: DueState
    label: string
}

/*
 * Due-date status of a todo, or null when there is nothing to show:
 * no due date, or the todo is done (a finished todo can't be late).
 * Counts calendar days, so the time of day never matters.
 */
export function dueInfo(dueDate: string | null, status: TodoStatus): DueInfo | null {
    if (!dueDate || status === "done") return null

    const days = differenceInCalendarDays(parseISO(dueDate), new Date())
    if (days < 0) return { state: "overdue", label: `Overdue · ${formatDate(dueDate)}` }
    if (days === 0) return { state: "today", label: "Due today" }
    return { state: "upcoming", label: `Due ${formatDate(dueDate)}` }
}