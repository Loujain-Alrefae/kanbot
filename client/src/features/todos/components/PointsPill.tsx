import { cn } from "@/lib/utils"
import type { StoryPoints } from "@/types/api"

interface PointsPillProps {
    points: StoryPoints | null
    className?: string
}

export function PointsPill({ points, className }: PointsPillProps) {
    return (
        <span
        className={cn(
            "inline-flex min-w-12 items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-secondary-foreground",
            className,
        )}
        >
        {points === null ? (
            <>
            <span aria-hidden="true">–</span>
            <span className="sr-only">Not estimated</span>
            </>
        ) : (
            `${points} ${points === 1 ? "pt" : "pts"}`
        )}
        </span>
    )
}