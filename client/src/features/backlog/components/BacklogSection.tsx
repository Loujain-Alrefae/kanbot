import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { summarizeTodos } from "@/lib/todo"
import type { Sprint,Todo } from "@/types/api"
import { QUICK_CREATE_INPUT_ID } from "../constants"
import { QuickCreate } from "./QuickCreate"
import { TodoRow } from "./TodoRow"

interface BacklogSectionProps {
    projectId: string
    todos: Todo[]
    /** Planned and active sprints: targets of the row menu's "Move to…". */
    moveTargets: Sprint[]
    onOpenTodo: (todo: Todo) => void
    /** true when a search or filter is applied: an empty list then means "no match", not "empty backlog". */
    filtersActive: boolean
    onClearFilters: () => void
}

export function BacklogSection({ projectId, todos, moveTargets, onOpenTodo, filtersActive, onClearFilters}: BacklogSectionProps)  {
    return (
        <section
        aria-labelledby="backlog-heading"
        className="overflow-hidden rounded-lg border bg-card text-card-foreground"
        >
        <header className="flex items-center gap-3 border-b bg-muted px-4 py-3">
            <h2 id="backlog-heading" className="text-sm font-semibold">
            Backlog
            </h2>
            <span className="text-xs text-muted-foreground">{summarizeTodos(todos)}</span>
        </header>

        {todos.length === 0 ? (
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
            <ul>
            {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} moveTargets={moveTargets} onOpen={onOpenTodo} />            ))}
            </ul>
        )}

        {/* Always rendered, even with an empty list: the empty-state button above focuses this field. */}
        <QuickCreate projectId={projectId} filtersActive={filtersActive} />
        </section>
    )
}

export function BacklogSectionSkeleton() {
    return (
        <div aria-busy="true" className="overflow-hidden rounded-lg border bg-card">
        <span className="sr-only">Loading backlog…</span>
        <div className="border-b bg-muted px-4 py-3">
            <Skeleton className="h-4 w-40 bg-border" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-14 bg-secondary" />
            <Skeleton className="h-4 flex-1 bg-secondary" />
            <Skeleton className="h-5 w-16 bg-secondary" />
            <Skeleton className="h-5 w-20 bg-secondary" />
            <Skeleton className="h-5 w-12 bg-secondary" />
            </div>
        ))}
        </div>
    )
}