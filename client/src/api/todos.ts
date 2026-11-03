import { api } from "./client"
import type { CreateTodoRequest, MoveTodoRequest, Todo, TodoListQuery, TodoListResponse, UpdateTodoRequest} from "@/types/api"

/* Builds "?a=1&b=2", skipping empty values. */
function toQueryString(query: TodoListQuery): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") params.set(key, String(value))
    }
    const text = params.toString()
    return text ? `?${text}` : ""
}

export const todosApi = {
  /* `signal` lets TanStack Query cancel a request that is no longer needed (new search, other project). */
    list: (projectId: string, query: TodoListQuery = {}, signal?: AbortSignal) =>
    api.get<TodoListResponse>(`/projects/${projectId}/todos${toQueryString(query)}`, signal).then((r) => r.todos),

    get: (id: string, signal?: AbortSignal) => api.get<{ todo: Todo }>(`/todos/${id}`, signal).then((r) => r.todo),

    create: (projectId: string, body: CreateTodoRequest) =>
    api.post<{ todo: Todo }>(`/projects/${projectId}/todos`, body).then((r) => r.todo),

    update: (id: string, body: UpdateTodoRequest) =>
    api.patch<unknown>(`/todos/${id}`, body).then(() => undefined),

    remove: (id: string) => api.delete<void>(`/todos/${id}`),

  /* `position` is the index in the target list after removing the dragged todo (0 = top). */
    move: (id: string, body: MoveTodoRequest) =>
        api.post<unknown>(`/todos/${id}/move`, body).then(() => undefined),
}