import { api } from "./client"
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintBoardResponse,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from "@/types/api"

export const sprintsApi = {
    list: (projectId: string, signal?: AbortSignal) =>
        api.get<SprintListResponse>(`/projects/${projectId}/sprints`, signal).then((r) => r.sprints),

    /* The board: the sprint plus its todos grouped in the four status columns, each sorted by `order`. */
    board: (id: string, signal?: AbortSignal) => api.get<SprintBoardResponse>(`/sprints/${id}/todos`, signal),

    create: (projectId: string, body: CreateSprintRequest) =>
        api.post<{ sprint: Sprint }>(`/projects/${projectId}/sprints`, body).then((r) => r.sprint),

    update: (id: string, body: UpdateSprintRequest) =>
        api.patch<unknown>(`/sprints/${id}`, body).then(() => undefined),

    remove: (id: string) => api.delete<void>(`/sprints/${id}`),

    start: (id: string, body: StartSprintRequest = {}) =>
        api.post<unknown>(`/sprints/${id}/start`, body).then(() => undefined),

    /* Only for the active sprint. Unfinished todos go to the backlog or to a planned sprint. */
    complete: (id: string, body: CompleteSprintRequest) =>
        api.post<unknown>(`/sprints/${id}/complete`, body).then(() => undefined),
}