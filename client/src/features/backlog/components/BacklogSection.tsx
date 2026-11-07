import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { summarizeTodos } from "@/lib/todo"
import type { Sprint, Todo } from "@/types/api"
import { QUICK_CREATE_INPUT_ID } from "../constants"
import { useBacklogReorder } from "../hooks/useBacklogReorder"
import { QuickCreate } from "./QuickCreate"
import { SortableTodoRow } from "./SortableTodoRow"

interface BacklogSectionProps {
    projectId: string
    todos: Todo[]
    moveTargets: Sprint[]
    onOpenTodo: (todo: Todo) => void
    filtersActive: boolean
    onClearFilters: () => void
}

export function BacklogSection({
    projectId,
    todos,
    moveTargets,
    onOpenTodo,
    filtersActive,
    onClearFilters,
    }: BacklogSectionProps) {
    const dnd = useBacklogReorder({ projectId, todos })
    const rows = dnd.todos // the cache, or the new order for the instant after a drop

    return (
        // @container: the rows and the quick-create field choose their layout from THIS section's width.
        <section
        aria-labelledby="backlog-heading"
        className="@container overflow-hidden rounded-lg  bg-card text-card-foreground"
        >
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-list-head px-3 py-3 @2xl:px-4">
            <h2 id="backlog-heading" className="font-display text-[15px] font-bold">
            Backlog
            </h2>
            <span className="text-[13px] text-muted-foreground">{summarizeTodos(rows)}</span>
        </header>

        {/* A filtered list is not the real order, so reordering is off. Say why, and offer the way out (BL-6). */}
        {filtersActive && rows.length > 1 && (
            <p className="border-b bg-muted/50 px-3 py-2 text-xs text-muted-foreground @2xl:px-4">
            Reordering is off while search or filters are active.{" "}
            <button
                type="button"
                onClick={onClearFilters}
                className="rounded-sm font-medium text-foreground underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                Clear filters to reorder
            </button>
            </p>
        )}

        {rows.length === 0 ? (
            filtersActive ? (
            <EmptyState
                title="No todos match your filters"
                description="Try a different search, or clear the filters."
                action={
                <Button variant="outline" onClick={onClearFilters}>
                    Clear filters
                </Button>
                }
            />
            ) : (
            <EmptyState
                title="Your backlog is empty"
                description="Add your first todo to start planning."
                action={
                <Button onClick={() => document.getElementById(QUICK_CREATE_INPUT_ID)?.focus()}>Create todo</Button>
                }
            />
            )
        ) : (
            <DndContext {...dnd.contextProps}>
            <SortableContext items={rows.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                <ul>
                {rows.map((todo, index) => (
                    <SortableTodoRow
                    key={todo.id}
                    todo={todo}
                    moveTargets={moveTargets}
                    onOpen={onOpenTodo}
                    dragDisabled={filtersActive}
                    listPosition={filtersActive ? null : { index, count: rows.length }}
                    onMoveToEdge={dnd.moveToEdge}
                    />
                ))}
                </ul>
            </SortableContext>
            </DndContext>
        )}

        {/* Always rendered, even with an empty list: the empty-state button above focuses this field. */}
        <QuickCreate projectId={projectId} filtersActive={filtersActive} />
        </section>
    )
}

export function BacklogSectionSkeleton() {
    return (
        <div aria-busy="true" className="@container overflow-hidden rounded-lg border bg-card">
        <span className="sr-only">Loading backlog…</span>
        <div className="border-b bg-list-head px-3 py-3 @2xl:px-4">
            <Skeleton className="h-4 w-40 bg-border" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 border-b px-3 py-3 last:border-b-0 @2xl:px-4">
            <Skeleton className="size-7 shrink-0 bg-secondary" />
            <Skeleton className="h-4 w-14 shrink-0 bg-secondary" />
            <Skeleton className="h-4 min-w-0 flex-1 bg-secondary" />
            {/* The chip columns only exist in the wide layout. */}
            <Skeleton className="hidden h-5 w-16 shrink-0 bg-secondary @2xl:block" />
            <Skeleton className="hidden h-5 w-20 shrink-0 bg-secondary @2xl:block" />
            <Skeleton className="hidden h-5 w-12 shrink-0 bg-secondary @2xl:block" />
            </div>
        ))}
        </div>
    )
}