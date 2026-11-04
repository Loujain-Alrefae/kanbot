import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { STATUS_LABELS } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCard } from "./TodoCard"

interface BoardColumnProps {
    status: TodoStatus
    todos: Todo[]
    onOpenTodo: (todo: Todo) => void
    onMoveTodo: (todo: Todo, status: TodoStatus) => void
}

export function BoardColumn({ status, todos, onOpenTodo, onMoveTodo }: BoardColumnProps) {
    const headingId = `column-${status}-heading`

    // The whole column is a drop target, so an empty column (or the space under the cards) accepts a card.
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <section
        ref={setNodeRef}
        aria-labelledby={headingId}
        className={cn("flex min-h-64 flex-col rounded-lg bg-muted p-3 transition-shadow", isOver && "ring-2 ring-primary/40")}
        >
        <header className="mb-3 flex items-center justify-between gap-2">
            <h3 id={headingId} className="text-sm font-semibold">
            {STATUS_LABELS[status]}
            </h3>
            <span className="rounded-full border bg-card px-2 py-0.5 text-xs font-medium tabular-nums">
            {todos.length}
            <span className="sr-only"> {todos.length === 1 ? "todo" : "todos"}</span>
            </span>
        </header>

        <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
            {todos.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
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