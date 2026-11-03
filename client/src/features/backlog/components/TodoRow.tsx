import { LabelChips } from "@/features/todos/components/LabelChips"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import type { Sprint, Todo } from "@/types/api"
import { TodoRowMenu } from "./TodoRowMenu"

interface TodoRowProps {
    todo: Todo
    /** Planned and active sprints, for the "Move to…" items of the row menu. */
    moveTargets: Sprint[]
    onOpen: (todo: Todo) => void
}

/*
 * One backlog row. The title is the only focusable control and its ::after stretches over the whole row,
 * so a click anywhere opens the todo. The "···" menu is a SIBLING of that button with `relative z-10`,
 * so it sits above the stretched area and its clicks never open the details.
 */
export function TodoRow({ todo, moveTargets, onOpen }: TodoRowProps) {
    return (
        <li className="relative flex items-center gap-3 border-b px-4 py-2 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent">
        <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">{todo.key}</span>

        <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
            type="button"
            onClick={() => onOpen(todo)}
            className="min-w-0 truncate text-left text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            >
            {todo.title}
            </button>
            <LabelChips labels={todo.labels} max={2} className="shrink-0" />
        </div>

        <div className="w-20 shrink-0">
            <TypeIcon type={todo.type} />
        </div>
        <div className="w-24 shrink-0">
            <PriorityBadge priority={todo.priority} />
        </div>
        <PointsPill points={todo.storyPoints} className="shrink-0" />

        <div className="relative z-10 w-8 shrink-0">
            <TodoRowMenu todo={todo} moveTargets={moveTargets} />
        </div>
        </li>
    )
}