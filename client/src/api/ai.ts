import { AI_REQUEST_TIMEOUT_MS, api } from "./client"
import type {
  AiStatusResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  SprintSummaryResponse,
} from "@/types/api"

/* A real model can take several seconds, so every AI call waits longer than the server's own AI timeout. */
const AI_OPTIONS = { timeout: AI_REQUEST_TIMEOUT_MS }

export const aiApi = {
    status: (signal?: AbortSignal) => api.get<AiStatusResponse>("/ai/status", signal),

    /* Stateless: the server remembers nothing, so the conversation is sent every time. */
    chat: (projectId: string, messages: ChatMessage[]) => {
        const body: ChatRequest = { messages }
        return api.post<ChatResponse>(`/projects/${projectId}/ai/chat`, body, AI_OPTIONS)
    },

    /* Nothing is saved: the result is a list of drafts. */
    generateTodos: (projectId: string, body: GenerateTodosRequest) =>
        api.post<GenerateTodosResponse>(`/projects/${projectId}/ai/generate-todos`, body, AI_OPTIONS),

    /* Only a suggestion: it picks existing backlog todos, it does not create the sprint. */
    planSprint: (projectId: string, body: PlanSprintRequest) =>
        api.post<PlanSprintResponse>(`/projects/${projectId}/ai/plan-sprint`, body, AI_OPTIONS),

    /* Active or completed sprints only (a planned one answers 409). The server saves the summary on the sprint. */
    summarize: (sprintId: string) =>
        api.post<SprintSummaryResponse>(`/sprints/${sprintId}/ai/summary`, undefined, AI_OPTIONS),
}