import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
    message?: string
    onRetry?: () => void
}

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) {
    return (
        <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center"
        >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">We couldn&apos;t load this</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry && (
            <Button variant="outline" className="mt-5" onClick={onRetry}>
            Try again
            </Button>
        )}
        </div>
    )
}