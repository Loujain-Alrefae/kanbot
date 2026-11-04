import { useOptimisticMove } from "@/hooks/useOptimisticMove"
import { todoKeys } from "@/hooks/useTodos"
import { moveInList } from "@/lib/board"
import type { Todo } from "@/types/api"

/* Reorders the (unfiltered) backlog optimistically. The body is { position } only: the todo stays in the backlog. */
export function useReorderBacklog(projectId: string) {
    return useOptimisticMove<Todo[]>({
        // The page's unfiltered query has exactly this key: toApiFilters leaves undefined fields out, and so does the key hash.
        queryKey: todoKeys.backlog(projectId, {}),
        apply: (todos, { id, body }) => moveInList(todos, id, body.position),
        failureMessage: "Couldn't reorder the backlog. It was put back.",
    })
}