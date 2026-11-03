import { z } from "zod"
import type { CreateSprintRequest, Sprint, UpdateSprintRequest } from "@/types/api"

/** id of the <form>: the dialog footer's submit button points at it with the `form` attribute. */
export const SPRINT_FORM_ID = "sprint-form"

const DATE_OR_EMPTY = /^(\d{4}-\d{2}-\d{2})?$/ // "" or YYYY-MM-DD

/*
 * Same limits as the contract (CreateSprintRequest). The name is optional when creating (the server
 * numbers it "Sprint N") but required when editing, so an edit can never blank the name.
 * ISO date strings sort like dates, so comparing them as text is correct.
 */
export function buildSprintSchema(requireName: boolean) {
    return z
        .object({
        name: z.string().trim().max(80, "Name must be 80 characters or fewer"),
        goal: z.string().max(300, "Goal must be 300 characters or fewer"),
        startDate: z.string().regex(DATE_OR_EMPTY, "Enter a valid date"),
        endDate: z.string().regex(DATE_OR_EMPTY, "Enter a valid date"),
        })
        .superRefine((values, ctx) => {
        if (requireName && values.name === "") {
            ctx.addIssue({ code: "custom", path: ["name"], message: "Enter a name" })
        }
        if (values.startDate && values.endDate && values.endDate < values.startDate) {
            ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date" })
        }
    })
}

export type SprintFormValues = z.infer<ReturnType<typeof buildSprintSchema>>

const SPRINT_FIELDS = ["name", "goal", "startDate", "endDate"] as const

/** Server validation errors use API field names; this tells which of them the form can show. */
export function isSprintField(name: string): name is (typeof SPRINT_FIELDS)[number] {
    return SPRINT_FIELDS.some((field) => field === name)
}

export function toFormValues(sprint: Sprint | null): SprintFormValues {
    return {
        name: sprint?.name ?? "",
        goal: sprint?.goal ?? "",
        startDate: sprint?.startDate ?? "",
        endDate: sprint?.endDate ?? "",
    }
}

/* Only filled fields are sent: an empty name means "let the server number it". */
export function buildCreateBody(values: SprintFormValues): CreateSprintRequest {
    const body: CreateSprintRequest = {}
    if (values.name) body.name = values.name
    const goal = values.goal.trim()
    if (goal) body.goal = goal
    if (values.startDate) body.startDate = values.startDate
    if (values.endDate) body.endDate = values.endDate
    return body
}

/* Only the fields that really changed. A cleared date becomes null. */
export function buildUpdateBody(initial: SprintFormValues, current: SprintFormValues): UpdateSprintRequest {
    const patch: UpdateSprintRequest = {}
    if (current.name !== initial.name) patch.name = current.name
    const goal = current.goal.trim()
    if (goal !== initial.goal) patch.goal = goal
    if (current.startDate !== initial.startDate) patch.startDate = current.startDate || null
    if (current.endDate !== initial.endDate) patch.endDate = current.endDate || null
    return patch
}