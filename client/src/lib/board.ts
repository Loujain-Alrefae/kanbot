import { sumPoints } from "@/lib/todo"
import { TODO_STATUSES } from "@/types/api"
import type { SprintBoardResponse, Todo, TodoStatus } from "@/types/api"

/** The four board columns, each already sorted by `order` (the shape the API returns). */
export type BoardColumns = SprintBoardResponse["columns"]

export interface BoardSpot {
  status: TodoStatus
  /** Index inside the column (0 = top). */
  index: number
}

/* Where a todo currently is, or null if it is not on the board. */
export function locateInColumns(columns: BoardColumns, todoId: string): BoardSpot | null {
  for (const status of TODO_STATUSES) {
    const index = columns[status].findIndex((todo) => todo.id === todoId)
    if (index !== -1) return { status, index }
  }
  return null
}

/* Rewrites `order` as 0..n-1 (the server does the same). Todos whose order is already right are reused. */
function renumber(todos: Todo[]): Todo[] {
    return todos.map((todo, order) => (todo.order === order ? todo : { ...todo, order }))
    }

    /*
    * Pure move for the optimistic update. Never mutates its input.
    *
    * `toIndex` follows the API's `position`: the index in the TARGET column AFTER the dragged todo has been
    * taken out of it (0 = top). It is clamped to the column, so a huge number means "the end".
    * An unknown todo returns the same `columns` object, so callers can detect "nothing changed".
    *
    * The moved todo gets its new status; completedAt follows the server rule (set on entering "done",
    * cleared on leaving it). Only the source and target columns are renumbered.
    */
export function moveInColumns(
    columns: BoardColumns,
    todoId: string,
    toStatus: TodoStatus,
    toIndex: number,
    ): BoardColumns {
    const from = locateInColumns(columns, todoId)
    if (!from) return columns

    const moving = columns[from.status][from.index]
    const withoutMoving = columns[from.status].filter((todo) => todo.id !== todoId)
    const targetBase = from.status === toStatus ? withoutMoving : columns[toStatus]
    const index = Math.min(Math.max(toIndex, 0), targetBase.length)

    const statusChanged = from.status !== toStatus
    const moved: Todo = {
        ...moving,
        status: toStatus,
        completedAt: statusChanged ? (toStatus === "done" ? new Date().toISOString() : null) : moving.completedAt,
    }

    const next: BoardColumns = { ...columns }
    if (statusChanged) next[from.status] = renumber(withoutMoving)
    next[toStatus] = renumber([...targetBase.slice(0, index), moved, ...targetBase.slice(index)])
    return next
    }

export interface BoardTotals {
    totalTodos: number
    doneTodos: number
    unfinishedTodos: number
    totalPoints: number
    donePoints: number
    }

    /*
    * Progress numbers computed from the columns themselves, NOT from sprint.stats: the columns change instantly
    * with an optimistic move, while the server's stats only catch up after the refetch.
    */
    export function boardTotals(columns: BoardColumns): BoardTotals {
    const all = TODO_STATUSES.flatMap((status) => columns[status])
    const totalTodos = all.length
    const doneTodos = columns.done.length
    return {
        totalTodos,
        doneTodos,
        unfinishedTodos: totalTodos - doneTodos,
        totalPoints: sumPoints(all),
        donePoints: sumPoints(columns.done),
    }
}

/*
 * Same idea as moveInColumns, for ONE list (the backlog). `toIndex` is the index after the todo has been taken
 * out (0 = top, a huge number = the end). Pure. An unknown todo returns the same array.
 */
export function moveInList(todos: Todo[], todoId: string, toIndex: number): Todo[] {
  const moving = todos.find((todo) => todo.id === todoId)
  if (!moving) return todos

  const rest = todos.filter((todo) => todo.id !== todoId)
  const index = Math.min(Math.max(toIndex, 0), rest.length)
  return renumber([...rest.slice(0, index), moving, ...rest.slice(index)])
}