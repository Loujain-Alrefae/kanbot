import { STORY_POINTS, TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from "@/types/api"
import type { StoryPoints, TodoPriority, TodoStatus, TodoType } from "@/types/api"

export const TYPE_LABELS: Record<TodoType, string> = {
    task: "Task",
    story: "Story",
    bug: "Bug",
}

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    done: "Done",
}

/* Option lists for Select fields (filters, details form). */
export const TYPE_OPTIONS = TODO_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] }))
export const PRIORITY_OPTIONS = TODO_PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }))
export const STATUS_OPTIONS = TODO_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))
export const POINTS_OPTIONS: readonly StoryPoints[] = STORY_POINTS

/* Sum of story points (not estimated counts as 0, same as the server). */
export function sumPoints(todos: { storyPoints: StoryPoints | null }[]): number {
    return todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0)
}

/* "15 todos · 29 pts": used by the page header and section headers. */
export function summarizeTodos(todos: { storyPoints: StoryPoints | null }[]): string {
    const count = todos.length
    return `${count} ${count === 1 ? "todo" : "todos"} · ${sumPoints(todos)} pts`
}

export const END_OF_LIST = 10000