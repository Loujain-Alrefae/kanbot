import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import type { Todo } from "@/types/api"
import { DueDateBadge } from "@/features/todos/components/DueDateBadge"

/* The copy of a card that follows the pointer while dragging. Not interactive, and hidden from screen readers. */
export function TodoCardPreview({ todo }: { todo: Todo }) {
    return (
        <div
        aria-hidden="true"
        className="rotate-2 cursor-grabbing rounded-lg border bg-card p-3 text-card-foreground shadow-lg ring-1 ring-ring motion-reduce:rotate-0"
        >
        <div className="mb-1 flex min-h-7 items-center">
            <span className="text-xs tabular-nums text-muted-foreground">{todo.key}</span>
        </div>
        <p className="text-sm font-medium wrap-break-word">{todo.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
            <TypeIcon type={todo.type} />
            <PriorityBadge priority={todo.priority} />
            <DueDateBadge todo={todo} />
            <PointsPill points={todo.storyPoints} className="ml-auto" />
        </div>
        </div>
    )
}