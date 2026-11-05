import { useState } from "react"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { CompleteSprintDialog } from "@/features/sprints/components/CompleteSprintDialog"
import { useAnnounceMove } from "@/hooks/useAnnounceMove"
import { boardTotals, locateInColumns } from "@/lib/board"
import { END_OF_LIST, STATUS_LABELS } from "@/lib/todo"
import { TODO_STATUSES } from "@/types/api"
import type { SprintBoardResponse, Todo, TodoStatus } from "@/types/api"
import { useBoardDnd } from "../hooks/useBoardDnd"
import { useBoardMove } from "../hooks/useBoardMove"
import { BoardColumn } from "./BoardColumn"
import { SprintHeader } from "./SprintHeader"
import { TodoCardPreview } from "./TodoCardPreview"

interface SprintBoardProps {
    board: SprintBoardResponse
    onOpenTodo: (todo: Todo) => void
}

export function SprintBoard({ board, onOpenTodo }: SprintBoardProps) {
    const [completing, setCompleting] = useState(false)

    // One mutation for the whole board: the card menu and drag and drop both use it.
    const moveTodo = useBoardMove(board.sprint.id)
    const announceMove = useAnnounceMove()

    // Every real move ends here. The toast always carries Undo, which puts the card back where it was.
    function commitMove(todo: Todo, status: TodoStatus, position: number) {
        // Read from the cache BEFORE the optimistic update changes it.
        const from = locateInColumns(board.columns, todo.id)

    moveTodo.mutate(
        { id: todo.id, body: { status, position } },
        {
            onSuccess: () => {
            if (!from) return
            const message =
                todo.status !== status
                ? `${todo.key} moved to ${STATUS_LABELS[status]}`
                : `${todo.key} reordered`
            announceMove(todo, { status: from.status, position: from.index }, message)
            },
        },
        )
    }

  // From the card menu: the card goes to the END of the target column, like a status change in the details dialog.
    function handleMenuMove(todo: Todo, status: TodoStatus) {
        if (todo.status !== status) commitMove(todo, status, END_OF_LIST)
    }

    const dnd = useBoardDnd({ columns: board.columns, onMove: commitMove })

    return (
        <>
        {/* Progress follows the cache (board.columns), not the drag copy: it must not change until the card is dropped. */}
        <SprintHeader
            sprint={board.sprint}
            totals={boardTotals(board.columns)}
            actions={<Button onClick={() => setCompleting(true)}>Complete sprint</Button>}
        />

        <DndContext {...dnd.contextProps}>
            <div
            role="region"
            aria-label="Sprint board"
            tabIndex={0}
            className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
            {TODO_STATUSES.map((status) => (
                <BoardColumn
                key={status}
                status={status}
                todos={dnd.columns[status]}
                onOpenTodo={onOpenTodo}
                onMoveTodo={handleMenuMove}
                />
            ))}
            </div>

            <DragOverlay>{dnd.activeTodo ? <TodoCardPreview todo={dnd.activeTodo} /> : null}</DragOverlay>
        </DndContext>

        {completing && (
            <CompleteSprintDialog sprint={board.sprint} columns={board.columns} onClose={() => setCompleting(false)} />
        )}
        </>
    )
}