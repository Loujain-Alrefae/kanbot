# Day 4: Board, Drag and Drop, Completing Sprints and History (Feature Reference)

**Scope:** the active sprint board, moving cards (menu and drag and drop), reordering the backlog, completing a sprint and the sprint history.
**Requirements covered:** SPR-4, SPR-5, SPR-6, SPR-7, BL-5. **Extras:** undo after moving a todo, due-date indicators.
**Status:** complete and verified manually.

This document describes, feature by feature, what was implemented, where it lives and how to verify it.

## At a glance

| Feature | Requirement | Main files |
|---|---|---|
| 1. Board data layer and helpers | SPR-4 … SPR-6 | `api/sprints.ts`, `hooks/useSprints.ts`, `lib/board.ts`, `lib/optimisticMove.ts` |
| 2. Active sprint board | SPR-4 | `BoardPage.tsx`, `SprintHeader.tsx`, `BoardColumn.tsx`, `TodoCard.tsx` |
| 3. Moving cards without dragging | SPR-5 | `TodoCardMenu.tsx`, `useBoardMove.ts` |
| 4. Drag and drop on the board | SPR-5 | `BoardPage.tsx`, `BoardColumn.tsx`, `TodoCard.tsx` |
| 5. Reordering the backlog | BL-5 | `useReorderBacklog.ts`, `BacklogSection.tsx`, `TodoRow.tsx`, `TodoRowMenu.tsx` |
| 6. Complete sprint | SPR-6 | `CompleteSprintDialog.tsx` |
| 7. Sprints history | SPR-7 | `SprintsPage.tsx`, `SprintListItem.tsx`, `SprintDetails.tsx`, `StatTile.tsx` |
| 8. Extras | extras | `lib/dates.ts`, `DueDateBadge.tsx`, undo toasts |

---

## 1. Board data layer and helpers

**What was implemented**
- `sprintsApi.board(id)` (`GET /sprints/:id/todos`, returns the sprint and its four columns) and `sprintsApi.complete(id, body)` (`POST /sprints/:id/complete`).
- `useActiveSprint(projectId)` finds the active sprint from the same sprint-list query the Backlog already uses (`select`), so it costs no extra request. `useSprintBoard(sprintId)` uses the key `["sprints", "board", sprintId]`, which starts with `["sprints"]` and is therefore refreshed by the usual invalidation. `useCompleteSprint()` completes a sprint.
- **`lib/board.ts`** holds two pure functions:
  - `moveInColumns(columns, todoId, toStatus, toIndex)` returns new columns without mutating the input.
  - `boardTotals(columns)` returns total and done todos and points. The progress bar and the complete dialog use it instead of `sprint.stats`, because those statistics are stale until the refetch ends, and progress must update instantly.
- **`lib/optimisticMove.ts`** holds the shared optimistic-update skeleton (cancel queries, snapshot, apply, roll back on error, refetch). It is used by the board, the backlog and the menu moves, so the logic is written once.
- `daysLeftLabel(endDate)` in `lib/format.ts`: "6 days left", "Ends today" or "Overdue by 2 days".

## 2. Active sprint board (SPR-4)

**Behavior**
- Header: sprint name (in the display font), date range with days left, the goal, and a **progress bar** with the text "21 / 34 pts done". The bar has `role="progressbar"` with `aria-valuenow`, and the number is shown in text, so it never relies on color.
- Four columns in a fixed order (To Do, In Progress, In Review, Done), each with a count and its cards. A card shows the key, title, type, priority and points. Clicking a card opens the todo details dialog from Day 3.
- **Lane styling:** in light mode each lane has its own tint (`--lane-*`); in dark mode all lanes share one neutral surface and get a 3 px top line in the status color (the same as the status dot beside the lane title), which follows the lane's rounded corners.
- **Complete sprint** button in the header (opens the dialog of feature 6).
- **No active sprint:** an empty state with a link to the Backlog, where a sprint can be started.
- Loading shows skeleton columns; an error shows the error state alone.
- On screens narrower than 768 px the columns scroll horizontally, each with a fixed width.

## 3. Moving cards without dragging (alternative for SPR-5)

- Each card has an actions menu with **Move to To Do / In Progress / In Review / Done**; the current status is disabled. The card goes to the **end** of the target column, the same as changing the status in the details dialog.
- **Optimistic update:** the card moves on screen immediately, then the request is sent. On failure the previous state is restored and a toast explains it.
- Moves run **one at a time** (a mutation scope), and the data is refetched only after the last pending move, so a failed move cannot erase a later one and a card never jumps back for a moment.

## 4. Drag and drop on the board (SPR-5)

