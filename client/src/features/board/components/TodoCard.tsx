import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCardMenu } from "./TodoCardMenu"

interface TodoCardProps {
    todo: Todo
    onOpen: (todo: Todo) => void
    onMove: (todo: Todo, status: TodoStatus) => void
}

/*
 * Same technique as the backlog row: the title is the only focusable control and its ::after stretches over
 * the whole card, so a click anywhere opens the todo. The menu is a SIBLING of that button with
 * `relative z-10`, so it sits above the stretched area and its clicks never open the details.
 */
export function TodoCard({ todo, onOpen, onMove }: TodoCardProps) {
    return (
        <li className="relative rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-colors hover:bg-accent focus-within:bg-accent">
        <div className="mb-1 flex min-h-7 items-center justify-between gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">{todo.key}</span>
            <div className="relative z-10">
            <TodoCardMenu todo={todo} onMove={onMove} />
            </div>
        </div>

        <button
            type="button"
            onClick={() => onOpen(todo)}
            className="block w-full text-left text-sm font-medium wrap-break-word outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
        >
            {todo.title}
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2">
            <TypeIcon type={todo.type} />
            <PriorityBadge priority={todo.priority} />
            <PointsPill points={todo.storyPoints} className="ml-auto" />
        </div>
        </li>
    )
}