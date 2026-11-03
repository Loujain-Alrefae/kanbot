import { cn } from "@/lib/utils"

interface LabelChipsProps {
    labels: string[]
    /** How many chips to show before collapsing the rest into "+N". */
    max?: number
    className?: string
}

const CHIP = "rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"

export function LabelChips({ labels, max = 2, className }: LabelChipsProps) {
    if (labels.length === 0) return null

    const visible = labels.slice(0, max)
    const hidden = labels.slice(max)

    return (
        <ul className={cn("flex flex-wrap items-center gap-1", className)} aria-label="Labels">
        {visible.map((label) => (
            <li key={label} className={CHIP}>
            {label}
            </li>
        ))}
        {hidden.length > 0 && (
            <li className={CHIP} title={hidden.join(", ")}>
            +{hidden.length}
            <span className="sr-only"> more: {hidden.join(", ")}</span>
            </li>
        )}
        </ul>
    )
}