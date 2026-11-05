import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import { cn } from "@/lib/utils"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCardMenu } from "./TodoCardMenu"
import { DueDateBadge } from "@/features/todos/components/DueDateBadge"

interface TodoCardProps {
    todo: Todo
    onOpen: (todo: Todo) => void
    onMove: (todo: Todo, status: TodoStatus) => void
}

/*
 * Same technique as the backlog row: the title is the only focusable control and its ::after stretches over
 * the whole card, so a click anywhere opens the todo. The menu is a SIBLING of that button with
 * `relative z-10`, so it sits above the stretched area and its clicks never open the details.
 *
 * Dragging: the pointer listeners are on the whole card, so you can grab it anywhere. Only the pointer
 * listeners are used (not `attributes`), so the card itself is not a tab stop: keyboard users move cards with the menu.
 */
export function TodoCard({ todo, onOpen, onMove }: TodoCardProps) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: todo.id })

    return (
        <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...listeners}
        className={cn(
            "relative cursor-grab rounded-lg border bg-card p-3 text-card-foreground shadow-xs transition-colors hover:bg-accent focus-within:bg-accent motion-reduce:transition-none!",
            // While it is being dragged the real card stays in the column as a dashed placeholder (the overlay is the moving copy).
            isDragging && "border-dashed bg-transparent shadow-none hover:bg-transparent focus-within:bg-transparent *:invisible",
        )}
        >
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
            <DueDateBadge todo={todo} />
            <PointsPill points={todo.storyPoints} className="ml-auto" />
        </div>
        </li>
    )
}