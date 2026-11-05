import { useRef, useState } from "react"
import type { FormEvent, KeyboardEvent } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const MAX_LENGTH = 4000 // the API accepts up to 4000 characters per message

interface ChatInputProps {
  /** true while an answer is on its way: sending is blocked, but the field keeps its focus. */
    busy: boolean
    onSend: (text: string) => void
}

export function ChatInput({ busy, onSend }: ChatInputProps) {
    const [value, setValue] = useState("")
    const fieldRef = useRef<HTMLTextAreaElement>(null)
    const canSend = !busy && value.trim().length > 0

    function submit() {
        if (!canSend) return
        onSend(value.trim())
        setValue("")
        fieldRef.current?.focus()
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        // Enter sends, Shift+Enter adds a line. Never while an IME composition is open (Arabic, Japanese…).
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault()
        submit()
        }
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        submit()
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
            Ask Kanbot
        </label>
        <Textarea
            id="chat-input"
            ref={fieldRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            rows={1}
            placeholder="Ask Kanbot…"
            className="max-h-32 min-h-10 flex-1 resize-none"
        />
        <Button type="submit" disabled={!canSend}>
            <SendHorizontal className="size-4" aria-hidden="true" />
            Send
        </Button>
        </form>
    )
}