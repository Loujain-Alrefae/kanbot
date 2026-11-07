import { MessageSquarePlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAiUiStore } from "@/store/ai-ui.store"
import type { ChatMessage } from "@/types/api"
import { AiBadge } from "./AiBadge"
import { AiDisclaimer } from "./AiDisclaimer"
import { ChatInput } from "./ChatInput"
import { ChatMessages } from "./ChatMessages"

const SPRINT_PAGES = ["board", "sprints"]

interface AssistantDrawerProps {
    open: boolean
    onClose: () => void
    messages: ChatMessage[]
    pending: boolean
    error: Error | null
    hasActiveSprint: boolean
    standupReady: boolean
    section: string | undefined
    suggestions: string[]
    onSend: (text: string) => void
    onStandup: () => void
    onRetry: () => void
    onNewChat: () => void
}

export function AssistantDrawer({
    open,
    onClose,
    messages,
    pending,
    error,
    hasActiveSprint,
    standupReady,
    section,
    suggestions,
    onSend,
    onStandup,
    onRetry,
    onNewChat,
    }: AssistantDrawerProps) {
    const canReset = messages.length > 0 || error !== null
    const openGenerate = useAiUiStore((s) => s.openGenerate)
    const openPlan = useAiUiStore((s) => s.openPlan)
    const openSummary = useAiUiStore((s) => s.openSummary)

    // Backlog actions only on the backlog page, sprint actions only on the sprint pages.
    const onBacklog = section === "backlog"
    const onSprintPage = section !== undefined && SPRINT_PAGES.includes(section)

    let hint: string | null = null
    if (onBacklog) hint = "Summarize and stand-up are available on the board and sprints pages."
    else if (onSprintPage && !hasActiveSprint) hint = "No active sprint. Start one to summarize it or get a stand-up."
    else if (onSprintPage) hint = "Create todos and Plan sprint are available on the backlog page."

    return (
        <Sheet
        open={open}
        onOpenChange={(next) => {
            if (!next) onClose()
        }}
        >
        <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
            <SheetHeader className="shrink-0 flex-row flex-wrap items-center gap-2 border-b py-3 pr-12">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <SheetTitle>Kanbot Assistant</SheetTitle>
            <AiBadge />
            <SheetDescription className="sr-only">Chat with the AI assistant about this project</SheetDescription>
            <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={onNewChat} disabled={!canReset}>
                <MessageSquarePlus className="size-4" aria-hidden="true" />
                New chat
            </Button>
            </SheetHeader>

            <div className="flex shrink-0 flex-wrap gap-2 border-b px-4 py-3">
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={openGenerate}
                disabled={!onBacklog}
            >
                Create todos
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={openPlan}
                disabled={!onBacklog}
            >
                Plan sprint
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={openSummary}
                disabled={!onSprintPage || !hasActiveSprint}
            >
                Summarize sprint
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={onStandup}
                disabled={!onSprintPage || !standupReady || pending}
            >
                Daily stand-up
            </Button>
            {hint && <p className="w-full text-xs text-muted-foreground">{hint}</p>}
            </div>

            <ChatMessages messages={messages} pending={pending} error={error} onRetry={onRetry} />

            <div className="shrink-0 space-y-2 border-t p-4">
            {suggestions.length > 0 && !pending && (
                <div className="flex flex-wrap gap-2">
                {suggestions.map((text) => (
                    <button
                    key={text}
                    type="button"
                    onClick={() => onSend(text)}
                    className="rounded-full border bg-card px-3 py-1 text-left text-xs outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                    >
                    {text}
                    </button>
                ))}
                </div>
            )}
            <ChatInput busy={pending} onSend={onSend} />
            <AiDisclaimer className="text-center" />
            </div>
        </SheetContent>
        </Sheet>
    )
}