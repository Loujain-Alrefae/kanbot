import { useState } from "react"
import type { ReactNode } from "react"
import { ErrorState } from "@/components/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { SprintSummary } from "@/features/ai/components/SprintSummary"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { useSprintBoard } from "@/hooks/useSprints"
import { formatDateRange } from "@/lib/format"
import { completionPercent, displayStats } from "@/lib/sprint"
import { TODO_STATUSES } from "@/types/api"
import type { Sprint } from "@/types/api"
import { SprintStatusBadge } from "./SprintStatusBadge"
import { SprintTodoList } from "./SprintTodoList"
import { StatTile } from "./StatTile"

interface SprintDetailsProps {
    sprint: Sprint
    autoSummary?: boolean
}

export function SprintDetails({ sprint, autoSummary = false }: SprintDetailsProps) {
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
    const stats = displayStats(sprint)

    const board = useSprintBoard(sprint.id)

    const carried = stats.carriedOver === null ? "n/a" : `${stats.carriedOver} ${stats.carriedOver === 1 ? "todo" : "todos"}`

    let todosContent: ReactNode
    if (board.isError) {
        todosContent = <ErrorState message={board.error.message} onRetry={() => board.refetch()} />
    } else if (board.isPending) {
        todosContent = (
        <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-secondary" />
            ))}
        </div>
        )
    } else {
        const todos = TODO_STATUSES.flatMap((status) => board.data.columns[status])
        todosContent =
        todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">This sprint has no todos.</p>
        ) : (
            <SprintTodoList todos={todos} onOpen={(todo) => setSelectedTodoId(todo.id)} />
        )
    }

    return (
        <section
        aria-labelledby="sprint-details-heading"
        className="@container min-w-0 space-y-5 rounded-lg border bg-card p-4 sm:p-5"
        >
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="sprint-details-heading" className="text-xl font-semibold wrap-break-word">
                {sprint.name}
            </h2>
            <SprintStatusBadge status={sprint.status} />
            </div>
            <p className="text-sm text-muted-foreground wrap-break-word">
            {formatDateRange(sprint.startDate, sprint.endDate)}
            {sprint.goal ? ` · Goal: ${sprint.goal}` : ""}
            </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 @xl:grid-cols-4">
            <StatTile label="Completed todos" value={`${stats.doneTodos} / ${stats.totalTodos}`} />
            <StatTile label="Points done" value={`${stats.donePoints} / ${stats.totalPoints}`} />
            <StatTile label="Carried over" value={carried} />
            <StatTile label="Completion %" value={`${completionPercent(stats)}%`} />
        </dl>

        <SprintSummary sprint={sprint} autoGenerate={autoSummary} />

        <div className="space-y-2">
            <h3 className="text-sm font-medium">Todos</h3>
            {todosContent}
        </div>

        {selectedTodoId && (
            <TodoDetailsDialog
            projectId={sprint.projectId}
            todoId={selectedTodoId}
            onClose={() => setSelectedTodoId(null)}
            />
        )}
        </section>
    )
}