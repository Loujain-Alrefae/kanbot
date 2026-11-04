import { MoreHorizontal } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { STATUS_OPTIONS } from "@/lib/todo"
import { cn } from "@/lib/utils"
import type { Todo, TodoStatus } from "@/types/api"

interface TodoCardMenuProps {
    todo: Todo
    onMove: (todo: Todo, status: TodoStatus) => void
}

/* The non-drag way to change a card's status (SPR-5): works with the keyboard and with a screen reader. */
export function TodoCardMenu({ todo, onMove }: TodoCardMenuProps) {
    return (
        <DropdownMenu>
        <DropdownMenuTrigger
            aria-label={`Actions for ${todo.key}`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-7")}
        >
            <MoreHorizontal className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-48">
            {STATUS_OPTIONS.map(({ value, label }) => {
            const isCurrent = value === todo.status
            return (
                <DropdownMenuItem key={value} disabled={isCurrent} onClick={() => onMove(todo, value)}>
                {isCurrent ? `${label} (current)` : `Move to ${label}`}
                </DropdownMenuItem>
            )
            })}
        </DropdownMenuContent>
        </DropdownMenu>
    )
}