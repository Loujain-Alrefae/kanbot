import { useEffect, useRef, useState } from "react"
import { useMatch } from "react-router"
import { toast } from "sonner"
import { useChat } from "@/hooks/useAi"
import { useActiveSprint, useSprintBoard } from "@/hooks/useSprints"
import { useAiUiStore } from "@/store/ai-ui.store"
import type { ChatMessage } from "@/types/api"
import { loadChat, saveChat } from "../lib/chatStorage"
import { buildStandupPrompt } from "../lib/standup"
import { suggestionsFor } from "../lib/suggestions"
import { AssistantDrawer } from "./AssistantDrawer"
import { GenerateTodosDialog } from "./GenerateTodosDialog"
import { PlanSprintDialog } from "./PlanSprintDialog"
import { SprintSummaryDialog } from "./SprintSummaryDialog"

export function AiHost() {
    const match = useMatch("/projects/:projectId/*")
    const projectId = match?.params.projectId
    if (!projectId) return null

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

    const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat(projectId))
    const chat = useChat(projectId)
    const activeSprint = useActiveSprint(projectId)
    // Same cache as the board page: the stand-up is built from the active sprint's columns.
    const board = useSprintBoard(activeSprint.data?.id)

    useEffect(() => closeAll, [closeAll])

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

    // X6: the request is built from live data and sent like any other message.
    function handleStandup() {
        if (!activeSprint.data || !board.data || chat.isPending) return
        handleSend(buildStandupPrompt(activeSprint.data, board.data.columns))
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
            standupReady={board.isSuccess}
            suggestions={suggestionsFor(section)}
            section={section}
            onSend={handleSend}
            onStandup={handleStandup}
            onRetry={handleRetry}
            onNewChat={handleNewChat}
        />
        {generateOpen && <GenerateTodosDialog projectId={projectId} onClose={closeGenerate} />}
        {planOpen && <PlanSprintDialog projectId={projectId} onClose={closePlan} />}
        {summaryOpen && <SprintSummaryDialog projectId={projectId} onClose={closeSummary} />}
        </>
    )
}