import { STATUS_LABELS } from "@/lib/todo"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCard } from "./TodoCard"

interface BoardColumnProps {
    status: TodoStatus
    todos: Todo[]
    onOpenTodo: (todo: Todo) => void
}

export function BoardColumn({ status, todos, onOpenTodo }: BoardColumnProps) {
    const headingId = `column-${status}-heading`

    return (
        <section aria-labelledby={headingId} className="flex min-h-64 flex-col rounded-lg bg-muted p-3">
        <header className="mb-3 flex items-center justify-between gap-2">
            <h3 id={headingId} className="text-sm font-semibold">
            {STATUS_LABELS[status]}
            </h3>
            <span className="rounded-full border bg-card px-2 py-0.5 text-xs font-medium tabular-nums">
            {todos.length}
            <span className="sr-only"> {todos.length === 1 ? "todo" : "todos"}</span>
            </span>
        </header>

        {todos.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            No todos
            </p>
        ) : (
            <ul className="space-y-2">
            {todos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} onOpen={onOpenTodo} />
            ))}
            </ul>
        )}
        </section>
    )
}