import { KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { KEYBOARD_INSTRUCTIONS, buildAnnouncements } from "@/features/dnd/announcements"
import { useAnnounceMove } from "@/hooks/useAnnounceMove"
import { useDraft } from "@/hooks/useDraft"
import { todoKeys } from "@/hooks/useTodos"
import { moveInList } from "@/lib/board"
import { END_OF_LIST } from "@/lib/todo"
import type { Todo } from "@/types/api"
import { useReorderBacklog } from "./useReorderBacklog"

interface Options {
    projectId: string
    /** The backlog list as the cache has it (it may be a filtered list: then dragging is switched off by the rows). */
    todos: Todo[]
}

export function useBacklogReorder({ projectId, todos }: Options) {
    const queryClient = useQueryClient()
    const { shown, setDraft } = useDraft(todos)
    const reorder = useReorderBacklog(projectId)
    const announceMove = useAnnounceMove()

    // Pointer: distance 6 so a click on the handle is not a drag. Keyboard: Space/Enter picks up, arrows move,
    // Space/Enter drops, Escape cancels. It works because every row has a real handle button.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    // Index of a todo in the FULL (unfiltered) backlog, read BEFORE the optimistic update changes the cache.
    // null = unknown, then the move still works but no Undo is offered.
    function originIndex(id: string): number | null {
        const full = queryClient.getQueryData<Todo[]>(todoKeys.backlog(projectId, {}))
        const index = full?.findIndex((todo) => todo.id === id) ?? -1
        return index === -1 ? null : index
    }

    // Success toast with Undo. Undo sends the todo back to its old index (the todo stays in the backlog, so no sprintId).
    function announce(todo: Todo, from: number | null, message: string) {
        if (from === null) toast.success(message)
        else announceMove(todo, { status: todo.status, position: from }, message)
    }

    function handleDragEnd({ active, over }: DragEndEvent) {
        if (!over || active.id === over.id) return

        const id = String(active.id)
        const to = shown.findIndex((todo) => todo.id === over.id)
        const todo = shown.find((item) => item.id === id)
        if (to === -1 || !todo) return

        const from = originIndex(id)

        // `to` is the dragged todo's final index, which is also the API's `position` (index after taking it out).
        setDraft(moveInList(shown, id, to)) // keep showing the new order until the optimistic update lands
        reorder.mutate(
        { id, body: { position: to } },
        { onSuccess: () => announce(todo, from, `${todo.key} reordered`) },
        )
    }

    // The keyboard alternative to dragging (BL-5). It always works on the full backlog: top = 0, bottom = the end.
    function moveToEdge(todo: Todo, edge: "top" | "bottom") {
        const from = originIndex(todo.id)
        reorder.mutate(
        { id: todo.id, body: { position: edge === "top" ? 0 : END_OF_LIST } },
        { onSuccess: () => announce(todo, from, `${todo.key} moved to the ${edge} of the backlog`) },
        )
    }

    const label = (id: UniqueIdentifier) => {
        const todo = shown.find((item) => item.id === id)
        return todo ? `${todo.key} ${todo.title}` : "todo"
    }
    const place = (id: UniqueIdentifier) => `position ${shown.findIndex((item) => item.id === id) + 1} of ${shown.length}`

    return {
        /** Render these: the new order right after a drop, otherwise the cache. */
        todos: shown,
        moveToEdge,
        contextProps: {
        sensors,
        collisionDetection: closestCenter,
        onDragEnd: handleDragEnd,
        accessibility: {
            announcements: buildAnnouncements({ label, place }),
            screenReaderInstructions: { draggable: KEYBOARD_INSTRUCTIONS },
        },
        },
    }
}