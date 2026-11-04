import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteTodo, useMoveTodo } from "@/hooks/useTodos"
import { END_OF_LIST } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Sprint, Todo } from "@/types/api"

interface TodoRowMenuProps {
    todo: Todo
    /** Sprints a todo can move into: planned and active (a completed sprint rejects moves with a 409). */
    moveTargets: Sprint[]
    /** Backlog rows only: where the row is. Without it, "Move to top/bottom" is never disabled (a filtered list can't tell). */
    listPosition?: { index: number; count: number } | null
    /** Backlog rows only: when given, the menu shows "Move to top" and "Move to bottom" (the non-drag way to reorder). */
    onMoveToEdge?: (todo: Todo, edge: "top" | "bottom") => void
}

export function TodoRowMenu({ todo, moveTargets, listPosition, onMoveToEdge }: TodoRowMenuProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const moveTodo = useMoveTodo()
    const deleteTodo = useDeleteTodo()

    const inSprint = todo.sprintId !== null
    const targets = moveTargets.filter((sprint) => sprint.id !== todo.sprintId)

    function moveTo(sprintId: string | null, destination: string) {
        // Failure toast comes from useMoveTodo; here we only announce the success.
        moveTodo.mutate(
        { id: todo.id, body: { sprintId, position: END_OF_LIST } },
        { onSuccess: () => toast.success(`${todo.key} moved to ${destination}`) },
        )
    }

    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger
            aria-label={`Actions for ${todo.key}`}
            disabled={moveTodo.isPending}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
            >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-52">
            {onMoveToEdge && (
                <>
                <DropdownMenuItem disabled={listPosition?.index === 0} onClick={() => onMoveToEdge(todo, "top")}>
                    Move to top
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={listPosition ? listPosition.index === listPosition.count - 1 : false}
                    onClick={() => onMoveToEdge(todo, "bottom")}
                >
                    Move to bottom
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                </>
            )}

            {targets.map((sprint) => {
                const label = sprint.status === "active" ? `${sprint.name} (active)` : sprint.name
                return (
                <DropdownMenuItem key={sprint.id} onClick={() => moveTo(sprint.id, label)}>
                    Move to {label}
                </DropdownMenuItem>
                )
            })}

            {inSprint && <DropdownMenuItem onClick={() => moveTo(null, "Backlog")}>Move to Backlog</DropdownMenuItem>}

            {!inSprint && targets.length === 0 && <DropdownMenuItem disabled>No planned sprint yet</DropdownMenuItem>}

            <DropdownMenuSeparator />

            <DropdownMenuItem
                className="text-destructive-text focus:bg-destructive-subtle focus:text-destructive-text"
                onClick={() => setConfirmDelete(true)}
            >
                Delete
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* A sibling of the menu, not a child: opening a dialog from inside a menu's content fights over focus. */}
        <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Delete todo?"
            description={`${todo.key} "${todo.title}" will be permanently deleted. This can't be undone.`}
            confirmLabel="Delete"
            loading={deleteTodo.isPending}
            onConfirm={() => deleteTodo.mutate(todo.id, { onSuccess: () => setConfirmDelete(false) })}
        />
        </>
    )
}