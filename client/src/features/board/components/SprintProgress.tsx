import type { BoardTotals } from "@/lib/board"

interface SprintProgressProps {
    totals: BoardTotals
}

/*
 * The bar follows story points ("21 / 34 pts done"). A sprint with no estimates at all would always show 0%,
 * so it falls back to todos. The text never depends on color (NFR-5), and the numbers come from the
 * columns, so an optimistic move updates them instantly.
 */
export function SprintProgress({ totals }: SprintProgressProps) {
    const { donePoints, totalPoints, doneTodos, totalTodos } = totals
    const fraction = totalPoints > 0 ? donePoints / totalPoints : totalTodos > 0 ? doneTodos / totalTodos : 0
    const percent = Math.round(fraction * 100)
    const pointsText = `${donePoints} / ${totalPoints} pts done`
    const todosText = `${doneTodos} / ${totalTodos} todos done`

    return (
        <div>
        <div
            role="progressbar"
            aria-label="Sprint progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${pointsText}, ${todosText}`}
            className="h-2 overflow-hidden rounded-full bg-secondary"
        >
            <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
            />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{pointsText}</span> · {todosText}
        </p>
        </div>
    )
}