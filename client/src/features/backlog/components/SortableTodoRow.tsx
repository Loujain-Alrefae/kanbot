import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandle } from "@/components/DragHandle"
import type { Sprint, Todo } from "@/types/api"
import { TodoRow } from "./TodoRow"

interface SortableTodoRowProps {
    todo: Todo
    moveTargets: Sprint[]
    onOpen: (todo: Todo) => void
    /** true while a search or filter is active: the handle is shown but switched off. */
    dragDisabled: boolean
    listPosition: { index: number; count: number } | null
    onMoveToEdge: (todo: Todo, edge: "top" | "bottom") => void
    }

    export function SortableTodoRow({ todo, dragDisabled, ...rowProps }: SortableTodoRowProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: todo.id,
        disabled: dragDisabled,
    })

    // Vertical movement only, and never stretched: rows differ in height and a list should not wobble sideways.
    const style = {
        transform: CSS.Transform.toString(transform ? { ...transform, x: 0, scaleX: 1, scaleY: 1 } : null),
        transition,
    }

    return (
        <TodoRow
        todo={todo}
        {...rowProps}
        rowRef={setNodeRef}
        style={style}
        dragging={isDragging}
        handle={
            dragDisabled ? (
            <DragHandle label={`Reorder ${todo.key} (unavailable while filtering)`} disabled />
            ) : (
            <DragHandle label={`Reorder ${todo.key}`} handleRef={setActivatorNodeRef} {...attributes} {...listeners} />
            )
        }
        />
    )
}