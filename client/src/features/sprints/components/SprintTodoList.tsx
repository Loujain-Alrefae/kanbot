import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import { STATUS_LABELS } from "@/lib/todo"
import type { Todo } from "@/types/api"

interface SprintTodoListProps {
    todos: Todo[]
    onOpen: (todo: Todo) => void
}

export function SprintTodoList({ todos, onOpen }: SprintTodoListProps) {
    return (
        <ul className="@container divide-y overflow-hidden rounded-lg border bg-card">
        {todos.map((todo) => (
            <li
            key={todo.id}
            className="relative flex flex-col gap-1.5 px-3 py-2.5 transition-colors hover:bg-accent focus-within:bg-accent motion-reduce:transition-none @2xl:flex-row @2xl:items-center @2xl:gap-3 @2xl:px-4 @2xl:py-2"
            >
            {/* Narrow: key on the left, status on the right. Wide: only the key (the status comes later, see below). */}
            <div className="flex items-center justify-between gap-2 @2xl:contents">
                <span className="text-xs tabular-nums text-muted-foreground @2xl:w-16 @2xl:shrink-0">{todo.key}</span>
                <span className="text-xs text-muted-foreground @2xl:hidden">{STATUS_LABELS[todo.status]}</span>
            </div>

            <button
                type="button"
                onClick={() => onOpen(todo)}
                className="min-w-0 text-left text-sm font-medium wrap-break-word outline-none after:absolute after:inset-0 after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring @2xl:flex-1 @2xl:truncate"
            >
                {todo.title}
            </button>

            <div className="flex flex-wrap items-center gap-2 @2xl:contents">
                <div className="@2xl:w-20 @2xl:shrink-0">
                <TypeIcon type={todo.type} />
                </div>
                <div className="@2xl:w-24 @2xl:shrink-0">
                <PriorityBadge priority={todo.priority} />
                </div>
                {/* Wide layout only: the status as a column. (The narrow layout shows it on the first line.) */}
                <span className="hidden text-xs text-muted-foreground @2xl:block @2xl:w-24 @2xl:shrink-0">
                {STATUS_LABELS[todo.status]}
                </span>
                <PointsPill points={todo.storyPoints} className="ml-auto shrink-0 @2xl:ml-0" />
            </div>
            </li>
        ))}
        </ul>
    )
}