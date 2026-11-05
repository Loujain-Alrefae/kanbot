import { POINTS_OPTIONS } from "@/lib/todo"
import { TODO_PRIORITIES, TODO_TYPES } from "@/types/api"
import type { CreateTodoRequest, GenerateTodosResponse, StoryPoints, TodoPriority, TodoType } from "@/types/api"

export const MAX_TITLE_LENGTH = 200

/* A suggestion the user can still edit. Client-side only: nothing is saved until "Add selected". */
export interface Draft {
    id: string
    selected: boolean
    title: string
    description: string
    type: TodoType
    priority: TodoPriority
    storyPoints: StoryPoints | null
}

/* Whatever the model returned, forced into values the API accepts. */
export function toDrafts(todos: GenerateTodosResponse["todos"]): Draft[] {
    return todos.map((todo) => ({
        id: crypto.randomUUID(),
        selected: true,
        title: todo.title,
        description: todo.description ?? "",
        type: TODO_TYPES.find((t) => t === todo.type) ?? "task",
        priority: TODO_PRIORITIES.find((p) => p === todo.priority) ?? "medium",
        storyPoints: POINTS_OPTIONS.find((p) => p === todo.storyPoints) ?? null,
    }))
}

export function draftError(draft: Draft): string | null {
    const length = draft.title.trim().length
    if (length === 0) return "Title is required."
    if (length > MAX_TITLE_LENGTH) return `Title must be at most ${MAX_TITLE_LENGTH} characters.`
    return null
}

export function toCreateRequests(drafts: Draft[]): CreateTodoRequest[] {
    return drafts.map((draft) => ({
        title: draft.title.trim(),
        description: draft.description,
        type: draft.type,
        priority: draft.priority,
        storyPoints: draft.storyPoints,
    }))
}