import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"
import { toast } from "sonner"
import { todosApi } from "@/api/todos"
import type { MoveTodoRequest } from "@/types/api"
import { useInvalidateWork } from "./useInvalidateWork"

export interface MoveVariables {
    id: string
    body: MoveTodoRequest
}

/* Every move mutation shares this key and scope, so they are counted together and run one after another. */
export const MOVE_MUTATION_KEY = ["move-todo"] as const
export const MOVE_SCOPE = { id: "todo-moves" } as const

interface OptimisticMoveOptions<TCache> {
    /** The cache entry that shows the lists (a board, the backlog…). */
    queryKey: QueryKey
    /** Pure: takes the cached data and the move, returns the data as it will look after the move. */
    apply: (cache: TCache, move: MoveVariables) => TCache
    /** Toast title when the move fails. The server's own message is shown underneath. */
    failureMessage: string
}

/*
 * The optimistic-update recipe for POST /todos/:id/move, written once.
 * The screen changes immediately; the request follows; if it fails the screen goes back.
 */
export function useOptimisticMove<TCache>({ queryKey, apply, failureMessage }: OptimisticMoveOptions<TCache>) {
    const queryClient = useQueryClient()
    const invalidate = useInvalidateWork()

    return useMutation({
        mutationKey: MOVE_MUTATION_KEY,
        scope: MOVE_SCOPE, // moves with the same scope run one at a time, in the order they were made
        mutationFn: ({ id, body }: MoveVariables) => todosApi.move(id, body),

        // Runs BEFORE the request, immediately.
        onMutate: async (move) => {
        // A refetch already in flight would land later and overwrite the change we are about to make.
        await queryClient.cancelQueries({ queryKey })
        const previous = queryClient.getQueryData<TCache>(queryKey) // our way back if the request fails
        if (previous !== undefined) queryClient.setQueryData<TCache>(queryKey, apply(previous, move))
        return { previous }
        },

        onError: (error, _move, context) => {
        if (context?.previous !== undefined) queryClient.setQueryData<TCache>(queryKey, context.previous)
        toast.error(failureMessage, { description: error.message })
        },

        // Runs after success AND after failure. The refetch makes the screen match the server for sure.
        onSettled: async () => {
        // While this mutation runs it is counted too, so "1" means "no other move is waiting behind me".
        // Refetching earlier would replace the optimistic state of the moves still queued.
        if (queryClient.isMutating({ mutationKey: MOVE_MUTATION_KEY }) === 1) await invalidate()
        },
    })
}