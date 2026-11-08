import { Sparkles } from "lucide-react"
import { ErrorState } from "@/components/ErrorState"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useActiveSprint } from "@/hooks/useSprints"
import { SprintSummary } from "./SprintSummary"
import { ScrollShadow } from "@/components/ScrollShadow"

/* Summary of the ACTIVE sprint (opened from the board and from the assistant drawer). Mount only while open. */
export function SprintSummaryDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const active = useActiveSprint(projectId)

    let body
    if (active.isError) {
        body = <ErrorState message={active.error.message} onRetry={() => active.refetch()} />
    } else if (active.isPending) {
        body = <Skeleton className="h-32 w-full bg-secondary" />
    } else if (active.data === null) {
        body = <p className="text-sm text-muted-foreground">There is no active sprint to summarize.</p>
    } else {
        // Saved summary if there is one, otherwise it starts generating right away.
        body = <SprintSummary key={active.data.id} sprint={active.data} autoGenerate />
    }

    return (
        <Dialog
        open
        onOpenChange={(open) => {
            if (!open) onClose()
        }}
        >
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-[min(42rem,calc(100%-4rem))]">
            <DialogHeader className="shrink-0 flex-row items-center gap-2 border-b px-6 py-4 pr-12 text-left">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <DialogTitle>{active.data ? `${active.data.name} summary` : "Sprint summary"}</DialogTitle>
            <DialogDescription className="sr-only">AI summary of the active sprint</DialogDescription>
            </DialogHeader>

            {/* <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{body}</div> */}
            <ScrollShadow className="px-6 py-5">{body}</ScrollShadow>
            <div className="flex shrink-0 justify-end border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
                Close
            </Button>
            </div>
        </DialogContent>
        </Dialog>
    )
}