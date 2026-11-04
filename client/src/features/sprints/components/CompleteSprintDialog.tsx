import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCompleteSprint, useSprints } from "@/hooks/useSprints"
import { boardTotals } from "@/lib/board"
import type { BoardColumns } from "@/lib/board"
import type { Sprint } from "@/types/api"

const BACKLOG = "backlog"

interface CompleteSprintDialogProps {
    sprint: Sprint
    /** The board columns from the cache: the numbers here must match what the user sees on the board. */
    columns: BoardColumns
    onClose: () => void
}

function plural(count: number, one: string, many: string) {
    return `${count} ${count === 1 ? one : many}`
}

/* Mount it only while open ({open && <CompleteSprintDialog … />}): every opening starts fresh. */
export function CompleteSprintDialog({ sprint, columns, onClose }: CompleteSprintDialogProps) {
    const navigate = useNavigate()
    const completeSprint = useCompleteSprint()
    const [target, setTarget] = useState<string>(BACKLOG)
    const [formError, setFormError] = useState<string | null>(null)

    // Same cached list as the backlog page, so no extra request in the usual case.
    const sprints = useSprints(sprint.projectId)
    const plannedSprints = (sprints.data ?? []).filter((item) => item.status === "planned")

    const totals = boardTotals(columns)
    const hasUnfinished = totals.unfinishedTodos > 0

    async function handleComplete() {
        setFormError(null)
        try {
        await completeSprint.mutateAsync({ id: sprint.id, body: { moveUnfinishedTo: target } })
        } catch (err) {
        // 409 and friends stay inside the dialog; the user can fix the choice or retry.
        setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        return
        }
        toast.success(`${sprint.name} completed`)
        onClose()
        navigate(`/projects/${sprint.projectId}/sprints/${sprint.id}`)
    }

    const busy = completeSprint.isPending

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open && !busy) onClose()
        }}
        >
        <DialogContent className="gap-0 p-0 sm:max-w-md">
            <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
            <DialogTitle>Complete {sprint.name}</DialogTitle>
            <DialogDescription>Finish this sprint and decide what happens to its unfinished todos.</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5">
            {formError && (
                <p
                role="alert"
                className="rounded-md border border-destructive-text/30 bg-destructive-subtle px-3 py-2 text-sm text-destructive-text"
                >
                {formError}
                </p>
            )}

            <div className="space-y-1">
                <p className="font-medium">
                {plural(totals.doneTodos, "todo", "todos")} done, {totals.unfinishedTodos} not finished
                </p>
                <p className="text-sm text-muted-foreground">
                {totals.donePoints} of {totals.totalPoints} story points completed
                </p>
            </div>

            {!hasUnfinished ? (
                <p className="text-sm text-muted-foreground">
                    {totals.totalTodos === 0
                    ? "This sprint has no todos. It will be completed as is."
                    : "Every todo is done. Nothing needs to be moved."}
                </p>
            ) : plannedSprints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Unfinished todos will go back to the backlog.</p>
            ) : (
                <fieldset className="space-y-2" disabled={busy}>
                <legend className="mb-2 text-sm font-medium">Move unfinished to:</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {[{ value: BACKLOG, label: "Backlog" }, ...plannedSprints.map((item) => ({ value: item.id, label: item.name }))].map(
                    (option) => (
                        <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="move-unfinished"
                            value={option.value}
                            checked={target === option.value}
                            onChange={() => setTarget(option.value)}
                            className="size-4 accent-primary"
                        />
                        {option.label}
                        </label>
                    ),
                    )}
                </div>
                </fieldset>
            )}
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                Cancel
            </Button>
            <Button type="button" onClick={() => void handleComplete()} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Complete sprint
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    )
}