import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"


export function ErrorScreen() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
        <div role="alert" className="w-full max-w-md text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive-subtle text-destructive-text">
            <AlertTriangle className="size-8" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-3 text-muted-foreground">
            An unexpected error stopped this page. Reloading usually fixes it, and your data is safe.
            </p>
            <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
            <a
                href="/projects"
                className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-accent"
            >
                Back to projects
            </a>
            <Button type="button" onClick={() => window.location.reload()}>
                Reload
            </Button>
            </div>
        </div>
        </main>
    )
}