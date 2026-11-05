import { useEffect, useRef, useState } from "react"
import { useMatch } from "react-router"
import { toast } from "sonner"
import { useChat } from "@/hooks/useAi"
import { useActiveSprint } from "@/hooks/useSprints"
import { useAiUiStore } from "@/store/ai-ui.store"
import type { ChatMessage } from "@/types/api"
import { loadChat, saveChat } from "../lib/chatStorage"
import { suggestionsFor } from "../lib/suggestions"
import { AssistantDrawer } from "./AssistantDrawer"
import { GenerateTodosDialog } from "./GenerateTodosDialog"
import { PlanSprintDialog } from "./PlanSprintDialog"
import { SprintSummaryDialog } from "./SprintSummaryDialog"

export function AiHost() {
    const match = useMatch("/projects/:projectId/*")
    const projectId = match?.params.projectId
    if (!projectId) return null

    // "board" or "sprints/abc" -> the first segment is the page (for the suggested questions).
    const section = match?.params["*"]?.split("/")[0]

    // key = projectId: switching projects remounts this, so each project loads its own conversation (AI-1).
    return <AiHostView key={projectId} projectId={projectId} section={section} />
}

function AiHostView({ projectId, section }: { projectId: string; section: string | undefined }) {
    const drawerOpen = useAiUiStore((s) => s.drawerOpen)
    const generateOpen = useAiUiStore((s) => s.generateOpen)
    const planOpen = useAiUiStore((s) => s.planOpen)
    const summaryOpen = useAiUiStore((s) => s.summaryOpen)
    const closeDrawer = useAiUiStore((s) => s.closeDrawer)
    const closeGenerate = useAiUiStore((s) => s.closeGenerate)
    const closePlan = useAiUiStore((s) => s.closePlan)
    const closeSummary = useAiUiStore((s) => s.closeSummary)
    const closeAll = useAiUiStore((s) => s.closeAll)

    // The conversation is UI state, kept here so it survives closing the drawer (and a reload, E2).
    const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat(projectId))
    const chat = useChat(projectId)
    const activeSprint = useActiveSprint(projectId)

    useEffect(() => closeAll, [closeAll])

    // E2: keep the conversation in localStorage (text only). An empty chat removes the entry.
    useEffect(() => {
        saveChat(projectId, messages)
    }, [projectId, messages])

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

    // E3: other screens ask the assistant through the store ("Improve with AI").
    function handleExternalPrompt(text: string) {
        if (chat.isPending) {
        toast.info("The assistant is still answering. Try again in a moment.")
        return
        }
        handleSend(text)
    }
    const externalPromptRef = useRef(handleExternalPrompt)
    useEffect(() => {
        externalPromptRef.current = handleExternalPrompt
    })
    useEffect(
        () =>
        useAiUiStore.subscribe((state) => {
            const prompt = state.pendingPrompt
            if (!prompt) return
            useAiUiStore.getState().consumePrompt()
            externalPromptRef.current(prompt)
        }),
        [],
    )

    return (
        <>
        <AssistantDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            messages={messages}
            pending={chat.isPending}
            error={chat.error}
            hasActiveSprint={Boolean(activeSprint.data)}
            suggestions={suggestionsFor(section)}
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