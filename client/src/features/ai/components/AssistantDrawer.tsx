import { MessageSquarePlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ChatMessage } from "@/types/api"
import { AiBadge } from "./AiBadge"
import { AiDisclaimer } from "./AiDisclaimer"
import { ChatInput } from "./ChatInput"
import { ChatMessages } from "./ChatMessages"
import { useAiUiStore } from "@/store/ai-ui.store"
import { AiButton } from "./AiButton"

interface AssistantDrawerProps {
    open: boolean
    onClose: () => void
    messages: ChatMessage[]
    pending: boolean
    error: Error | null
    onSend: (text: string) => void
    onRetry: () => void
    onNewChat: () => void
    hasActiveSprint: boolean
}

export function AssistantDrawer({
    open,
    onClose,
    messages,
    pending,
    error,
    onSend,
    onRetry,
    onNewChat,
    hasActiveSprint
    }: AssistantDrawerProps) {
    const canReset = messages.length > 0 || error !== null
    const openGenerate = useAiUiStore((s) => s.openGenerate)
    const openPlan = useAiUiStore((s) => s.openPlan)
    const openSummary = useAiUiStore((s) => s.openSummary)

    return (
        <Sheet
        open={open}
        onOpenChange={(next) => {
            if (!next) onClose() // X, Esc and a click outside all arrive here
        }}
        >
        {/* The data-[side=right] variants match the ones in sheet.tsx, so they win over its default 3/4 width. */}
        <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
            {/* pr-12 leaves room for the built-in close button */}
            <SheetHeader className="shrink-0 flex-row flex-wrap items-center gap-2 border-b py-3 pr-12">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <SheetTitle>Kanbot Assistant</SheetTitle>
            <AiBadge />
            <SheetDescription className="sr-only">Chat with the AI assistant about this project</SheetDescription>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={onNewChat}
                disabled={!canReset}
            >
                <MessageSquarePlus className="size-4" aria-hidden="true" />
                New chat
            </Button>
            </SheetHeader>

            <div className="flex shrink-0 flex-wrap gap-2 border-b px-4 py-3">
                <AiButton size="sm" onClick={openGenerate}>
                    Create todos
                </AiButton>
                <AiButton size="sm" onClick={openPlan}>
                    Plan sprint
                </AiButton>
            </div>

            <AiButton size="sm" onClick={openSummary} disabled={!hasActiveSprint}>
            Summarize sprint
            </AiButton>
            {!hasActiveSprint && <p className="w-full text-xs text-muted-foreground">Start a sprint to summarize it.</p>}

            <ChatMessages messages={messages} pending={pending} error={error} onRetry={onRetry} />

            <div className="shrink-0 space-y-2 border-t p-4">
            <ChatInput busy={pending} onSend={onSend} />
            <AiDisclaimer className="text-center" />
            </div>
        </SheetContent>
        </Sheet>
    )
}