import { api } from "./client"
import type {CreateProjectRequest, Project, ProjectWithStats, UpdateProjectRequest} from "@/types/api"

export const projectsApi = {
    list: () => api.get<{ projects: ProjectWithStats[] }>("/projects").then((r) => r.projects),
    get: (id: string) => api.get<{ project: ProjectWithStats }>(`/projects/${id}`).then((r) => r.project),
    create: (body: CreateProjectRequest) => api.post<{ project: Project }>("/projects", body).then((r) => r.project),
    update: (id: string, body: UpdateProjectRequest) =>
        api.patch<{ project: Project }>(`/projects/${id}`, body).then((r) => r.project),
    remove: (id: string) => api.delete<void>(`/projects/${id}`),
}