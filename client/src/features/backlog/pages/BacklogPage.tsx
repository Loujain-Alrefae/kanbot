import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useParams } from "react-router"
import { ErrorState } from "@/components/ErrorState"
import { PageHeader } from "@/components/layout/PageHeader"
import { SprintDialog } from "@/features/sprints/components/SprintDialog"
import { TodoDetailsDialog } from "@/features/todos/components/TodoDetailsDialog"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSprints } from "@/hooks/useSprints"
import { useAllTodos, useBacklogTodos } from "@/hooks/useTodos"
import { summarizeTodos } from "@/lib/todo"
import { cn } from "@/lib/utils"
import { TODO_STATUSES } from "@/types/api"
import type { Sprint, Todo } from "@/types/api"
import { BacklogSection, BacklogSectionSkeleton } from "../components/BacklogSection"
import { BacklogToolbar } from "../components/BacklogToolbar"
import { SprintSection } from "../components/SprintSection"
import { EMPTY_FILTERS, hasActiveFilters, toApiFilters } from "../filters"
import type { FilterState } from "../filters"
import { StartSprintDialog } from "@/features/sprints/components/StartSprintDialog"

export function BacklogPage() {
    const { projectId } = useParams()
    if (!projectId) return null // the route always has :projectId; this only narrows the type

  // key = projectId: switching projects remounts the view, so search, filters and dialogs start clean.
    return <BacklogView key={projectId} projectId={projectId} />
}

function BacklogView({ projectId }: { projectId: string }) {
    const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null)
    // { sprint: null } = creating, { sprint } = editing, null = closed.
    const [sprintDialog, setSprintDialog] = useState<{ sprint: Sprint | null } | null>(null)
    const [startingSprint, setStartingSprint] = useState<Sprint | null>(null)

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

    const plannedSprints = useMemo(() => (sprints.data ?? []).filter((s) => s.status === "planned"), [sprints.data])
    const activeSprint = useMemo(() => (sprints.data ?? []).find((s) => s.status === "active"), [sprints.data])
    // Sprints a todo can be moved into (BL-7): planned and active. A completed sprint would answer 409.
    const moveTargets = useMemo(() => (sprints.data ?? []).filter((s) => s.status !== "completed"), [sprints.data])

    // Header totals = backlog + planned sprints (the wireframe's 18 todos · 42 pts), never filtered.
    const planningTodos = useMemo(() => {
        if (!allTodos.data || !sprints.data) return null
        const plannedIds = new Set(plannedSprints.map((s) => s.id))
        return allTodos.data.filter((t) => t.sprintId === null || plannedIds.has(t.sprintId))
    }, [allTodos.data, sprints.data, plannedSprints])

    // Todos grouped by sprint, in board order (status column, then `order`).
    const todosBySprint = useMemo(() => {
        const groups = new Map<string, Todo[]>()
        for (const todo of allTodos.data ?? []) {
        if (todo.sprintId === null) continue
        const list = groups.get(todo.sprintId) ?? []
        list.push(todo)
        groups.set(todo.sprintId, list)
        }
        for (const list of groups.values()) {
        list.sort((a, b) => TODO_STATUSES.indexOf(a.status) - TODO_STATUSES.indexOf(b.status) || a.order - b.order)
        }
        return groups
    }, [allTodos.data])

    function updateFilters(patch: Partial<FilterState>) {
        setFilters((current) => ({ ...current, ...patch }))
    }

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
            moveTargets={moveTargets}
            onOpenTodo={handleOpenTodo}
            filtersActive={filtersActive}
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
        />
        )
    }

    // Planned-sprint sections sit above the backlog. Nothing is shown while they load (most projects have none),
    // and a failure here must not hide the backlog below, so it gets its own ErrorState.
    let sprintSections: ReactNode = null
    const sprintsError = sprints.error ?? allTodos.error
    if (sprintsError) {
        sprintSections = (
        <ErrorState
            message={sprintsError.message}
            onRetry={() => {
            void sprints.refetch()
            void allTodos.refetch()
            }}
        />
        )
    } else if (sprints.data && allTodos.data) {
        sprintSections = plannedSprints.map((sprint) => (
        <SprintSection
            key={sprint.id}
            sprint={sprint}
            todos={todosBySprint.get(sprint.id) ?? []}
            moveTargets={moveTargets}
            activeSprint={activeSprint}
            onOpenTodo={handleOpenTodo}
            onEdit={(target) => setSprintDialog({ sprint: target })}
            onStart={setStartingSprint}
        />
        ))
    }

    return (
        <>
        <PageHeader title="Backlog" meta={planningTodos ? summarizeTodos(planningTodos) : undefined} />
        <div className="space-y-4 p-6">
            {/* Outside the loading switch: the search box must keep its focus while results reload. */}
            <BacklogToolbar
            filters={filters}
            onChange={updateFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
            onCreateSprint={() => setSprintDialog({ sprint: null })}
            />

            {sprintSections}

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
        {sprintDialog && (
            <SprintDialog projectId={projectId} sprint={sprintDialog.sprint} onClose={() => setSprintDialog(null)} />
        )}
        {startingSprint && (
            <StartSprintDialog
                projectId={projectId}
                sprint={startingSprint}
                activeSprint={activeSprint}
                onClose={() => setStartingSprint(null)}
            />
            )}
        </>
    )
}