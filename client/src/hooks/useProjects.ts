import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { projectsApi } from "@/api/projects"
import type { CreateProjectRequest, UpdateProjectRequest } from "@/types/api"

/* Detail keys start with ["projects"], so invalidating the list also refreshes details. */
export const projectKeys = {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", id] as const,
}

export function useProjects() {
    return useQuery({ queryKey: projectKeys.all, queryFn: projectsApi.list })
}

export function useProject(id: string | undefined) {
    return useQuery({
        queryKey: projectKeys.detail(id ?? ""),
        queryFn: () => projectsApi.get(id as string),
        enabled: Boolean(id),
    })
}

export function useCreateProject() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: CreateProjectRequest) => projectsApi.create(body),
        onSuccess: () => {
        qc.invalidateQueries({ queryKey: projectKeys.all })
        toast.success("Project created")
        },
    })
}

export function useUpdateProject() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateProjectRequest }) => projectsApi.update(id, body),
        onSuccess: () => {
        qc.invalidateQueries({ queryKey: projectKeys.all })
        toast.success("Project updated")
        },
    })
}

export function useDeleteProject() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => projectsApi.remove(id),
        onSuccess: () => {
        qc.invalidateQueries({ queryKey: projectKeys.all })
        toast.success("Project deleted")
        },
        onError: (err) => toast.error(err.message),
    })
}