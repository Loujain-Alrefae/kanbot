import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { STATUS_LABELS } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCard } from "./TodoCard"

// Full class names on purpose: Tailwind only generates classes it can read in the source.
const LANE_STYLES: Record<TodoStatus, { lane: string; dot: string; bar: string }> = {
    todo: {
        lane: "bg-lane-todo",
        dot: "bg-dot-todo",
        bar: "dark:shadow-[inset_0_3px_0_var(--dot-todo)]",
    },
    in_progress: {
        lane: "bg-lane-progress",
        dot: "bg-dot-progress",
        bar: "dark:shadow-[inset_0_3px_0_var(--dot-progress)]",
    },
    in_review: {
        lane: "bg-lane-review",
        dot: "bg-dot-review",
        bar: "dark:shadow-[inset_0_3px_0_var(--dot-review)]",
    },
    done: {
        lane: "bg-lane-done",
        dot: "bg-dot-done",
        bar: "dark:shadow-[inset_0_3px_0_var(--dot-done)]",
    },
}

interface BoardColumnProps {
    status: TodoStatus
    todos: Todo[]
    onOpenTodo: (todo: Todo) => void
    onMoveTodo: (todo: Todo, status: TodoStatus) => void
}

export function BoardColumn({ status, todos, onOpenTodo, onMoveTodo }: BoardColumnProps) {
    const headingId = `column-${status}-heading`
    const { lane, dot, bar } = LANE_STYLES[status]

    // The whole column is a drop target, so an empty column (or the space under the cards) accepts a card.
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <section
            ref={setNodeRef}
            aria-labelledby={headingId}
            className={cn(
                "flex min-h-64 flex-col rounded-[14px] p-2.5 transition-shadow",
                lane,
                bar,
                isOver && "ring-2 ring-primary/40",
            )}
        >
            <header className="mb-2.5 flex items-center gap-2 px-1 pt-0.5">
                {/* The dot only decorates: the column name is always written next to it. */}
                <span aria-hidden="true" className={cn("size-2.25 shrink-0 rounded-full", dot)} />
                <h3 id={headingId} className="text-sm font-semibold">
                    {STATUS_LABELS[status]}
                </h3>
                <span className="ml-auto text-sm font-medium tabular-nums">
                    {todos.length}
                    <span className="sr-only"> {todos.length === 1 ? "todo" : "todos"}</span>
                </span>
            </header>

            <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                {todos.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-foreground/25 px-3 py-6 text-center text-sm text-muted-foreground">
                        No todos
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {todos.map((todo) => (
                            <TodoCard key={todo.id} todo={todo} onOpen={onOpenTodo} onMove={onMoveTodo} />
                        ))}
                    </ul>
                )}
            </SortableContext>
        </section>
    )
}