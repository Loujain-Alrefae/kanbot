import { PRIORITY_LABELS, TYPE_LABELS } from "@/lib/todo"
import type { Todo, TodoType } from "@/types/api"

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

export interface EstimateInput {
    title: string
    description: string
    type: TodoType
}

/* Asks for ONE allowed number in a fixed format, so parseEstimate can read it. */
export function buildEstimatePrompt(input: EstimateInput): string {
    const description = input.description.trim().slice(0, 1500) || "(empty)"
    return [
        "Estimate the story points for this todo.",
        "Reply in exactly this format and nothing else:",
        "Estimate: N",
        "followed by one short sentence explaining why. N must be one of 1, 2, 3, 5, 8, 13.",
        "",
        `Type: ${TYPE_LABELS[input.type]}`,
        `Title: ${input.title.trim()}`,
        `Description: ${description}`,
    ].join("\n")
}