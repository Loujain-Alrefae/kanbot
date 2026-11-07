# Day 3: Backlog, Todo Details and Planned Sprints (Feature Reference)

**Scope:** the todo and sprint data layer, the Backlog page with its tools, the todo details dialog, and planned sprints.
**Requirements covered:** BL-1, BL-2, BL-3, BL-4, BL-6, BL-7, SPR-1, SPR-2, SPR-3 (BL-5 follows on Day 4).
**Status:** complete and verified manually.

This document describes, feature by feature, what was implemented, where it lives and how to verify it.

## At a glance

| Feature | Requirement | Main files |
|---|---|---|
| 1. Todo and sprint data layer | all | `api/todos.ts`, `api/sprints.ts`, `hooks/useTodos.ts`, `hooks/useSprints.ts`, `hooks/useInvalidateWork.ts`, `hooks/useDebouncedValue.ts` |
| 2. Todo presentation components | NFR-5 | `TypeIcon`, `PriorityBadge`, `PointsPill`, `LabelChips`, `lib/todo.ts`, `lib/format.ts` |
| 3. Backlog list | BL-1 | `BacklogPage.tsx`, `BacklogSection.tsx`, `TodoRow.tsx` |
| 4. Quick create | BL-2 | `QuickCreate.tsx` |
| 5. Search and filters | BL-6 | `BacklogToolbar.tsx` |
| 6. Todo details dialog | BL-3, BL-4 | `TodoDetailsDialog.tsx`, `todo-details/` |
| 7. Row menu and moving todos | BL-4, BL-7 | `TodoRowMenu.tsx` |
| 8. Planned sprints | SPR-1, SPR-2 | `SprintSection.tsx`, `SprintDialog.tsx`, `sprint-form/` |
| 9. Start sprint | SPR-3 | `StartSprintDialog.tsx` |

---

## 1. Todo and sprint data layer

**What was implemented**
- `api/todos.ts`: `list(projectId, query)` builds a query string that skips empty values; `create`, `update`, `remove`, and `move` (`POST /todos/:id/move`, where `position` is the index in the target list after the dragged todo is removed).
- `api/sprints.ts`: `list`, `create`, `update`, `remove`, `start`. Envelopes (`{ todos }`, `{ sprint }`) are unwrapped so components receive plain data.
- **Two todo queries run in parallel**, so there is no request chain:
  - `useAllTodos(projectId)`: every todo of the project, unfiltered. It feeds the planned-sprint sections and the "Move to" targets. Key `["todos", projectId, "all"]`.
  - `useBacklogTodos(projectId, filters)`: the backlog only, with search, priority and type applied by the server. Key `["todos", projectId, "backlog", filters]`; `keepPreviousData` keeps the list on screen while a new search loads.
- `useInvalidateWork` refreshes `todos`, `sprints` and `projects` after any todo or sprint change (counters and statistics change in all three) and returns the promise, so a mutation stays pending until fresh data arrives.
- Mutation hooks: `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`, `useMoveTodo`, `useCreateSprint`, `useUpdateSprint`, `useDeleteSprint`, `useStartSprint`. Each shows a toast on success; the move and start hooks do not, because the caller knows what was moved or started.
- `useDebouncedValue(value, 300)` delays the search text before it is sent.

**How to verify:** open the Backlog and check the Network tab: the two todo requests and the sprint request start together.

## 2. Todo presentation components

- **`TypeIcon`:** an icon plus the text Story, Task or Bug.
- **`PriorityBadge`:** Low (▾), Medium (▬), High (▴) and Urgent (▲), each with its own icon and label, so priority never depends on color alone. Each priority has a background, text and border token (`--prio-*`) in both themes: Urgent is red, High orange, Medium blue and Low neutral gray.
- **`PointsPill`:** "5 pts", "1 pt", or "–" when the todo is not estimated.
- **`LabelChips`:** the todo's labels as small chips.
- Ticket keys use `.ticket-key` (tabular numbers), so `KAN-2` and `KAN-10` line up in a column.
- `lib/todo.ts` holds the option lists and display names (types, priorities, statuses, story points). `lib/format.ts` formats date ranges such as `Oct 20 – Nov 2` with `date-fns`.

## 3. Backlog list (BL-1)

**Behavior**
- Page header with the title and a summary (`N todos · M pts`).
- A "Backlog" section header with its own count and points, then one row per todo, ordered by the server's `order`. Group headers (sprints and backlog) use `--list-head`, a cool slate tint that differs from both the page and the rows.
- Each row shows the key (tabular numbers), title, labels, type, priority, points and a `···` menu. Clicking a row opens the details dialog.
- **Loading:** skeleton rows. **Empty:** "Your backlog is empty" with a Create todo button that focuses the quick-create field. **Error:** the error state alone; stale cached data is never shown beside it.

## 4. Quick create (BL-2)

