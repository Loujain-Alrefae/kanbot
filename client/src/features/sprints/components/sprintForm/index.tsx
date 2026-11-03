import type { UseFormReturn } from "react-hook-form"
import { Field, describe } from "@/components/FormField"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SPRINT_FORM_ID } from "./config"
import type { SprintFormValues } from "./config"

const NAME_HINT = "Leave empty to use the next “Sprint N” automatically."

interface SprintFormProps {
    form: UseFormReturn<SprintFormValues>
    onSubmit: (values: SprintFormValues) => void
    isEdit: boolean
}

export function SprintForm({ form, onSubmit, isEdit }: SprintFormProps) {
    const {
        register,
        formState: { errors },
    } = form
    const startDate = form.watch("startDate")
    const nameHint = isEdit ? undefined : NAME_HINT

    return (
        <form id={SPRINT_FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="sprint-name" label="Name" error={errors.name?.message} hint={nameHint}>
            <Input
            id="sprint-name"
            autoComplete="off"
            placeholder={isEdit ? "Sprint name" : "Sprint N"}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe("sprint-name", errors.name?.message, nameHint)}
            {...register("name")}
            />
        </Field>

        <Field id="sprint-goal" label="Goal" error={errors.goal?.message}>
            <Textarea
            id="sprint-goal"
            rows={3}
            className="resize-y"
            placeholder="What should this sprint achieve?"
            aria-invalid={errors.goal ? true : undefined}
            aria-describedby={describe("sprint-goal", errors.goal?.message)}
            {...register("goal")}
            />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sprint-startDate" label="Start date" error={errors.startDate?.message}>
            <Input
                id="sprint-startDate"
                type="date"
                aria-invalid={errors.startDate ? true : undefined}
                aria-describedby={describe("sprint-startDate", errors.startDate?.message)}
                {...register("startDate")}
            />
            </Field>

            <Field id="sprint-endDate" label="End date" error={errors.endDate?.message}>
            <Input
                id="sprint-endDate"
                type="date"
                min={startDate || undefined}
                aria-invalid={errors.endDate ? true : undefined}
                aria-describedby={describe("sprint-endDate", errors.endDate?.message)}
                {...register("endDate")}
            />
            </Field>
        </div>
        </form>
    )
}