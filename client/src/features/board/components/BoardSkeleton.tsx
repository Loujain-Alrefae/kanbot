import { Skeleton } from "@/components/ui/skeleton"

export function BoardSkeleton() {
    return (
        <div aria-busy="true" className="space-y-4">
        <span className="sr-only">Loading board…</span>

        <div className="space-y-3 rounded-lg border bg-card p-4">
            <Skeleton className="h-5 w-48 bg-secondary" />
            <Skeleton className="h-4 w-80 max-w-full bg-secondary" />
            <Skeleton className="h-2 w-full bg-secondary" />
        </div>

        <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-4 overflow-x-auto">
            {Array.from({ length: 4 }, (_, column) => (
            <div key={column} className="min-h-64 space-y-2 rounded-lg bg-muted p-3">
                <Skeleton className="mb-3 h-4 w-24 bg-border" />
                {Array.from({ length: 3 - (column % 2) }, (_, card) => (
                <div key={card} className="space-y-2 rounded-lg border bg-card p-3">
                    <Skeleton className="h-3 w-12 bg-secondary" />
                    <Skeleton className="h-4 w-full bg-secondary" />
                    <Skeleton className="h-5 w-28 bg-secondary" />
                </div>
                ))}
            </div>
            ))}
        </div>
        </div>
    )
}