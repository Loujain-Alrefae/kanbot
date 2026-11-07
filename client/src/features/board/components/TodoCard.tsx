import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DueDateBadge } from "@/features/todos/components/DueDateBadge"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import { cn } from "@/lib/utils"
import type { Todo, TodoStatus } from "@/types/api"
import { TodoCardMenu } from "./TodoCardMenu"

interface TodoCardProps {
    todo: Todo
    onOpen: (todo: Todo) => void
    onMove: (todo: Todo, status: TodoStatus) => void
}

/*
 * The title is the only focusable control and its ::after stretches over the whole card, so a click anywhere
 * opens the todo. The menu is a SIBLING of that button with `relative z-10`.
 * Dragging: pointer listeners on the whole card; no `attributes`, so the card is not a tab stop
 * (keyboard users move cards with the menu).
 */
export function TodoCard({ todo, onOpen, onMove }: TodoCardProps) {
    const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: todo.id })

    return (
        <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...listeners}
        className={cn(
            "relative cursor-grab rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-xs transition-colors   motion-reduce:transition-none! hover:border-primary/50",
            // While it is being dragged the real card stays in the column as a dashed placeholder (the overlay is the moving copy).
            isDragging && "border-dashed bg-transparent shadow-none hover:bg-transparent focus-within:bg-transparent *:invisible",
        )}
        >
        <div className="flex min-h-7 items-center justify-between gap-2">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">{todo.key}</span>
            <div className="relative z-10">
            <TodoCardMenu todo={todo} onMove={onMove} />
            </div>
        </div>

        <button
            type="button"
            onClick={() => onOpen(todo)}
            className="mt-0.5 block w-full text-left text-sm font-medium wrap-break-word outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
        >
            {todo.title}
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TypeIcon type={todo.type} />
            <PriorityBadge priority={todo.priority} />
            <DueDateBadge todo={todo} />
            <PointsPill points={todo.storyPoints} className="ml-auto min-w-0 rounded-lg border bg-transparent px-1.5 font-semibold" />
        </div>
        </li>
    )
}