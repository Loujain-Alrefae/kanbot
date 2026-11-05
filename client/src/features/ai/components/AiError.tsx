import { AlertCircle, RotateCw } from "lucide-react"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TITLES: Record<string, string> = {
    RATE_LIMITED: "Too many requests",
    AI_ERROR: "The AI couldn't answer",
    TIMEOUT: "The AI took too long",
}

interface AiErrorProps {
    error: Error
    onRetry: () => void
    /** true while the retry is running, so the button can't be pressed twice. */
    retrying?: boolean
    className?: string
    }

    /* One error box for every AI action: the server's own message plus "Try again" (AI-5). */
    export function AiError({ error, onRetry, retrying = false, className }: AiErrorProps) {
    const code = error instanceof ApiError ? error.code : undefined
    const title = (code && TITLES[code]) ?? "Something went wrong"

    return (
        <div
        role="alert"
        className={cn(
            "space-y-2 rounded-md border border-destructive-text/30 bg-destructive-subtle p-3 text-sm text-destructive-text",
            className,
        )}
        >
        <p className="flex items-center gap-2 font-medium">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {title}
        </p>
        <p className="wrap-break-word">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
        </Button>
        </div>
    )
    }