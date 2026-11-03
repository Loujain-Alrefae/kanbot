import { useState } from "react"
import type { KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LabelsInputProps {
    id: string
    value: string[]
    onChange: (labels: string[]) => void
    maxLabels?: number
    maxLength?: number
    "aria-describedby"?: string
    "aria-invalid"?: boolean
}

export function LabelsInput({ id, value, onChange, maxLabels = 10, maxLength = 30, ...aria }: LabelsInputProps) {
    const [draft, setDraft] = useState("")
    const [hint, setHint] = useState<string | null>(null)

    function addDraft() {
        const label = draft.trim()
        if (!label) return
        if (label.length > maxLength) return setHint(`Labels can be up to ${maxLength} characters`)
        if (value.some((existing) => existing.toLowerCase() === label.toLowerCase())) {
        return setHint("That label is already added")
        }
        if (value.length >= maxLabels) return setHint(`At most ${maxLabels} labels`)

        onChange([...value, label])
        setDraft("")
        setHint(null)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.nativeEvent.isComposing) return // an IME is still choosing characters

        // Enter on an empty field is left alone, so it submits the form like in any other field.
        if (event.key === "Enter" && draft.trim() === "") return

        if (event.key === "Enter" || event.key === ",") {
        event.preventDefault() // Enter must add a label, not submit the whole form
        addDraft()
        } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
        onChange(value.slice(0, -1))
        }
    }

    return (
        <div>
        <div
            className={cn(
            "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
            aria["aria-invalid"] && "border-destructive-text",
            )}
        >
            {value.map((label) => (
            <span
                key={label}
                className="inline-flex items-center gap-1 rounded bg-secondary py-0.5 pr-0.5 pl-1.5 text-xs text-secondary-foreground"
            >
                {label}
                <button
                type="button"
                onClick={() => onChange(value.filter((existing) => existing !== label))}
                aria-label={`Remove label ${label}`}
                className="rounded p-0.5 outline-none hover:bg-background/60 focus-visible:ring-2 focus-visible:ring-ring"
                >
                <X className="size-3" aria-hidden="true" />
                </button>
            </span>
            ))}

            <input
            id={id}
            value={draft}
            onChange={(event) => {
                setDraft(event.target.value)
                if (hint) setHint(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Type a label and press Enter" : ""}
            autoComplete="off"
            className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            {...aria}
            />
        </div>

        {hint && (
            <p role="alert" className="mt-1.5 text-sm text-destructive-text">
            {hint}
            </p>
        )}
        </div>
    )
}