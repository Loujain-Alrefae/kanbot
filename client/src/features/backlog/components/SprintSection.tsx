import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateRange } from "@/lib/format"
import { summarizeTodos } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Sprint, Todo } from "@/types/api"
import { TodoRow } from "./TodoRow"

interface SprintSectionProps {
    sprint: Sprint
    todos: Todo[]
    moveTargets: Sprint[]
    activeSprint: Sprint | undefined
    onOpenTodo: (todo: Todo) => void
    onEdit: (sprint: Sprint) => void
    onStart: (sprint: Sprint) => void
}

export function SprintSection({
    sprint,
    todos,
    moveTargets,
    activeSprint,
    onOpenTodo,
    onEdit,
    onStart,
    }: SprintSectionProps) {
    const [expanded, setExpanded] = useState(true)
    const headingId = `sprint-${sprint.id}-heading`
    const listId = `sprint-${sprint.id}-list`
    const reasonId = `sprint-${sprint.id}-start-reason`
    const blocked = activeSprint !== undefined

  return (
        <section
        aria-labelledby={headingId}
        className="@container overflow-hidden rounded-lg  bg-card text-card-foreground"
        >
        {/* Narrow: name, then dates, then the buttons, each on its own line. From 32rem up: one wrapping line, buttons on the right. */}
        <header
            className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-2 bg-list-head px-3 py-3 @2xl:px-4",
            expanded && "border-b",
            )}
        >
            <h2 id={headingId} className="min-w-0">
            <button
                type="button"
                aria-expanded={expanded}
                aria-controls={listId}
                onClick={() => setExpanded((value) => !value)}
                className="flex items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <ChevronDown
                className={cn("size-4 shrink-0 transition-transform", !expanded && "-rotate-90")}
                aria-hidden="true"
                />
                <span className="font-display text-[15px] font-bold wrap-break-word">{sprint.name}</span>
                <span className="text-[13px] font-normal text-muted-foreground">(planned)</span>
            </button>
            </h2>

            <span className="w-full text-[13px] text-muted-foreground @lg:w-auto">
            {formatDateRange(sprint.startDate, sprint.endDate)} · {summarizeTodos(todos)}
            </span>

            <div className="flex w-full flex-wrap items-center gap-2 @lg:ml-auto @lg:w-auto">
            {blocked && (
                <span id={reasonId} className="w-full text-xs text-muted-foreground @lg:w-auto">
                {activeSprint.name} is already active
                </span>
            )}
            {/* Design system: Edit is a ghost button (transparent, light border), 32px tall.
                In dark mode the ghost hover color equals the header color, so it gets a white wash instead. */}
            <Button
                type="button"
                variant="ghost"
                className="btn-surface h-8 border border-ghost-edge px-3 text-[13px] hover:bg-ghost-hover dark:hover:bg-white/10"
                onClick={() => onEdit(sprint)}
            >
                Edit
            </Button>
            {/* aria-disabled (not disabled): the button stays focusable and the reason is read out with it. */}
            <Button
                type="button"
                aria-disabled={blocked || undefined}
                aria-describedby={blocked ? reasonId : undefined}
                className={cn("h-8 px-3 text-[13px]", blocked && "cursor-not-allowed opacity-50 hover:bg-primary")}
                onClick={() => {
                if (!blocked) onStart(sprint)
                }}
            >
                Start sprint
            </Button>
            </div>
        </header>

        <div id={listId} hidden={!expanded}>
            {todos.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No todos in this sprint yet. Open the ··· menu of a backlog todo and choose “Move to {sprint.name}”.
            </p>
            ) : (
            <ul>
                {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} moveTargets={moveTargets} onOpen={onOpenTodo} />
                ))}
            </ul>
            )}
        </div>
        </section>
    )
}