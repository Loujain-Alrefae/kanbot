import type { CSSProperties, ReactNode, Ref } from "react"
import { DueDateBadge } from "@/features/todos/components/DueDateBadge"
import { LabelChips } from "@/features/todos/components/LabelChips"
import { PointsPill } from "@/features/todos/components/PointsPill"
import { PriorityBadge } from "@/features/todos/components/PriorityBadge"
import { TypeIcon } from "@/features/todos/components/TypeIcon"
import { cn } from "@/lib/utils"
import type { Sprint, Todo } from "@/types/api"
import { TodoRowMenu } from "./TodoRowMenu"

interface TodoRowProps {
    todo: Todo
    moveTargets: Sprint[]
    onOpen: (todo: Todo) => void
    handle?: ReactNode
    listPosition?: { index: number; count: number } | null
    onMoveToEdge?: (todo: Todo, edge: "top" | "bottom") => void
    rowRef?: Ref<HTMLLIElement>
    style?: CSSProperties
    dragging?: boolean
}


export function TodoRow({
    todo,
    moveTargets,
    onOpen,
    handle,
    listPosition,
    onMoveToEdge,
    rowRef,
    style,
    dragging = false,
    }: TodoRowProps) {
    return (
        <li
        ref={rowRef}
        style={style}
        className={cn(
            "relative flex items-start gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent motion-reduce:transition-none! @2xl:items-center @2xl:px-4 @2xl:py-2",
            dragging && "z-20 bg-card shadow-lg ring-1 ring-ring hover:bg-card focus-within:bg-card",
        )}
        >
        {handle ? (
            <div className="relative z-10 mt-0.5 w-7 shrink-0 @2xl:mt-0">{handle}</div>
        ) : (
            // Rows without a handle (sprint sections) keep the blank column only in the wide layout, so everything lines up.
            <div className="hidden w-7 shrink-0 @2xl:block" aria-hidden="true" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 @2xl:contents">
            <span className="text-xs tabular-nums text-muted-foreground @2xl:w-16 @2xl:shrink-0">{todo.key}</span>

            <div className="flex min-w-0 items-center gap-2 @2xl:flex-1">
            <button
                type="button"
                onClick={() => onOpen(todo)}
                className="min-w-0 text-left text-sm font-medium wrap-break-word whitespace-normal outline-none after:absolute after:inset-0 after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring @2xl:truncate"
            >
                {todo.title}
            </button>

            {/* Wide layout: labels and due date sit right after the title. */}
            <div className="hidden shrink-0 items-center gap-2 @2xl:flex">
                <LabelChips labels={todo.labels} max={2} className="shrink-0" />
                <DueDateBadge todo={todo} className="shrink-0" />
            </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 @2xl:contents">
            <div className="@2xl:w-20 @2xl:shrink-0">
                <TypeIcon type={todo.type} />
            </div>
            <div className="@2xl:w-24 @2xl:shrink-0">
                <PriorityBadge priority={todo.priority} />
            </div>
            <PointsPill points={todo.storyPoints} className="shrink-0" />

            {/* Narrow layout: labels and due date join the chips under the title. */}
            <div className="contents @2xl:hidden">
                <LabelChips labels={todo.labels} max={2} />
                <DueDateBadge todo={todo} />
            </div>
            </div>
        </div>

        <div className="relative z-10 -mt-1 w-8 shrink-0 @2xl:mt-0">
            <TodoRowMenu todo={todo} moveTargets={moveTargets} listPosition={listPosition} onMoveToEdge={onMoveToEdge} />
        </div>
        </li>
    )
}