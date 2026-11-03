import { z } from "zod"
import { STORY_POINTS, TODO_PRIORITIES, TODO_STATUSES, TODO_TYPES } from "@/types/api"
import type { StoryPoints, Todo, UpdateTodoRequest } from "@/types/api"

/** id of the <form>: the dialog footer's Save button points at it with the `form` attribute. */
export const TODO_FORM_ID = "todo-details-form"

/** Select values cannot be null, so "no sprint" and "no points" get string stand-ins. */
export const BACKLOG_VALUE = "backlog"
export const NO_POINTS_VALUE = "none"

export const MAX_LABELS = 10
export const MAX_LABEL_LENGTH = 30

// Same limits as the server contract (CreateTodoRequest).
export const todoFormSchema = z.object({
    title: z.string().trim().min(1, "Enter a title").max(200, "Title must be 200 characters or fewer"),
    description: z.string().max(5000, "Description must be 5000 characters or fewer"),
    status: z.enum(TODO_STATUSES),
    priority: z.enum(TODO_PRIORITIES),
    type: z.enum(TODO_TYPES),
    storyPoints: z.string(), // "none" or "1" | "2" | "3" | "5" | "8" | "13"
    sprintId: z.string(), // "backlog" or a sprint id
    labels: z
        .array(z.string().max(MAX_LABEL_LENGTH, `Labels can be up to ${MAX_LABEL_LENGTH} characters`))
        .max(MAX_LABELS, `At most ${MAX_LABELS} labels`),
    dueDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Enter a valid date"), // "" or YYYY-MM-DD
})

export type TodoFormValues = z.infer<typeof todoFormSchema>

/** Server validation errors use API field names; this tells which of them the form can show. */
export function isFormField(name: string): name is keyof TodoFormValues {
    return Object.keys(todoFormSchema.shape).includes(name)
}

export function toFormValues(todo: Todo): TodoFormValues {
    return {
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        type: todo.type,
        storyPoints: todo.storyPoints === null ? NO_POINTS_VALUE : String(todo.storyPoints),
        sprintId: todo.sprintId ?? BACKLOG_VALUE,
        labels: [...todo.labels],
        dueDate: todo.dueDate ?? "",
    }
}

/* Only allowed values come back; anything else means "not estimated". No type cast needed. */
function parsePoints(value: string): StoryPoints | null {
    const number = Number(value)
    return STORY_POINTS.find((points) => points === number) ?? null
}

function sameLabels(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((label, index) => label === b[index])
}

/*
 * Builds the PATCH body from the fields that really changed. Sending everything would, for example,
 * re-send sprintId for a todo of a completed sprint and get a 409 even though the user only fixed a typo.
 */
export function buildPatch(initial: TodoFormValues, current: TodoFormValues): UpdateTodoRequest {
    const patch: UpdateTodoRequest = {}
    if (current.title !== initial.title) patch.title = current.title
    if (current.description !== initial.description) patch.description = current.description
    if (current.status !== initial.status) patch.status = current.status
    if (current.priority !== initial.priority) patch.priority = current.priority
    if (current.type !== initial.type) patch.type = current.type
    if (current.storyPoints !== initial.storyPoints) patch.storyPoints = parsePoints(current.storyPoints)
    if (current.sprintId !== initial.sprintId) {
        patch.sprintId = current.sprintId === BACKLOG_VALUE ? null : current.sprintId
    }
    if (!sameLabels(current.labels, initial.labels)) patch.labels = current.labels
    if (current.dueDate !== initial.dueDate) patch.dueDate = current.dueDate === "" ? null : current.dueDate
    return patch
}