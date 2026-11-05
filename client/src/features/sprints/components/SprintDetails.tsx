import { useState } from "react"
import { ErrorState } from "@/components/ErrorState"
import { Skeleton } from "@/components/ui/skeleton"
import { SprintSummary } from "@/features/ai/components/SprintSummary"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import { useSprintBoard } from "@/hooks/useSprints"
import { formatDateRange } from "@/lib/format"
import { completionPercent, displayStats } from "@/lib/sprint"
import { STATUS_LABELS } from "@/lib/todo"
import { TODO_STATUSES } from "@/types/api"
import type { Sprint } from "@/types/api"
import { SprintStatusBadge } from "./SprintStatusBadge"
import { StatTile } from "./StatTile"

interface SprintDetailsProps {
    sprint: Sprint
    /** true right after completing a sprint with "Generate AI summary" ticked. */
    autoSummary?: boolean
}

export function SprintDetails({ sprint, autoSummary = false }: SprintDetailsProps) {
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
    const stats = displayStats(sprint)

    const board = useSprintBoard(sprint.id)

    const carried =
        stats.carriedOver === null ? "n/a" : `${stats.carriedOver} ${stats.carriedOver === 1 ? "todo" : "todos"}`

    let todosContent
    if (board.isError) {
        todosContent = <ErrorState message={board.error.message} onRetry={() => board.refetch()} />
    } else if (board.isPending) {
        todosContent = (
        <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-secondary" />
            ))}
        </div>
        )
    } else {
        const todos = TODO_STATUSES.flatMap((status) => board.data.columns[status])
        todosContent =
        todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">This sprint has no todos.</p>
        ) : (
            <ul className="divide-y rounded-lg border bg-card">
            {todos.map((todo) => (
                <li key={todo.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{todo.key}</span>
                <button
                    type="button"
                    onClick={() => setSelectedTodoId(todo.id)}
                    className="min-w-0 flex-1 truncate text-left text-sm hover:underline"
                >
                    {todo.title}
                </button>
                <TypeIcon type={todo.type} />
                <PriorityBadge priority={todo.priority} />
                <span className="text-xs text-muted-foreground">{STATUS_LABELS[todo.status]}</span>
                <PointsPill points={todo.storyPoints} />
                </li>
            ))}
            </ul>
        )
    }

    return (
        <section aria-labelledby="sprint-details-heading" className="space-y-5 rounded-lg border bg-card p-5">
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
            <h2 id="sprint-details-heading" className="text-xl font-semibold">
                {sprint.name}
            </h2>
            <SprintStatusBadge status={sprint.status} />
            </div>
            <p className="text-sm text-muted-foreground">
            {formatDateRange(sprint.startDate, sprint.endDate)}
            {sprint.goal ? ` · Goal: ${sprint.goal}` : ""}
            </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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