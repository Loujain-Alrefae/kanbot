import { cn } from "@/lib/utils"
import type { Sprint } from "@/types/api"

const STYLES: Record<Sprint["status"], { label: string; className: string }> = {
    planned: { label: "Planned", className: "border-border bg-card text-foreground" },
    active: { label: "Active", className: "border-transparent bg-primary text-primary-foreground" },
    completed: { label: "Completed", className: "border-border bg-secondary text-secondary-foreground" },
}

/* The text is always shown, so the status never depends on color alone (NFR-5). */
export function SprintStatusBadge({ status }: { status: Sprint["status"] }) {
    const { label, className } = STYLES[status]
    return (
        <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium", className)}>
        {label}
        </span>
    )
}