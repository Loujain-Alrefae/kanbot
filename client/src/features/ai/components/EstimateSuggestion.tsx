import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StoryPoints } from "@/types/api"
import { useEstimateTodo } from "../hooks/useEstimateTodo"
import type { EstimateInput } from "../lib/prompts"
import { AiBadge } from "./AiBadge"
import { AiButton } from "./AiButton"
import { AiDisclaimer } from "./AiDisclaimer"
import { AiError } from "./AiError"

interface EstimateSuggestionProps {
    projectId: string
    /** The todo as it is in the form right now (unsaved edits included). */
    read: () => EstimateInput
    canEstimate: boolean
    onApply: (points: StoryPoints) => void
    }

    export function EstimateSuggestion({ projectId, read, canEstimate, onApply }: EstimateSuggestionProps) {
    const estimate = useEstimateTodo(projectId)

    function run() {
        estimate.mutate(read())
    }

    return (
        <div className="space-y-2">
        <AiButton size="sm" onClick={run} disabled={!canEstimate || estimate.isPending}>
            {estimate.isPending ? (
            <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Estimating…
            </>
            ) : (
            "Estimate with AI"
            )}
        </AiButton>
        {!canEstimate && <p className="text-xs text-muted-foreground">Write a title first.</p>}

        {estimate.isError && !estimate.isPending && <AiError error={estimate.error} onRetry={run} />}

        {estimate.isSuccess && (
            <div role="status" className="space-y-2 rounded-md border bg-muted p-3 text-sm">
            <p className="flex flex-wrap items-center gap-2 font-medium">
                Suggested: {estimate.data.points} pts
                <AiBadge />
            </p>
            {estimate.data.reason && <p className="wrap-break-word text-muted-foreground">{estimate.data.reason}</p>}
            <div className="flex gap-2">
                <Button
                type="button"
                size="sm"
                onClick={() => {
                    onApply(estimate.data.points)
                    estimate.reset()
                }}
                >
                Apply
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => estimate.reset()}>
                Dismiss
                </Button>
            </div>
            <AiDisclaimer />
            </div>
        )}
        </div>
    )
}