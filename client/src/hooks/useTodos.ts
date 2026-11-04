import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { todosApi } from "@/api/todos"
import type {CreateTodoRequest, MoveTodoRequest, SprintBoardResponse, Todo, TodoPriority, TodoType, UpdateTodoRequest} from "@/types/api"
import { useInvalidateWork } from "./useInvalidateWork"
import { TODO_STATUSES} from "@/types/api"

export interface BacklogFilters {
    search?: string
    priority?: TodoPriority
    type?: TodoType
}

export const todoKeys = {
    /** Every todo of the project, unfiltered: feeds the planned-sprint sections and move targets. */
    all: (projectId: string) => ["todos", projectId, "all"] as const,
    /** Backlog only, with the search and filters applied. */
    backlog: (projectId: string, filters: BacklogFilters) => ["todos", projectId, "backlog", filters] as const,
    /** One todo (details dialog). */
    detail: (id: string | null) => ["todo", id] as const,
}

export function useAllTodos(projectId: string | undefined) {
    return useQuery({
        queryKey: todoKeys.all(projectId ?? ""),
        queryFn: ({ signal }) => todosApi.list(projectId as string, {}, signal),
        enabled: Boolean(projectId),
    })
}

export function useBacklogTodos(projectId: string | undefined, filters: BacklogFilters) {
    return useQuery({
        queryKey: todoKeys.backlog(projectId ?? "", filters),
        queryFn: ({ signal }) => todosApi.list(projectId as string, { sprintId: "backlog", ...filters }, signal),
        enabled: Boolean(projectId),
        // Keep the old list on screen only while the filters change inside the SAME project,
        // so typing does not flash skeletons but switching projects never shows another project's todos.
        placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[1] === projectId ? previous : undefined),
    })
}

/* Single todo for the details dialog. Starts from a cached copy (the backlog lists or any cached board),
   so it opens instantly, then refetches. */
export function useTodo(id: string | null, projectId: string | undefined) {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: todoKeys.detail(id),
        queryFn: ({ signal }) => todosApi.get(id as string, signal),
        enabled: Boolean(id),
        initialData: () => {
        if (!projectId) return undefined

        const fromList = queryClient.getQueryData<Todo[]>(todoKeys.all(projectId))?.find((t) => t.id === id)
        if (fromList) return fromList

        // The board keys all start with ["sprints", "board"]; the sprint list key ["sprints", projectId] does not match.
        for (const [, board] of queryClient.getQueriesData<SprintBoardResponse>({ queryKey: ["sprints", "board"] })) {
            const found = board ? TODO_STATUSES.flatMap((status) => board.columns[status]).find((t) => t.id === id) : undefined
            if (found) return found
        }
        return undefined
        },
    })
}

/* No onError on create/update: the forms show field errors themselves.
   Any caller using mutateAsync must wrap it in try/catch (no unhandled rejections, NFR-2). */
export function useCreateTodo(projectId: string) {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: (body: CreateTodoRequest) => todosApi.create(projectId, body),
        onSuccess: () => {
        // Fixed id: creating several todos in a row replaces the toast instead of stacking them.
        toast.success("Todo created", { id: "todo-created" })
        return invalidate()
        },
    })
}

export function useUpdateTodo() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateTodoRequest }) => todosApi.update(id, body),
        onSuccess: () => {
        toast.success("Todo updated")
        return invalidate()
        },
    })
}

export function useDeleteTodo() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: (id: string) => todosApi.remove(id),
        onSuccess: () => {
        toast.success("Todo deleted")
        return invalidate()
        },
        onError: (err) => toast.error(err.message),
    })
}

/* No success toast here: the caller knows what was moved where ("Moved to Sprint 4"). */
export function useMoveTodo() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: MoveTodoRequest }) => todosApi.move(id, body),
        onSuccess: () => invalidate(),
        onError: (err) => toast.error(err.message),
    })
}