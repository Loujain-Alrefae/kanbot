import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { fieldErrors } from "@/api/client"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateSprint, useDeleteSprint, useUpdateSprint } from "@/hooks/useSprints"
import type { Sprint } from "@/types/api"
import { SprintForm } from "./sprintForm"
import {
  SPRINT_FORM_ID,
  buildCreateBody,
  buildSprintSchema,
  buildUpdateBody,
  isSprintField,
  toFormValues,
} from "./sprintForm/config"
import type { SprintFormValues } from "./sprintForm/config"

interface SprintDialogProps {
    projectId: string
    /** null = create a new sprint, otherwise edit this (planned) sprint. */
    sprint: Sprint | null
    onClose: () => void
}

/* Mount it only while open ({dialog && <SprintDialog … />}): every opening starts with a fresh form. */
export function SprintDialog({ projectId, sprint, onClose }: SprintDialogProps) {
    const isEdit = sprint !== null
    const schema = useMemo(() => buildSprintSchema(isEdit), [isEdit])
    const initial = useMemo(() => toFormValues(sprint), [sprint])
    const form = useForm<SprintFormValues>({ resolver: zodResolver(schema), defaultValues: initial })

    const createSprint = useCreateSprint(projectId)
    const updateSprint = useUpdateSprint()
    const deleteSprint = useDeleteSprint()
    const [confirmDelete, setConfirmDelete] = useState(false)
    const busy = createSprint.isPending || updateSprint.isPending || deleteSprint.isPending

    function handleError(err: Error) {
        // Field errors from the server go under their field; anything else (409, 500, network) is a toast.
        let shown = false
        for (const [path, message] of Object.entries(fieldErrors(err))) {
        if (isSprintField(path)) {
            form.setError(path, { type: "server", message })
            shown = true
        }
        }
        if (!shown) toast.error(err.message)
    }

    function handleSubmit(values: SprintFormValues) {
        if (!sprint) {
        createSprint.mutate(buildCreateBody(values), { onSuccess: onClose, onError: handleError })
        return
        }

        const patch = buildUpdateBody(initial, values)
        if (Object.keys(patch).length === 0) {
        onClose() // nothing really changed: no request needed
        return
        }
        updateSprint.mutate({ id: sprint.id, body: patch }, { onSuccess: onClose, onError: handleError })
    }

    const todoCount = sprint?.stats.totalTodos ?? 0

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open && !busy) onClose()
        }}
        >
        <DialogContent className="gap-0 p-0 sm:max-w-lg">
            <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
            <DialogTitle>{isEdit ? "Edit sprint" : "Create sprint"}</DialogTitle>
            <DialogDescription>
                {isEdit ? `${sprint.name} · planned` : "Everything is optional. You can change it later."}
            </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5">
            <SprintForm form={form} onSubmit={handleSubmit} isEdit={isEdit} />
            </div>

            <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
            {isEdit ? (
                <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} disabled={busy}>
                Delete
                </Button>
            ) : (
                <span />
            )}
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                Cancel
                </Button>
                <Button type="submit" form={SPRINT_FORM_ID} disabled={busy}>
                {(createSprint.isPending || updateSprint.isPending) && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {isEdit ? "Save" : "Create sprint"}
                </Button>
            </div>
            </div>

            {/* Inside DialogContent on purpose: it counts as a nested dialog, so a click in it is not treated
                as a click "outside" this dialog (which would close it). */}
            {sprint && (
            <ConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={`Delete ${sprint.name}?`}
                description={
                todoCount === 0
                    ? "This sprint has no todos. It will be permanently deleted."
                    : `${todoCount} ${todoCount === 1 ? "todo" : "todos"} will go back to the backlog. The sprint itself will be permanently deleted.`
                }
                confirmLabel="Delete"
                loading={deleteSprint.isPending}
                onConfirm={() => deleteSprint.mutate(sprint.id, { onSuccess: onClose })}
            />
            )}
        </DialogContent>
        </Dialog>
    )
}