import { Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { OptionSelect } from "@/components/OptionSelect"
import type { SelectOption } from "@/components/OptionSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { POINTS_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from "@/lib/todo"
import { LabelsInput } from "../LabelsInput"
import { MAX_LABEL_LENGTH, MAX_LABELS, NO_POINTS_VALUE, TODO_FORM_ID } from "./config"
import type { TodoFormValues } from "./config"
import { Field, describe } from "@/components/FormField"

const POINT_SELECT_OPTIONS: SelectOption[] = [
  { value: NO_POINTS_VALUE, label: "None" },
  ...POINTS_OPTIONS.map((points) => ({ value: String(points), label: String(points) })),
]

interface SelectFieldProps {
  form: UseFormReturn<TodoFormValues>
  name: "status" | "priority" | "type" | "storyPoints"
  label: string
  options: readonly SelectOption[]
}

function SelectField({ form, name, label, options }: SelectFieldProps) {
  const id = `todo-${name}`
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field id={id} label={label} error={fieldState.error?.message}>
          <OptionSelect
            id={id}
            value={field.value}
            onChange={field.onChange}
            options={options}
            aria-invalid={fieldState.error ? true : undefined}
            aria-describedby={describe(id, fieldState.error?.message)}
          />
        </Field>
      )}
    />
  )
}

interface TodoDetailsFormProps {
  form: UseFormReturn<TodoFormValues>
  onSubmit: (values: TodoFormValues) => void
  sprintOptions: readonly SelectOption[]
  sprintDisabled: boolean
  sprintHint?: string
  sprintPlaceholder: string
}

export function TodoDetailsForm({
  form,
  onSubmit,
  sprintOptions,
  sprintDisabled,
  sprintHint,
  sprintPlaceholder,
}: TodoDetailsFormProps) {
  const { register, formState } = form
  const { errors } = formState
  const dueDate = form.watch("dueDate")

  return (
    <form
      id={TODO_FORM_ID}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem]"
    >
      {/* Left column: the text */}
      <div className="space-y-4">
        <Field id="todo-title" label="Title" error={errors.title?.message}>
          <Input
            id="todo-title"
            autoComplete="off"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describe("todo-title", errors.title?.message)}
            {...register("title")}
          />
        </Field>

        <Field id="todo-description" label="Description" error={errors.description?.message}>
          <Textarea
            id="todo-description"
            rows={6}
            className="min-h-32 resize-y"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describe("todo-description", errors.description?.message)}
            {...register("description")}
          />
        </Field>
      </div>

      {/* Right column: the attributes */}
      <div className="space-y-4">
        <SelectField form={form} name="status" label="Status" options={STATUS_OPTIONS} />
        <SelectField form={form} name="priority" label="Priority" options={PRIORITY_OPTIONS} />
        <SelectField form={form} name="type" label="Type" options={TYPE_OPTIONS} />
        <SelectField form={form} name="storyPoints" label="Story points" options={POINT_SELECT_OPTIONS} />

        <Controller
          control={form.control}
          name="sprintId"
          render={({ field, fieldState }) => (
            <Field id="todo-sprintId" label="Sprint" error={fieldState.error?.message} hint={sprintHint}>
              <OptionSelect
                id="todo-sprintId"
                value={field.value}
                onChange={field.onChange}
                options={sprintOptions}
                disabled={sprintDisabled}
                placeholder={sprintPlaceholder}
                aria-describedby={describe("todo-sprintId", fieldState.error?.message, sprintHint)}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="labels"
          render={({ field, fieldState }) => (
            <Field id="todo-labels" label="Labels" error={fieldState.error?.message}>
              <LabelsInput
                id="todo-labels"
                value={field.value}
                onChange={field.onChange}
                maxLabels={MAX_LABELS}
                maxLength={MAX_LABEL_LENGTH}
                aria-invalid={fieldState.error ? true : undefined}
                aria-describedby={describe("todo-labels", fieldState.error?.message)}
              />
            </Field>
          )}
        />

        <Field id="todo-dueDate" label="Due date" error={errors.dueDate?.message}>
          <div className="flex items-center gap-2">
            <Input
              id="todo-dueDate"
              type="date"
              className="flex-1"
              aria-invalid={errors.dueDate ? true : undefined}
              aria-describedby={describe("todo-dueDate", errors.dueDate?.message)}
              {...register("dueDate")}
            />
            {dueDate !== "" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Clear due date"
                onClick={() => form.setValue("dueDate", "", { shouldDirty: true })}
              >
                Clear
              </Button>
            )}
          </div>
        </Field>
      </div>
    </form>
  )
}