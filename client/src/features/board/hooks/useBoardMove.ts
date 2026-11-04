import { useOptimisticMove } from "@/hooks/useOptimisticMove"
import { sprintKeys } from "@/hooks/useSprints"
import { locateInColumns, moveInColumns } from "@/lib/board"
import type { SprintBoardResponse } from "@/types/api"

/* Moves a card on the board. The body is the API's: { status?, position }. */
export function useBoardMove(sprintId: string | undefined) {
    return useOptimisticMove<SprintBoardResponse>({
        queryKey: sprintKeys.board(sprintId ?? ""),
        apply: (board, { id, body }) => {
        // No status in the body = the card stays in its column and only changes position.
        const toStatus = body.status ?? locateInColumns(board.columns, id)?.status
        if (!toStatus) return board
        return { ...board, columns: moveInColumns(board.columns, id, toStatus, body.position) }
        },
        failureMessage: "Couldn't move the card. It was put back.",
    })
}