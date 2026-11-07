import { differenceInCalendarDays, parseISO } from "date-fns"
import { formatDate } from "@/lib/format"
import type { TodoStatus } from "@/types/api"

export type DueState = "overdue" | "today" | "upcoming"

export interface DueInfo {
    state: DueState
    label: string
}

export function dueInfo(dueDate: string | null, status: TodoStatus): DueInfo | null {
    if (!dueDate || status === "done") return null

    const days = differenceInCalendarDays(parseISO(dueDate), new Date())
    if (days < 0) return { state: "overdue", label: `Overdue · ${formatDate(dueDate)}` }
    if (days === 0) return { state: "today", label: "Due today" }
    return { state: "upcoming", label: `Due ${formatDate(dueDate)}` }
}