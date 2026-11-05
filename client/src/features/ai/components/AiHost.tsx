import { useEffect, useState } from "react"
import { useMatch } from "react-router"
import { useChat } from "@/hooks/useAi"
import { useActiveSprint } from "@/hooks/useSprints"
import { useAiUiStore } from "@/store/ai-ui.store"
import type { ChatMessage } from "@/types/api"
import { AssistantDrawer } from "./AssistantDrawer"
import { GenerateTodosDialog } from "./GenerateTodosDialog"
import { PlanSprintDialog } from "./PlanSprintDialog"
import { SprintSummaryDialog } from "./SprintSummaryDialog"

export function AiHost() {
    const match = useMatch("/projects/:projectId/*")
    const projectId = match?.params.projectId
    if (!projectId) return null

    // key = projectId: switching projects remounts this, so the conversation starts empty (AI-1).
    return <AiHostView key={projectId} projectId={projectId} />
    }

    function AiHostView({ projectId }: { projectId: string }) {
    const drawerOpen = useAiUiStore((s) => s.drawerOpen)
    const generateOpen = useAiUiStore((s) => s.generateOpen)
    const planOpen = useAiUiStore((s) => s.planOpen)
    const summaryOpen = useAiUiStore((s) => s.summaryOpen)
    const closeDrawer = useAiUiStore((s) => s.closeDrawer)
    const closeGenerate = useAiUiStore((s) => s.closeGenerate)
    const closePlan = useAiUiStore((s) => s.closePlan)
    const closeSummary = useAiUiStore((s) => s.closeSummary)
    const closeAll = useAiUiStore((s) => s.closeAll)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const chat = useChat(projectId)
    const activeSprint = useActiveSprint(projectId)

    useEffect(() => closeAll, [closeAll])

    function request(history: ChatMessage[]) {
        chat.mutate(history, {
        onSuccess: (response) => setMessages((current) => [...current, response.message]),
        })
    }

    function handleSend(text: string) {
        const history: ChatMessage[] = [...messages, { role: "user", content: text }]
        setMessages(history)
        request(history)
    }

    function handleRetry() {
        request(messages)
    }

    function handleNewChat() {
        chat.reset()
        setMessages([])
    }

    return (
        <>
        <AssistantDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            messages={messages}
            pending={chat.isPending}
            error={chat.error}
            hasActiveSprint={Boolean(activeSprint.data)}
            onSend={handleSend}
            onRetry={handleRetry}
            onNewChat={handleNewChat}
        />
        {generateOpen && <GenerateTodosDialog projectId={projectId} onClose={closeGenerate} />}
        {planOpen && <PlanSprintDialog projectId={projectId} onClose={closePlan} />}
        {summaryOpen && <SprintSummaryDialog projectId={projectId} onClose={closeSummary} />}
        </>
    )
}