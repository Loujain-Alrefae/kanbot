import { toast } from "sonner"
import { todosApi } from "@/api/todos"
import type { Todo, TodoStatus } from "@/types/api"
import { useInvalidateWork } from "./useInvalidateWork"

/* Where a todo was BEFORE a move. `position` follows the API: the index in that list. */
export interface MoveOrigin {
    /** Leave undefined when the move did not change the sprint (board moves). */
    sprintId?: string | null
    status: TodoStatus
    position: number
    }

    /*
    * Index of a todo inside its own list (a sprint's status column, or the backlog), read from the unfiltered
    * list of the project. null when it can't be worked out: then no Undo is offered.
    */
    export function positionInList(all: Todo[] | undefined, todo: Todo): number | null {
    if (!all) return null
    const siblings = all
        .filter((item) => item.sprintId === todo.sprintId && (todo.sprintId === null || item.status === todo.status))
        .sort((a, b) => a.order - b.order)
    const index = siblings.findIndex((item) => item.id === todo.id)
    return index === -1 ? null : index
    }

    /*
    * Shows the success toast of a move with an "Undo" button. Undo sends the move back to where it came from.
    * The undo itself shows a plain toast (no second Undo), so there is no loop. Moves only: a deleted todo
    * can't come back with its key.
    */
    export function useAnnounceMove() {
    const invalidate = useInvalidateWork()

    return function announceMove(todo: Todo, origin: MoveOrigin, message: string) {
        async function undo() {
        try {
            await todosApi.move(todo.id, {
            ...(origin.sprintId !== undefined && { sprintId: origin.sprintId }),
            status: origin.status,
            position: origin.position,
            })
            toast.success(`${todo.key} moved back`)
        } catch (err) {
            toast.error("Couldn't undo the move", { description: err instanceof Error ? err.message : undefined })
        } finally {
            await invalidate()
        }
        }

        toast.success(message, { duration: 8000, action: { label: "Undo", onClick: () => void undo() } })
    }
}