import { PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core"
import type { Active, DragEndEvent, DragOverEvent, DragStartEvent, Over, UniqueIdentifier } from "@dnd-kit/core"
import { useState } from "react"
import { useDraft } from "@/hooks/useDraft"
import { locateInColumns, moveInColumns } from "@/lib/board"
import type { BoardColumns } from "@/lib/board"
import { TODO_STATUSES } from "@/types/api"
import type { Todo, TodoStatus } from "@/types/api"

interface Options {
  /** The board as the cache has it. */
  columns: BoardColumns
  /** Called once per real move. Never when a card is dropped where it started. */
  onMove: (todo: Todo, status: TodoStatus, position: number) => void
}

/* A column is a drop target too (so an EMPTY column accepts cards). Its id is the status name. */
function isStatus(id: UniqueIdentifier): id is TodoStatus {
  return TODO_STATUSES.some((status) => status === id)
}

/* What a drop target means: a column (index null = the column itself) or a card (its column and index). */
function resolveTarget(columns: BoardColumns, overId: UniqueIdentifier): { status: TodoStatus; index: number | null } | null {
  if (isStatus(overId)) return { status: overId, index: null }
  const spot = locateInColumns(columns, String(overId))
  return spot ? { status: spot.status, index: spot.index } : null
}

/* The board as it would look if the dragged card were dropped on `over` right now. */
function placeCard(columns: BoardColumns, active: Active, over: Over): BoardColumns {
  const id = String(active.id)
  const from = locateInColumns(columns, id)
  const target = resolveTarget(columns, over.id)
  if (!from || !target) return columns

  // On a column itself (its empty area): the end of that column.
  if (target.index === null) return moveInColumns(columns, id, target.status, columns[target.status].length)

  // On a card of the same column: take that card's index. moveInColumns counts the index AFTER taking the
  // dragged card out, which is exactly where the card ends up.
  if (target.status === from.status) return moveInColumns(columns, id, target.status, target.index)

  // On a card of ANOTHER column: before or after it, depending on which half of it the dragged card's centre is in.
  const moved = active.rect.current.translated
  const below = moved !== null && moved.top + moved.height / 2 > over.rect.top + over.rect.height / 2
  return moveInColumns(columns, id, target.status, target.index + (below ? 1 : 0))
}

export function useBoardDnd({ columns, onMove }: Options) {
  const { shown, setDraft, clearDraft } = useDraft(columns)
  const [activeId, setActiveId] = useState<string | null>(null)

  // distance: 6 means a plain click (open the card, open its menu) never turns into a drag.
  // No KeyboardSensor here: the card menu is the keyboard way to move a card, and a card has no drag handle.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const activeTodo = activeId ? (TODO_STATUSES.flatMap((s) => shown[s]).find((t) => t.id === activeId) ?? null) : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const from = locateInColumns(shown, String(active.id))
    const target = resolveTarget(shown, over.id)
    // Inside the same column the sortable list animates the gap by itself and the drop decides.
    // Only crossing into another column changes the copy, so the cards there make room.
    if (!from || !target || from.status === target.status) return
    setDraft(placeCard(shown, active, over))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const id = String(active.id)
    setActiveId(null)

    // Dropped outside every column: treat it as a cancel.
    if (!over) {
      clearDraft()
      return
    }

    const start = locateInColumns(columns, id) // where the card was before the drag: the cache, not the copy
    const final = placeCard(shown, active, over)
    const end = locateInColumns(final, id)

    // Same place as before (or something odd): nothing to send.
        if (!start || !end || (start.status === end.status && start.index === end.index)) {
        clearDraft()
        return
        }

        setDraft(final) // keep showing the result until the optimistic update lands in the cache
        onMove(columns[start.status][start.index], end.status, end.index)
    }

    function handleDragCancel() {
        setActiveId(null)
        clearDraft()
    }

    return {
        /** Render these: the copy while dragging, otherwise the cache. */
        columns: shown,
        /** The card being dragged, for the overlay. */
        activeTodo,
        contextProps: {
        sensors,
        collisionDetection: closestCorners,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: handleDragEnd,
        onDragCancel: handleDragCancel,
        },
    }
}