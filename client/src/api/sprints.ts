import { api } from "./client"
import type {
  CreateSprintRequest,
  Sprint,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from "@/types/api"

export const sprintsApi = {
    list: (projectId: string, signal?: AbortSignal) =>
        api.get<SprintListResponse>(`/projects/${projectId}/sprints`, signal).then((r) => r.sprints),

    create: (projectId: string, body: CreateSprintRequest) =>
        api.post<{ sprint: Sprint }>(`/projects/${projectId}/sprints`, body).then((r) => r.sprint),

    update: (id: string, body: UpdateSprintRequest) =>
        api.patch<unknown>(`/sprints/${id}`, body).then(() => undefined),

    remove: (id: string) => api.delete<void>(`/sprints/${id}`),

    start: (id: string, body: StartSprintRequest = {}) =>
        api.post<unknown>(`/sprints/${id}/start`, body).then(() => undefined),
}