import { useAuthStore } from "@/store/auth.store"
import type { ChatMessage } from "@/types/api"

const PREFIX = "kanbot:chat:"
const MAX_STORED = 100

function isChatMessage(value: unknown): value is ChatMessage {
    if (typeof value !== "object" || value === null) return false
    const item = value as Record<string, unknown>
    return (item.role === "user" || item.role === "assistant") && typeof item.content === "string"
    }

    /* Only the chat text is stored, one entry per project. Bad or missing data simply gives an empty chat. */
    export function loadChat(projectId: string): ChatMessage[] {
    try {
        const raw = localStorage.getItem(PREFIX + projectId)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(isChatMessage) : []
    } catch {
        return []
    }
    }

    export function saveChat(projectId: string, messages: ChatMessage[]) {
    try {
        if (messages.length === 0) localStorage.removeItem(PREFIX + projectId)
        else localStorage.setItem(PREFIX + projectId, JSON.stringify(messages.slice(-MAX_STORED)))
    } catch {
        // Storage is full or blocked: the chat just isn't saved.
    }
    }

    export function clearAllChats() {
    try {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(PREFIX)) keys.push(key)
        }
        keys.forEach((key) => localStorage.removeItem(key))
    } catch {
        // Nothing to clear if storage is blocked.
    }
    }

    // ✅ التعديل هنا: يتم مسح المحادثات فور أن يصبح التوكن null عند الخروج
    useAuthStore.subscribe((state, previous) => {
    if (previous.token && !state.token) {
        clearAllChats()
    }
})