- A "+ Create todo" field below the list. Typing a title and pressing **Enter** creates a task with medium priority and no points.
- **Focus stays in the field** (the input is never disabled while the request runs; a repeated Enter is ignored while pending), so several todos can be added in a row.
- **Escape** clears the field. An empty title or more than 200 characters shows an error under the field and sends no request.
- The field is cleared immediately; if the request fails the text comes back (unless the user already typed something new) with the server's message under the field.
- Success shows the toast "Todo created", and the header counts update.

## 5. Search and filters (BL-6)

- A search box (key, title, description and labels, matched by the server), a priority filter ("All priorities") and a type filter ("All types").
- The search text is **debounced by 300 ms**, so typing does not send a request per character.
- The search box and the selects sit on the field surface so they lift off the page; the AI actions in the toolbar (Day 5) use the indigo tint.
- Zero results caused by a filter show "No todos match your filters" with **Clear filters**. This is a different state from an empty backlog.

## 6. Todo details dialog (BL-3, BL-4)

**Behavior**
- Header: the key badge (for example `KAN-15`) and `Story · created Oct 30`, plus a close button.
- Fields: **Title**, **Description**, **Status**, **Priority**, **Type**, **Story points** (1, 2, 3, 5, 8, 13 or none), **Sprint** (Backlog, planned sprints, the active sprint), **Labels** (type and press Enter to add a chip; at most 10, each up to 30 characters) and **Due date** (native date input).
- **Save** sends `PATCH /todos/:id`; server validation errors appear under their fields.
- **Discard changes?** is asked only when the form has unsaved changes and the user closes the dialog (X, Esc or backdrop).
- **Delete** asks for confirmation, then removes the todo.
- The dialog is a single scrolling column on narrow screens with a fixed footer; the body uses the `ScrollShadow` component: a soft shadow at the bottom edge while more content is hidden below.
- The same dialog is reused by the board on Day 4.

## 7. Row menu and moving todos (BL-4, BL-7)

- The `···` menu of each row lists **Move to <sprint>** for every planned or active sprint, **Move to Backlog** (when the todo is in a sprint) and **Delete** (with confirmation).
- Moving calls `POST /todos/:id/move` with a large `position`, which the server clamps, so the todo lands at the end of the target list. A toast says where it went ("Moved to Sprint 4").
- The Sprint field of the details dialog does the same move through a normal save.

## 8. Planned sprints (SPR-1, SPR-2)

- A **+ Create sprint** button opens a dialog: name (optional, the server generates "Sprint N"), goal (up to 300 characters), start and end dates (the end cannot be before the start).
- Each planned sprint is a **collapsible section above the Backlog** (`aria-expanded`), with its name, status, date range, number of todos and points, and **Edit** and **Start sprint** buttons. Its todos use the same row component as the backlog.
- **Edit** reuses the same dialog. **Delete** asks for confirmation and explains that the sprint's todos return to the backlog. Deleting is offered for planned sprints only.
- The **Edit** button of a sprint section is an outline button on the field surface (`.btn-surface`), so it reads clearly on the slate group header.

## 9. Start sprint (SPR-3)

- **Start sprint** opens a dialog with the start date set to today and the end date 14 days later.
- If another sprint is already active the button is disabled and the reason is shown ("Sprint 3 is already active"). A `409` from the server is also shown clearly.
- On success a toast appears and the app opens the board (`/projects/:id/board`).

---

## Verification

| Test | Expected | Result |
|---|---|---|
| Open the Backlog of the demo project | Todos ordered, counts correct in both headers | Pass |
| Create five todos with Enter, without touching the mouse | Focus stays; each appears at the end | Pass |
| Empty title, 201-character title | Error under the field; no request | Pass |
| Search by key, title, description and label | Matching todos only; one request after typing stops | Pass |
| Priority and type filters, then Clear filters | Filters apply and reset | Pass |
| Edit every field in the details dialog and save | Values appear in the list | Pass |
| Change a field and close the dialog | "Discard changes?" | Pass |
| Close without changes | No question | Pass |
| Delete a todo (dialog and row menu) | Confirmation, then it disappears | Pass |
| Move a todo to a sprint and back | Appears in the sprint section, returns to the backlog | Pass |
| Create, edit and delete a planned sprint | Section appears, updates, todos go back to the backlog | Pass |
| Start a sprint; try to start a second one | Opens the board; the second button is disabled with a reason | Pass |
| Stop the server on the Backlog | Error state only, Try again recovers | Pass |

## Issues found and fixed

| Issue | Cause | Fix |
|---|---|---|
| TypeScript error: `count` does not exist on `PageHeader` | The component only defines `title`, `meta` and `actions` | The summary is passed as `meta` |
| Stale list shown next to an error after the server stopped | TanStack Query keeps the last successful data | Pages render the error state alone when the last request failed |
