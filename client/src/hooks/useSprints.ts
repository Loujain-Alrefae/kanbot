import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { sprintsApi } from "@/api/sprints"
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  StartSprintRequest,
  UpdateSprintRequest,
} from "@/types/api"
import { useInvalidateWork } from "./useInvalidateWork"

export const sprintKeys = {
    list: (projectId: string) => ["sprints", projectId] as const,
    /* Starts with ["sprints"], so the shared invalidation after any todo/sprint change refreshes the board too. */
    board: (sprintId: string) => ["sprints", "board", sprintId] as const,
}

export function useSprints(projectId: string | undefined) {
    return useQuery({
        queryKey: sprintKeys.list(projectId ?? ""),
        queryFn: ({ signal }) => sprintsApi.list(projectId as string, signal),
        enabled: Boolean(projectId),
    })
}

/*
 * The project's active sprint, read from the SAME cached list as useSprints (same key, so no extra request).
 * data: undefined = still loading, null = there is no active sprint, Sprint = the active one.
 */
export function useActiveSprint(projectId: string | undefined) {
    return useQuery({
        queryKey: sprintKeys.list(projectId ?? ""),
        queryFn: ({ signal }) => sprintsApi.list(projectId as string, signal),
        enabled: Boolean(projectId),
        select: (sprints) => sprints.find((sprint) => sprint.status === "active") ?? null,
    })
    }

/* The board of one sprint. The id comes from useActiveSprint, so this waits for it (one unavoidable hop). */
export function useSprintBoard(sprintId: string | undefined) {
    return useQuery({
        queryKey: sprintKeys.board(sprintId ?? ""),
        queryFn: ({ signal }) => sprintsApi.board(sprintId as string, signal),
        enabled: Boolean(sprintId),
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

/* No toast and no onError: the complete dialog knows the sprint name, shows server errors inside itself,
   and navigates after the fresh data has arrived (the promise returned here). */
export function useCompleteSprint() {
    const invalidate = useInvalidateWork()
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: CompleteSprintRequest }) => sprintsApi.complete(id, body),
        onSuccess: () => invalidate(),
    })
}