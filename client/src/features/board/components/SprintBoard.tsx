import { useState } from "react"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { AiButton } from "@/features/ai/components/AiButton"
import { CompleteSprintDialog } from "@/features/sprints/components/CompleteSprintDialog"
import { useAnnounceMove } from "@/hooks/useAnnounceMove"
import { boardTotals, locateInColumns } from "@/lib/board"
import { END_OF_LIST, STATUS_LABELS } from "@/lib/todo"
import { useAiUiStore } from "@/store/ai-ui.store"
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
    const openSummary = useAiUiStore((s) => s.openSummary)

    const moveTodo = useBoardMove(board.sprint.id)
    const announceMove = useAnnounceMove()

    function commitMove(todo: Todo, status: TodoStatus, position: number) {
        const from = locateInColumns(board.columns, todo.id)

        moveTodo.mutate(
        { id: todo.id, body: { status, position } },
        {
            onSuccess: () => {
            if (!from) return
            const message =
                todo.status !== status ? `${todo.key} moved to ${STATUS_LABELS[status]}` : `${todo.key} reordered`
            announceMove(todo, { status: from.status, position: from.index }, message)
            },
        },
        )
    }

    function handleMenuMove(todo: Todo, status: TodoStatus) {
        if (todo.status !== status) commitMove(todo, status, END_OF_LIST)
    }

    const dnd = useBoardDnd({ columns: board.columns, onMove: commitMove })

    return (
        <>
        <SprintHeader
            sprint={board.sprint}
            totals={boardTotals(board.columns)}
            actions={
            <>
                <AiButton onClick={openSummary}>Summarize</AiButton>
                <Button onClick={() => setCompleting(true)}>Complete sprint</Button>
            </>
            }
        />

        <DndContext {...dnd.contextProps}>
            <div
            role="region"
            aria-label="Sprint board"
            tabIndex={0}
            className="relative grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
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