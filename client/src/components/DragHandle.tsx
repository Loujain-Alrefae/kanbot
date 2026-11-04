import { GripVertical } from "lucide-react"
import type { ComponentPropsWithoutRef, Ref } from "react"
import { cn } from "@/lib/utils"

interface DragHandleProps extends ComponentPropsWithoutRef<"button"> {
    /** What a screen reader says, e.g. "Reorder KAN-14". */
    label: string
    /** dnd-kit's activator ref: keyboard focus returns to this element after a drop. */
    handleRef?: Ref<HTMLButtonElement>
}

export function DragHandle({ label, handleRef, className, ...props }: DragHandleProps) {
    return (
        <button
        ref={handleRef}
        type="button"
        aria-label={label}
        className={cn(
            "flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
            className,
        )}
        {...props}
        >
        <GripVertical className="size-4" aria-hidden="true" />
        </button>
    )
}