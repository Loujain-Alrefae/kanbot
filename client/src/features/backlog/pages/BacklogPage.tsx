import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useParams } from "react-router"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSprints } from "@/hooks/useSprints"
import { useAllTodos, useBacklogTodos } from "@/hooks/useTodos"
import { summarizeTodos } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Todo } from "@/types/api"
import { BacklogSection, BacklogSectionSkeleton } from "../components/BacklogSection"
import { BacklogToolbar } from "../components/BacklogToolbar"
import { EMPTY_FILTERS, hasActiveFilters, toApiFilters } from "../filters"
import type { FilterState } from "../filters"

export function BacklogPage() {
    const { projectId } = useParams()
    if (!projectId) return null // the route always has :projectId; this only narrows the type

  // key = projectId: switching projects remounts the view, so search, filters and dialogs start clean.
    return <BacklogView key={projectId} projectId={projectId} />
}

function BacklogView({ projectId }: { projectId: string }) {
    const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)

  // The input updates instantly; the request only follows 300ms after the last keystroke (NFR-6).
    const debouncedSearch = useDebouncedValue(filters.search, 300)
    const apiFilters = useMemo(
        () => toApiFilters({ search: debouncedSearch, priority: filters.priority, type: filters.type }),
        [debouncedSearch, filters.priority, filters.type],
    )
    const filtersActive = hasActiveFilters({ ...filters, search: debouncedSearch })

  // Day 4 (drag and drop): disable reordering while `filtersActive` is true, because a filtered list is not
  // the real order, and show the reason ("Clear filters to reorder").

  // Three independent queries: they all start together (no waterfall, NFR-6).
    const allTodos = useAllTodos(projectId)
    const backlog = useBacklogTodos(projectId, apiFilters)
    const sprints = useSprints(projectId)

  // Header totals = backlog + planned sprints (the wireframe's 18 todos · 42 pts), never filtered.
    const planningTodos = useMemo(() => {
        if (!allTodos.data || !sprints.data) return null
        const plannedIds = new Set(sprints.data.filter((s) => s.status === "planned").map((s) => s.id))
        return allTodos.data.filter((t) => t.sprintId === null || plannedIds.has(t.sprintId))
    }, [allTodos.data, sprints.data])

    function updateFilters(patch: Partial<FilterState>) {
        setFilters((current) => ({ ...current, ...patch }))
    }

  // TODO (Step 6): open TodoDetailsDialog instead of this temporary toast.
    function handleOpenTodo(todo: Todo) {
        setSelectedTodoId(todo.id)
    }

  // Order matters: check the error BEFORE the data, so stale cached data is never shown after a failure.
    let content: ReactNode
    if (backlog.isPending) {
        content = <BacklogSectionSkeleton />
    } else if (backlog.isError) {
        content = <ErrorState message={backlog.error.message} onRetry={() => backlog.refetch()} />
    } else {
        content = (
        <BacklogSection
            projectId={projectId}
            todos={backlog.data}
            onOpenTodo={handleOpenTodo}
            filtersActive={filtersActive}
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
        />
        )
    }

    return (
        <>
            <PageHeader title="Backlog" meta={planningTodos ? summarizeTodos(planningTodos) : undefined} />
            <div className="space-y-4 p-6">
                {/* Outside the loading switch: the search box must keep its focus while results reload. */}
                <BacklogToolbar filters={filters} onChange={updateFilters} onClear={() => setFilters(EMPTY_FILTERS)} />

                {/* While a new search loads, the previous list stays visible but dimmed. */}
                <div
                aria-busy={backlog.isPlaceholderData}
                className={cn("transition-opacity", backlog.isPlaceholderData && "opacity-60")}
                >
                {content}
                </div>
            </div>
            {selectedTodoId && (
                <TodoDetailsDialog projectId={projectId} todoId={selectedTodoId} onClose={() => setSelectedTodoId(null)} />
            )}
        </>
    )
}