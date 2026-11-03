import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { sprintsApi } from "@/api/sprints"
import type { CreateSprintRequest, StartSprintRequest, UpdateSprintRequest } from "@/types/api"
import { useInvalidateWork } from "./useInvalidateWork"

export const sprintKeys = {
    list: (projectId: string) => ["sprints", projectId] as const,
}

export function useSprints(projectId: string | undefined) {
    return useQuery({
        queryKey: sprintKeys.list(projectId ?? ""),
        queryFn: ({ signal }) => sprintsApi.list(projectId as string, signal),
        enabled: Boolean(projectId),
    })
}

export function useCreateSprint(projectId: string) {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: (body: CreateSprintRequest) => sprintsApi.create(projectId, body),
        onSuccess: () => {
        toast.success("Sprint created")
        return invalidate()
        },
    })
}

export function useUpdateSprint() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateSprintRequest }) => sprintsApi.update(id, body),
        onSuccess: () => {
        toast.success("Sprint updated")
        return invalidate()
        },
    })
}

export function useDeleteSprint() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: (id: string) => sprintsApi.remove(id),
        onSuccess: () => {
        toast.success("Sprint deleted. Its todos are back in the backlog.")
        return invalidate()
        },
        onError: (err) => toast.error(err.message),
    })
}

/* No toast here: the page that starts the sprint shows it and navigates to the board. */
export function useStartSprint() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body?: StartSprintRequest }) => sprintsApi.start(id, body),
        onSuccess: () => invalidate(),
    })
}