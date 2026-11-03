import { useMemo } from "react"
import type { ReactNode } from "react"
import { useParams } from "react-router"
import { toast } from "sonner"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { useSprints } from "@/hooks/useSprints"
import { useAllTodos, useBacklogTodos } from "@/hooks/useTodos"
import { summarizeTodos } from "@/lib/todo"
import type { Todo } from "@/types/api"
import { BacklogSection, BacklogSectionSkeleton } from "../components/BacklogSection"

export function BacklogPage() {
    const { projectId } = useParams()

    // Three independent queries: they all start together (no waterfall, NFR-6).
    const allTodos = useAllTodos(projectId)
    const backlog = useBacklogTodos(projectId, {})
    const sprints = useSprints(projectId)

    // Header totals = backlog + planned sprints (the wireframe's 18 todos · 42 pts).
    // Active and completed sprints are not "planning work".
    const planningTodos = useMemo(() => {
        if (!allTodos.data || !sprints.data) return null
        const plannedIds = new Set(sprints.data.filter((s) => s.status === "planned").map((s) => s.id))
        return allTodos.data.filter((t) => t.sprintId === null || plannedIds.has(t.sprintId))
    }, [allTodos.data, sprints.data])

  // TODO (Step 6): open TodoDetailsDialog instead of this temporary toast.
    function handleOpenTodo(todo: Todo) {
        toast.info(`Details for ${todo.key} arrive in Step 6`)
    }

    // Order matters: check the error BEFORE the data, so stale cached data is never shown after a failure.
    let content: ReactNode
    if (backlog.isPending) {
        content = <BacklogSectionSkeleton />
    } else if (backlog.isError) {
        content = <ErrorState message={backlog.error.message} onRetry={() => backlog.refetch()} />
    } else {
        content = <BacklogSection todos={backlog.data} onOpenTodo={handleOpenTodo} />
    }

    return (
        <>
        <PageHeader title="Backlog" meta={planningTodos ? summarizeTodos(planningTodos) : undefined} />
        <div className="space-y-6 p-6">{content}</div>
        </>
    )
}