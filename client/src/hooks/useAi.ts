import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { aiApi } from "@/api/ai"
import type { ChatMessage, GenerateTodosRequest, PlanSprintRequest } from "@/types/api"

/** The API accepts 1 to 30 messages per chat request, the last one from the user. */
export const MAX_CHAT_MESSAGES = 30

export const aiKeys = {
    status: ["ai-status"] as const,
}

/*
 * Asked once: the mode ("mock" or "ai") does not change while the app is open.
 * A failure is not shown to the user: the "Mock AI" badge just doesn't appear.
 */
export function useAiStatus() {
    return useQuery({
        queryKey: aiKeys.status,
        queryFn: ({ signal }) => aiApi.status(signal),
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
    })
}

/* No onError in any of the hooks below: the screen that calls them shows the error itself, with "Try again". */

export function useChat(projectId: string) {
    return useMutation({
        // Only the most recent messages are sent; the screen still shows the whole conversation.
        mutationFn: (messages: ChatMessage[]) => aiApi.chat(projectId, messages.slice(-MAX_CHAT_MESSAGES)),
    })
}

export function useGenerateTodos(projectId: string) {
    return useMutation({
        mutationFn: (body: GenerateTodosRequest) => aiApi.generateTodos(projectId, body),
    })
}

export function usePlanSprint(projectId: string) {
    return useMutation({
        mutationFn: (body: PlanSprintRequest) => aiApi.planSprint(projectId, body),
    })
    }

    export function useSprintSummary() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (sprintId: string) => aiApi.summarize(sprintId),
        // The server saved the summary on the sprint: refresh every sprint query (the list and the boards) so it
        // shows up. Returning the promise keeps the mutation "pending" until the saved summary has arrived.
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sprints"] }),
    })
}