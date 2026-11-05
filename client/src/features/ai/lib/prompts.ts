import { PRIORITY_LABELS, TYPE_LABELS } from "@/lib/todo"
import type { Todo } from "@/types/api"

const MAX_DESCRIPTION = 3000 // a chat message may hold 4000 characters

export function buildImprovePrompt(todo: Todo): string {
    const points = todo.storyPoints === null ? "not estimated" : `${todo.storyPoints} pts`
    const description = todo.description.trim().slice(0, MAX_DESCRIPTION) || "(empty)"
    return [
        "Improve this todo. Suggest a clearer title, a better description and acceptance criteria.",
        "",
        `${todo.key} · ${TYPE_LABELS[todo.type]} · ${PRIORITY_LABELS[todo.priority]} priority · ${points}`,
        `Title: ${todo.title}`,
        `Description: ${description}`,
    ].join("\n")
}