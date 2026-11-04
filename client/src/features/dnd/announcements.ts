import type { Announcements, UniqueIdentifier } from "@dnd-kit/core"

export const KEYBOARD_INSTRUCTIONS =
    "To pick up a todo, press Space or Enter on its drag handle. Use the arrow keys to move it, Space or Enter to drop it, and Escape to cancel."

interface Describe {
    /** "KAN-14 Dark mode toggle" */
    label: (id: UniqueIdentifier) => string
    /** "position 3 of 9" */
    place: (id: UniqueIdentifier) => string
}

/* Screen-reader messages in plain English, with todo keys instead of internal ids. */
export function buildAnnouncements({ label, place }: Describe): Announcements {
    return {
        onDragStart: ({ active }) => `Picked up ${label(active.id)}, ${place(active.id)}.`,
        onDragOver: ({ active, over }) =>
        over ? `${label(active.id)} is now at ${place(over.id)}.` : `${label(active.id)} is not over a drop area.`,
        onDragEnd: ({ active, over }) =>
        over ? `Dropped ${label(active.id)} at ${place(over.id)}.` : `Dropped ${label(active.id)}. It was not moved.`,
        onDragCancel: ({ active }) => `Dragging cancelled. ${label(active.id)} was not moved.`,
    }
}