import { useAiStatus } from "@/hooks/useAi"

/* "Mock AI" only when the server runs the built-in mock. Nothing while loading, on failure, or in real-AI mode. */
export function AiBadge() {
    const status = useAiStatus()
    if (status.data?.mode !== "mock") return null

    return (
        <span className="inline-flex items-center rounded-md border border-border bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
        Mock AI
        </span>
    )
}