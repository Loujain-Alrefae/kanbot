import type { BacklogFilters } from "@/hooks/useTodos"
import { TODO_PRIORITIES, TODO_TYPES } from "@/types/api"
import type { TodoPriority, TodoType } from "@/types/api"

/* What the toolbar shows. "all" is the UI stand-in for "no filter" (Select values cannot be empty). */
export interface FilterState {
    search: string
    priority: TodoPriority | "all"
    type: TodoType | "all"
}

export const EMPTY_FILTERS: FilterState = { search: "", priority: "all", type: "all" }

export function hasActiveFilters(filters: FilterState): boolean {
    return filters.search.trim() !== "" || filters.priority !== "all" || filters.type !== "all"
}

/* UI state -> the query params the API expects (empty search and "all" are left out). */
export function toApiFilters(filters: FilterState): BacklogFilters {
    const search = filters.search.trim()
    return {
        search: search || undefined,
        priority: filters.priority === "all" ? undefined : filters.priority,
        type: filters.type === "all" ? undefined : filters.type,
    }
}

/* Select gives us a plain string: find() narrows it to the real union, anything unknown means "all". */
export function parsePriorityFilter(value: string): FilterState["priority"] {
    return TODO_PRIORITIES.find((priority) => priority === value) ?? "all"
}

export function parseTypeFilter(value: string): FilterState["type"] {
    return TODO_TYPES.find((type) => type === value) ?? "all"
}