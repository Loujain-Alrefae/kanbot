import { DueDateBadge } from "@/features/todos/components/DueDateBadge"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import type { Todo } from "@/types/api"

/* The copy of a card that follows the pointer while dragging. Not interactive, and hidden from screen readers. */
export function TodoCardPreview({ todo }: { todo: Todo }) {
    return (
        <div
        aria-hidden="true"
        className="rotate-2 cursor-grabbing rounded-xl border bg-card px-3 py-2.5 text-card-foreground shadow-lg ring-1 ring-ring motion-reduce:rotate-0"
        >
        <div className="flex min-h-7 items-center">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">{todo.key}</span>
        </div>
        <p className="mt-0.5 text-sm font-medium wrap-break-word">{todo.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TypeIcon type={todo.type} />
            <PriorityBadge priority={todo.priority} />
            <DueDateBadge todo={todo} />
            <PointsPill points={todo.storyPoints} className="ml-auto min-w-0 rounded-lg border bg-transparent px-1.5 font-semibold" />
        </div>
        </div>
    )
}