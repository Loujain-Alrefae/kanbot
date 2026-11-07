import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldErrors } from "@/api/client"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { ErrorState } from "@/components/ErrorState"
import type { SelectOption } from "@/components/OptionSelect"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSprints } from "@/hooks/useSprints"
import { useDeleteTodo, useTodo, useUpdateTodo } from "@/hooks/useTodos"
import { formatDate } from "@/lib/format"
import { TYPE_LABELS } from "@/lib/todo"
import type { Todo } from "@/types/api"
import { TodoDetailsForm } from "./todoDetails"
import { BACKLOG_VALUE, buildPatch, isFormField, toFormValues, todoFormSchema } from "./todoDetails/config"
import type { TodoFormValues } from "./todoDetails/config"
import { AiButton } from "@/features/ai/components/AiButton"
import { buildImprovePrompt } from "@/features/ai/lib/prompts"
import { useAiUiStore } from "@/store/ai-ui.store"
import { ScrollShadow } from "@/components/ScrollShadow"

interface TodoDetailsDialogProps {
  projectId: string
  todoId: string
  onClose: () => void
}

/*
 * Mount this only while a todo is selected: {selectedId && <TodoDetailsDialog ... />}.
 * Closing = unmounting, so every opening starts with a fresh form.
 */
export function TodoDetailsDialog({ projectId, todoId, onClose }: TodoDetailsDialogProps) {
  const todoQuery = useTodo(todoId, projectId)

  // Data first, error second: after a delete the refetch of this todo returns 404, but the data is still here.
  if (todoQuery.data) {
    return <LoadedTodoDialog key={todoQuery.data.id} todo={todoQuery.data} projectId={projectId} onClose={onClose} />
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-[min(48rem,calc(100%-4rem))]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle>Todo details</DialogTitle>
          <DialogDescription className="sr-only">Loading the todo</DialogDescription>
        </DialogHeader>

        {todoQuery.isError ? (
          <div className="p-4 sm:p-6">
            <ErrorState message={todoQuery.error.message} onRetry={() => todoQuery.refetch()} />
          </div>
        ) : (
          <DialogSkeleton />
        )}
      </DialogContent>
    </Dialog>
  )
}

function DialogSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6 px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-[minmax(0,1fr)_17rem]">
      <span className="sr-only">Loading todo…</span>
      <div className="space-y-4">
        <Skeleton className="h-9 w-full bg-secondary" />
        <Skeleton className="h-48 w-full bg-secondary" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full bg-secondary" />
        ))}
      </div>
    </div>
  )
}

interface LoadedTodoDialogProps {
  todo: Todo
  projectId: string
  onClose: () => void
}

function LoadedTodoDialog({ todo, projectId, onClose }: LoadedTodoDialogProps) {
  // Frozen at mount: a background refetch (window focus) must not reset what the user is typing,
  // and the patch is computed against what the form started with.
  const [initial] = useState(() => toFormValues(todo))
  const form = useForm<TodoFormValues>({ resolver: zodResolver(todoFormSchema), defaultValues: initial })
  const { isDirty } = form.formState // read during render so react-hook-form keeps it up to date

  const sprints = useSprints(projectId)
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const busy = updateTodo.isPending || deleteTodo.isPending

  const askAi = useAiUiStore((s) => s.askAi)
  // Close first (the drawer is modal too), then hand the todo to the assistant. It sends the SAVED version,
  // which is why the button waits while there are unsaved changes.
  function handleImprove() {
    onClose()
    askAi(buildImprovePrompt(todo))
  }

  // Sprint choices: Backlog + planned + active. A todo that sits in a completed sprint can't be moved (409).
  const currentSprint = sprints.data?.find((sprint) => sprint.id === todo.sprintId)
  const locked = currentSprint?.status === "completed"

  const sprintOptions = useMemo(() => {
    const options: SelectOption[] = [{ value: BACKLOG_VALUE, label: "Backlog" }]
    for (const sprint of sprints.data ?? []) {
      if (sprint.status !== "completed" || sprint.id === todo.sprintId) {
        options.push({ value: sprint.id, label: `${sprint.name} (${sprint.status})` })
      }
    }
    return options
  }, [sprints.data, todo.sprintId])

  function requestClose() {
    if (busy) return
    if (isDirty) setConfirmDiscard(true)
    else onClose()
  }

  function handleSave(values: TodoFormValues) {
    const patch = buildPatch(initial, values)
    if (Object.keys(patch).length === 0) {
      onClose() // nothing really changed (for example only a trailing space): no request needed
      return
    }

    updateTodo.mutate(
      { id: todo.id, body: patch },
      {
        onSuccess: onClose,
        onError: (err) => {
          // Field errors from the server go under their field; anything else (409, 500, network) is a toast.
          let shown = false
          for (const [path, message] of Object.entries(fieldErrors(err))) {
            const name = path.split(".")[0]
            if (isFormField(name)) {
              form.setError(name, { type: "server", message })
              shown = true
            }
          }
          if (!shown) toast.error(err.message)
        },
      },
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // X, Esc and a click outside all arrive here.
        if (!open) requestClose()
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-[min(48rem,calc(100%-4rem))]">
        {/* pr-12 keeps the title clear of the close button; sm:pr-12 repeats it because sm:px-6 would reset it. */}
        <DialogHeader className="flex-row items-center gap-3 border-b px-4 py-3 pr-12 text-left sm:px-6 sm:py-4 sm:pr-12">
          <DialogTitle className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {todo.key}
          </DialogTitle>
          <DialogDescription>
            {TYPE_LABELS[todo.type]} · created {formatDate(todo.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollShadow className="px-6 py-5">
          <TodoDetailsForm
            form={form}
            onSubmit={handleSave}
            sprintOptions={sprintOptions}
            sprintDisabled={locked || sprints.isPending}
            sprintHint={locked ? "Todos in a completed sprint can't be moved." : undefined}
            sprintPlaceholder={sprints.isPending ? "Loading…" : "Unknown sprint"}
            projectId={projectId}
          />
        </ScrollShadow>

        <div className="flex flex-col gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              className="max-sm:h-11"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              Delete
            </Button>
            <AiButton
              className="flex-1 max-sm:h-11 sm:flex-none"
              onClick={handleImprove}
              disabled={busy || isDirty}
              title={isDirty ? "Save or discard your changes first" : undefined}
            >
              Improve with AI
            </AiButton>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button type="button" variant="outline" className="max-sm:h-11" onClick={requestClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form="todo-details-form" className="max-sm:h-11" disabled={busy}>
              {updateTodo.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Save
            </Button>
          </div>
        </div>

        {/* Inside DialogContent on purpose: they count as nested dialogs, so a click in them is not
            treated as a click "outside" the details dialog (which would close it). */}
        <ConfirmDialog
          open={confirmDiscard}
          onOpenChange={setConfirmDiscard}
          title="Discard changes?"
          description="You have unsaved changes. If you close now, they will be lost."
          confirmLabel="Discard"
          onConfirm={onClose}
        />
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete todo?"
          description={`${todo.key} "${todo.title}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          loading={deleteTodo.isPending}
          onConfirm={() => deleteTodo.mutate(todo.id, { onSuccess: onClose })}
        />
      </DialogContent>
    </Dialog>
  )
}