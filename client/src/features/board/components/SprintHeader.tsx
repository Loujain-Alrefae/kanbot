import type { ReactNode } from "react"
import type { BoardTotals } from "@/lib/board"
import { daysLeftLabel, formatDateRange } from "@/lib/format"
import type { Sprint } from "@/types/api"
import { SprintProgress } from "./SprintProgress"

interface SprintHeaderProps {
    sprint: Sprint
    totals: BoardTotals
    /** Buttons on the right (Summarize, Complete sprint). */
    actions?: ReactNode
}

export function SprintHeader({ sprint, totals, actions }: SprintHeaderProps) {
    const range = formatDateRange(sprint.startDate, sprint.endDate)
    const meta = sprint.endDate ? `${range} · ${daysLeftLabel(sprint.endDate)}` : range

    return (
        <section aria-labelledby="sprint-heading" className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 id="sprint-heading" className="font-display text-lg font-bold tracking-tight">
                    {sprint.name}
                </h2>
                <p className="text-sm text-muted-foreground">{meta}</p>
            </div>
            {sprint.goal && (
                <p className="text-sm">
                <span className="text-muted-foreground">Goal:</span> {sprint.goal}
                </p>
            )}
            </div>

            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>

        <div className="mt-4">
            <SprintProgress totals={totals} />
        </div>
        </section>
    )
}