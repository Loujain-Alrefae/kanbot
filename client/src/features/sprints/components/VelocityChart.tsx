import { averageVelocity, velocityPoints } from "@/lib/velocity"
import type { Sprint } from "@/types/api"

/*
 * Points done per completed sprint, drawn with plain divs. Not by color alone: every bar has its number
 * above it, "done/planned" under its name, and the average is written as text (the dashed line only repeats it).
 */
export function VelocityChart({ sprints }: { sprints: Sprint[] }) {
    const points = velocityPoints(sprints)
    const average = averageVelocity(points)
    const scale = Math.max(1, ...points.map((point) => Math.max(point.totalPoints, point.donePoints)))

    const summary = points
        .map((point) => `${point.name}: ${point.donePoints} of ${point.totalPoints} points`)
        .join("; ")

    return (
        <section aria-labelledby="velocity-heading" className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="velocity-heading" className="text-sm font-semibold">
            Velocity
            </h2>
            {points.length > 0 && <p className="text-sm text-muted-foreground tabular-nums">Average: {average} pts</p>}
        </div>

        {points.length === 0 ? (
            <p className="text-sm text-muted-foreground">
            No completed sprints yet. Complete a sprint to see how many points you finish per sprint.
            </p>
        ) : (
            <>
            <div
                role="img"
                aria-label={`Velocity per sprint. ${summary}. Average ${average} points.`}
                className="overflow-x-auto"
            >
                <div className="min-w-80 space-y-2" aria-hidden="true">
                <div className="relative h-44 pt-6">
                    {/* The average line spans the plot area (same box the bars use). */}
                    <div className="pointer-events-none absolute inset-x-0 top-6 bottom-0">
                    <div
                        className="absolute inset-x-0 border-t-2 border-dashed border-foreground/50"
                        style={{ bottom: `${(average / scale) * 100}%` }}
                    />
                    </div>

                    <div className="flex h-full items-end gap-3">
                    {points.map((point) => {
                        const trackHeight = Math.max(2, (point.totalPoints / scale) * 100)
                        const fill = point.totalPoints > 0 ? Math.min(100, (point.donePoints / point.totalPoints) * 100) : 0
                        return (
                        <div key={point.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                            <span className="text-xs font-semibold tabular-nums">{point.donePoints}</span>
                            <div
                            className="flex w-full max-w-14 flex-col justify-end overflow-hidden rounded-md border bg-secondary"
                            style={{ height: `${trackHeight}%` }}
                            >
                            <div className="w-full bg-primary" style={{ height: `${fill}%` }} />
                            </div>
                        </div>
                        )
                    })}
                    </div>
                </div>

                <div className="flex gap-3">
                    {points.map((point) => (
                    <div key={point.id} className="min-w-0 flex-1 text-center text-xs">
                        <p className="truncate font-medium">{point.name}</p>
                        <p className="text-muted-foreground tabular-nums">
                        {point.donePoints}/{point.totalPoints}
                        </p>
                    </div>
                    ))}
                </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                Filled part = points done, full bar = points planned. Dashed line = average.
            </p>
            </>
        )}
        </section>
    )
    }