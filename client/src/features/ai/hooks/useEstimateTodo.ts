import { useMutation } from "@tanstack/react-query"
import { aiApi } from "@/api/ai"
import { AI_MUTATION_KEY } from "@/hooks/useAi"
import { parseEstimate } from "@/lib/parseEstimate"
import type { ParsedEstimate } from "@/lib/parseEstimate"
import type { AiSource } from "@/types/api"
import { buildEstimatePrompt } from "../lib/prompts"
import type { EstimateInput } from "../lib/prompts"

export interface Estimate extends ParsedEstimate {
    source: AiSource
}

/* Nothing is saved: the result is only a suggestion. Same key family as the other AI calls (the antenna pulses). */
export function useEstimateTodo(projectId: string) {
    return useMutation({
        mutationKey: [...AI_MUTATION_KEY, "estimate"],
        mutationFn: async (input: EstimateInput): Promise<Estimate> => {
        const response = await aiApi.chat(projectId, [{ role: "user", content: buildEstimatePrompt(input) }])
        const parsed = parseEstimate(response.message.content)
        if (!parsed) throw new Error("Couldn't read an estimate. Try again.")
        return { ...parsed, source: response.source }
        },
    })
}