- Built with `@dnd-kit`: a `DndContext`, a `SortableContext` per column and a droppable area per column, so an **empty column accepts drops**.
- `PointerSensor` with an activation distance of 6 px, so a plain click still opens the card. **Keyboard dragging is deliberately not enabled on board cards:** a card contains two interactive elements (title and menu), so making it the keyboard drag source would nest buttons. The keyboard path is the card menu above.
- A **drag overlay** follows the pointer while the original card fades.
- During the drag a temporary copy of the columns is updated in `onDragOver` with `moveInColumns`, so cards open a gap as the pointer moves. It is the only server data copied into component state, and it is discarded after the drop.
- On drop the target status and index are sent to `POST /todos/:id/move`. Dropping a card in place sends nothing. If the request fails, the card returns to its place with a toast.

## 5. Reordering the backlog (BL-5)

- Each backlog row has a **drag handle** (a button with an accessible label). Only the handle starts a drag; clicking the rest of the row opens the details.
- Sensors: pointer, plus the keyboard sensor, which is safe here because the handle is a separate element (Space to pick up, arrows to move, Space to drop, Esc to cancel).
- The reorder is optimistic on the unfiltered backlog query and rolls back on failure.
- **Non-drag alternative:** the row menu has **Move to top** and **Move to bottom**.
- While a search or filter is active, dragging is disabled and the text "Clear filters to reorder" explains why, because reordering a filtered list would be ambiguous.

## 6. Complete sprint (SPR-6)

- The dialog shows how many todos are done and how many are not finished, and "N of M story points completed", all computed from the board columns.
- **Move unfinished to:** Backlog (default) or any planned sprint, listed by name. If every todo is done, the choice is replaced by a short message.
- **Complete sprint** sends `POST /sprints/:id/complete` with `moveUnfinishedTo`. The dialog cannot be closed while the request runs.
- On success: a toast, then the app opens `/projects/:id/sprints/:sprintId`, the summary page of the sprint that was just completed.
- The "Generate AI summary" option was added on Day 5.

## 7. Sprints history (SPR-7)

- Route `/projects/:id/sprints/:sprintId?`. **The selected sprint lives in the URL**, so after completing a sprint the app can open it directly and a reload keeps it. The sidebar's Sprints link stays highlighted on the nested route.
- **Left:** the list of sprints (active first, then planned, then completed newest first). Each item shows the name, a status badge with text (Planned, Active, Completed), the dates and `done/total pts`.
- **Right:** the selected sprint: name, status, goal and dates; four stat tiles (**Completed todos**, **Points done**, **Carried over**, **Completion %**, based on points); and the list of the sprint's todos. The AI summary card was added on Day 5.
- Loading, empty ("No sprints yet") and error states are all handled.

## 8. Extras

- **Undo after moving a todo.** After a move from a menu or by drag and drop, a toast reads "Moved to … · Undo". Undo moves the todo back to its previous status, sprint and position. It exists for moves only: deleting cannot be undone cleanly, because re-creating a todo gives it a new key, and keys never change.
- **Due-date indicators.** Rows and cards show "Overdue · Nov 3", "Due today" or "Due Nov 20", each with its own icon and a text label (never color alone). Color is spent only where attention is needed: overdue is rose (so it never reads as "urgent" priority), due today is amber, and a date that is still far away stays neutral. The indicator is hidden once a todo is done. The date logic is a pure helper in `lib/dates.ts`.

---

## Verification

| Test | Expected | Result |
|---|---|---|
| Open the board of an active sprint | Name, dates, days left, goal, progress, four columns | Pass |
| Project without an active sprint | "No active sprint" with a link to the Backlog | Pass |
| Move a card with its menu | It moves at once and goes to the end of the target column | Pass |
| Drag between columns, inside a column, into an empty column | Cards open a gap; the order survives a reload | Pass |
| Drop a card where it was | No request is sent | Pass |
| Stop the server and move or drag a card | The card returns and an error toast appears | Pass |
| Move a card to Done | The progress bar and numbers update immediately | Pass |
| Two quick moves where the first fails | The first is restored; the second is unaffected | Pass |
| Reorder the backlog by dragging; use Move to top / bottom | Order changes and persists | Pass |
| Type a search, then try to drag | Dragging is disabled with an explanation | Pass |
| Complete a sprint, unfinished to Backlog and to a planned sprint | Todos land in the chosen place | Pass |
| After completing | The summary page of that sprint opens; it survives a reload | Pass |
| Sprints page | Ordered list; details and tiles match the sprint | Pass |
| Undo after a move; due-date indicators | Todo returns; indicators show icon and text | Pass |
| Window narrower than 768 px | Board columns scroll horizontally | Pass |

## Decisions

| Decision | Reason |
|---|---|
| Progress is computed from the board columns | `sprint.stats` is stale until the refetch finishes |
| Moves are serialized and refetched only after the last one | Prevents flicker and lost optimistic updates |
| Selected sprint in the URL | Direct link after completing, survives reload |
| No keyboard dragging on board cards | Avoids nested interactive elements; the menu covers keyboard users |
| Backlog dragging disabled while filtering | Reordering a filtered list is ambiguous |
| Undo for moves only | Deleting would change the todo's key |
