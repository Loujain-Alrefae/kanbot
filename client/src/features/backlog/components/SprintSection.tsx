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
    /** Planned and active sprints, for each row's "Move to…" menu. */
    moveTargets: Sprint[]
    /** The project's active sprint, if any: only one sprint can be active, so it blocks "Start sprint". */
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
        className="overflow-hidden rounded-lg border bg-card text-card-foreground"
        >
        <header
            className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 bg-muted px-4 py-3", expanded && "border-b")}
        >
            <h2 id={headingId} className="text-sm font-semibold">
            <button
                type="button"
                aria-expanded={expanded}
                aria-controls={listId}
                onClick={() => setExpanded((value) => !value)}
                className="flex items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <ChevronDown
                className={cn("size-4 transition-transform", !expanded && "-rotate-90")}
                aria-hidden="true"
                />
                {sprint.name}
                <span className="font-normal text-muted-foreground">(planned)</span>
            </button>
            </h2>

            <span className="text-xs text-muted-foreground">
            {formatDateRange(sprint.startDate, sprint.endDate)} · {summarizeTodos(todos)}
            </span>

            <div className="ml-auto flex items-center gap-2">
            {blocked && (
                <span id={reasonId} className="text-xs text-muted-foreground">
                {activeSprint.name} is already active
                </span>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(sprint)}>
                Edit
            </Button>
            {/* aria-disabled (not disabled): the button stays focusable and the reason is read out with it. */}
            <Button
                type="button"
                size="sm"
                aria-disabled={blocked || undefined}
                aria-describedby={blocked ? reasonId : undefined}
                className={cn(blocked && "cursor-not-allowed opacity-50 hover:bg-primary")}
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