import { useEffect, useRef } from "react"
import { Markdown } from "@/components/Markdown"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/api"
import { AiError } from "./AiError"

interface ChatMessagesProps {
    messages: ChatMessage[]
    pending: boolean
    error: Error | null
    onRetry: () => void
}

export function ChatMessages({ messages, pending, error, onRetry }: ChatMessagesProps) {
    const endRef = useRef<HTMLDivElement>(null)

    // Always show the newest thing. No animation for people who asked for less motion.
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" })
    }, [messages.length, pending, error])

    return (
        <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        tabIndex={0}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
        {messages.length === 0 && !pending && !error ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            Ask about your backlog or your sprint, for example "What should I work on next?" or "Break down a user
            profile page into todos."
            </p>
        ) : (
            <p className="text-center text-xs text-muted-foreground">Today</p>
        )}

        {messages.map((message, index) =>
            message.role === "user" ? (
            <div key={index} className="flex justify-end">
                <p className="max-w-[85%] min-w-0 rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground wrap-break-word">
                {message.content}
                </p>
            </div>
            ) : (
            <div key={index} className="flex justify-start">
                <div className="max-w-[92%] min-w-0 rounded-2xl rounded-bl-sm border bg-card px-3 py-2 text-card-foreground">
                <Markdown>{message.content}</Markdown>
                </div>
            </div>
            ),
        )}

        {pending && (
            <div className="flex justify-start">
            <p
                role="status"
                className={cn(
                "rounded-2xl rounded-bl-sm border border-dashed px-3 py-2 text-sm text-muted-foreground",
                "animate-pulse motion-reduce:animate-none",
                )}
            >
                Thinking…
            </p>
            </div>
        )}

        {error && !pending && <AiError error={error} onRetry={onRetry} />}

        <div ref={endRef} />
        </div>
    )
}