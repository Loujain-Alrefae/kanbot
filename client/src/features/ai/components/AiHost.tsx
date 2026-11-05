import { useEffect, useState } from "react"
import { useMatch } from "react-router"
import { useChat } from "@/hooks/useAi"
import { useAiUiStore } from "@/store/ai-ui.store"
import type { ChatMessage } from "@/types/api"
import { AssistantDrawer } from "./AssistantDrawer"

/*
 * Mounted once in the app shell. useMatch reads the URL directly (like the sidebar), because useParams
 * in a parent layout can't see the child route's params. Outside a project it renders nothing.
 */
export function AiHost() {
    const match = useMatch("/projects/:projectId/*")
    const projectId = match?.params.projectId
    if (!projectId) return null

    // key = projectId: switching projects remounts this, so the conversation starts empty (AI-1).
    return <AiHostView key={projectId} projectId={projectId} />
}

function AiHostView({ projectId }: { projectId: string }) {
    const drawerOpen = useAiUiStore((s) => s.drawerOpen)
    const closeDrawer = useAiUiStore((s) => s.closeDrawer)
    const closeAll = useAiUiStore((s) => s.closeAll)

    // The conversation is UI state, kept here (not inside the drawer) so it survives closing the drawer.
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const chat = useChat(projectId)

    // Leaving the project (or switching) must not leave an AI surface "open" for the next one.
    useEffect(() => closeAll, [closeAll])

    // The server remembers nothing: every request carries the conversation (useChat trims it to the last 30).
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

    // The failed question is already the last message, so retrying must not add it again.
    function handleRetry() {
        request(messages)
    }

    function handleNewChat() {
        chat.reset()
        setMessages([])
    }

    return (
        <AssistantDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        messages={messages}
        pending={chat.isPending}
        error={chat.error}
        onSend={handleSend}
        onRetry={handleRetry}
        onNewChat={handleNewChat}
        />
    )
}