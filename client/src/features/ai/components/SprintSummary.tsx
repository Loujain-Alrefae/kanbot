import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { RefreshCw } from "lucide-react"
import { Sparkles } from "lucide-react"
import { Markdown } from "@/components/Markdown"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSprintSummary } from "@/hooks/useAi"
import type { Sprint } from "@/types/api"
import { AiBadge } from "./AiBadge"
import { AiButton } from "./AiButton"
import { AiDisclaimer } from "./AiDisclaimer"
import { AiError } from "./AiError"

interface SprintSummaryProps {
    sprint: Sprint
    /** Generate once on mount when there is no saved summary yet. */
    autoGenerate?: boolean
}

/* The summary area, shared by the board dialog and the sprint history page. */
export function SprintSummary({ sprint, autoGenerate = false }: SprintSummaryProps) {
    const summarize = useSprintSummary()
    const { mutate } = summarize
    const autoStarted = useRef(false)

    // The newest generation wins; after a reload the saved one comes from the sprint itself.
    const summary = summarize.data?.summary ?? sprint.summary
    const canSummarize = sprint.status !== "planned" // a planned sprint answers 409
    const pending = summarize.isPending

    useEffect(() => {
        if (!autoGenerate || !canSummarize || summary || autoStarted.current) return
        autoStarted.current = true // one automatic request per mount
        mutate(sprint.id)
    }, [autoGenerate, canSummarize, summary, sprint.id, mutate])

    function generate() {
        mutate(sprint.id)
    }

    const headingId = `summary-heading-${sprint.id}`

    return (
        <section aria-labelledby={headingId} className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h3 id={headingId} className="text-sm font-semibold">
                AI Summary
            </h3>
            <AiBadge />
            </div>
            {canSummarize && summary && (
            <Button type="button" variant="outline" size="sm" onClick={generate} disabled={pending}>
                <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
                Regenerate
            </Button>
            )}
        </div>

        {!canSummarize ? (
            <p className="text-sm text-muted-foreground">Summaries are available once the sprint starts.</p>
        ) : (
            <>
            {pending && (
                <div aria-busy="true" className="space-y-2">
                <span role="status" className="sr-only">
                    Writing the summary…
                </span>
                <Skeleton className="h-4 w-1/3 bg-secondary" />
                <Skeleton className="h-4 w-full bg-secondary" />
                <Skeleton className="h-4 w-11/12 bg-secondary" />
                <Skeleton className="h-4 w-2/3 bg-secondary" />
                </div>
            )}

            {summarize.isError && !pending && <AiError error={summarize.error} onRetry={generate} />}

            {!pending && summary && (
                <>
                <Markdown>{summary.content}</Markdown>
                <p className="text-xs text-muted-foreground">
                    Generated {format(new Date(summary.generatedAt), "MMM d, HH:mm")} ·{" "}
                    {summary.source === "mock" ? "Mock AI" : "AI"}
                </p>
                </>
            )}

            {!pending && !summary && !summarize.isError && (
                <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">No summary yet.</p>
                <AiButton size="sm" onClick={generate}>
                    Generate summary
                </AiButton>
                </div>
            )}

            <AiDisclaimer />
            </>
        )}
        </section>
    )
}