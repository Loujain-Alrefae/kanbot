import { useParams } from "react-router"
import { PageHeader } from "@/components/layout/PageHeader"
import { useActiveSprint, useSprintBoard } from "@/hooks/useSprints"
import { boardTotals, locateInColumns, moveInColumns } from "@/lib/board"
import { addDaysISO, daysLeftLabel, todayISO } from "@/lib/format"
import { TODO_STATUSES } from "@/types/api"

export function BoardPage() {
  const { projectId } = useParams()
  const active = useActiveSprint(projectId)
  const board = useSprintBoard(active.data?.id)

  let report: Record<string, unknown> = {
    activeSprint: active.isPending ? "loading…" : (active.data?.name ?? null),
    errors: [active.error?.message, board.error?.message].filter(Boolean),
  }

  if (board.data) {
    const { sprint, columns } = board.data
    const first = TODO_STATUSES.flatMap((status) => columns[status])[0]
    const moved = first ? moveInColumns(columns, first.id, "done", 0) : columns

    report = {
      ...report,
      sprint: `${sprint.name} (${sprint.status})`,
      daysLeft: daysLeftLabel(sprint.endDate),
      counts: Object.fromEntries(TODO_STATUSES.map((s) => [s, columns[s].length])),
      totals: boardTotals(columns),
      serverStats: { donePoints: sprint.stats.donePoints, totalPoints: sprint.stats.totalPoints },
      moveDemo: first
        ? {
            todo: first.key,
            before: locateInColumns(columns, first.id),
            after: locateInColumns(moved, first.id),
            doneOrdersAfter: moved.done.map((t) => t.order),
            inputUntouched: columns.done.length === boardTotals(columns).doneTodos,
          }
        : "no todos on the board",
    }
  }

  report = {
    ...report,
    daysLeftChecks: {
      today: daysLeftLabel(todayISO()),
      tomorrow: daysLeftLabel(addDaysISO(todayISO(), 1)),
      inSix: daysLeftLabel(addDaysISO(todayISO(), 6)),
      twoDaysAgo: daysLeftLabel(addDaysISO(todayISO(), -2)),
      none: daysLeftLabel(null),
    },
  }

  return (
    <>
      <PageHeader title="Active Sprint" />
      <pre className="p-6 text-sm">{JSON.stringify(report, null, 2)}</pre>
    </>
  )
}