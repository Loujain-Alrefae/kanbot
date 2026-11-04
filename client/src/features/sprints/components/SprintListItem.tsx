import { Link } from "react-router"
import { displayStats } from "@/lib/sprint"
import { formatDateRange } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Sprint } from "@/types/api"
import { SprintStatusBadge } from "./SprintStatusBadge"

interface SprintListItemProps {
    sprint: Sprint
    selected: boolean
}

export function SprintListItem({ sprint, selected }: SprintListItemProps) {
    const stats = displayStats(sprint)

    return (
        <Link
        to={`/projects/${sprint.projectId}/sprints/${sprint.id}`}
        aria-current={selected ? "page" : undefined}
        className={cn(
            "block rounded-lg border bg-card p-4 text-card-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
            selected && "bg-accent ring-2 ring-primary",
        )}
        >
        <div className="flex items-start justify-between gap-3">
            <span className="font-medium">{sprint.name}</span>
            <SprintStatusBadge status={sprint.status} />
        </div>
        <div className="mt-2 flex items-end justify-between gap-3 text-sm text-muted-foreground">
            <span>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
            <span className="tabular-nums">
            {stats.donePoints}/{stats.totalPoints} pts
            </span>
        </div>
        </Link>
    )
}