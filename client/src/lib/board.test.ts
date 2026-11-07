import { describe, expect, it } from "vitest"
import { boardTotals, locateInColumns, moveInColumns, moveInList } from "./board"
import type { BoardColumns } from "./board"
import type { Todo, TodoStatus } from "@/types/api"

/* A todo with every field filled in, so each test only states what it cares about. */
function item(id: string, order: number, status: TodoStatus, patch: Partial<Todo> = {}): Todo {
    return {
        id,
        projectId: "p1",
        sprintId: "s1",
        key: `KAN-${id}`,
        title: `Todo ${id}`,
        description: "",
        type: "task",
        status,
        priority: "medium",
        storyPoints: null,
        labels: [],
        dueDate: null,
        order,
        createdAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-01T00:00:00.000Z",
        completedAt: null,
        ...patch,
    }
}

function makeColumns(): BoardColumns {
    return {
        todo: [item("a", 0, "todo"), item("b", 1, "todo"), item("c", 2, "todo")],
        in_progress: [],
        in_review: [item("e", 0, "in_review")],
        done: [item("d", 0, "done", { completedAt: "2026-11-01T10:00:00.000Z" })],
    }
}

const ids = (todos: Todo[]) => todos.map((todo) => todo.id)
const orders = (todos: Todo[]) => todos.map((todo) => todo.order)

describe("locateInColumns", () => {
    it("finds the column and index of a todo", () => {
        expect(locateInColumns(makeColumns(), "c")).toEqual({ status: "todo", index: 2 })
        expect(locateInColumns(makeColumns(), "d")).toEqual({ status: "done", index: 0 })
    })

    it("returns null for a todo that is not on the board", () => {
        expect(locateInColumns(makeColumns(), "zzz")).toBeNull()
    })
})

describe("moveInColumns", () => {
    it("reorders inside the same column (index counted after taking the card out)", () => {
        const next = moveInColumns(makeColumns(), "a", "todo", 2)
        expect(ids(next.todo)).toEqual(["b", "c", "a"])
        expect(orders(next.todo)).toEqual([0, 1, 2])
    })

    it("moves a card into another column at the given index", () => {
        const next = moveInColumns(makeColumns(), "b", "in_review", 0)
        expect(ids(next.todo)).toEqual(["a", "c"])
        expect(orders(next.todo)).toEqual([0, 1])
        expect(ids(next.in_review)).toEqual(["b", "e"])
        expect(next.in_review[0].status).toBe("in_review")
    })

    it("moves a card into an empty column", () => {
        const next = moveInColumns(makeColumns(), "a", "in_progress", 0)
        expect(ids(next.in_progress)).toEqual(["a"])
        expect(next.in_progress[0].status).toBe("in_progress")
        expect(ids(next.todo)).toEqual(["b", "c"])
    })

    it("clamps an index that is too big (END_OF_LIST means the end)", () => {
        const next = moveInColumns(makeColumns(), "a", "in_review", 10000)
        expect(ids(next.in_review)).toEqual(["e", "a"])
    })

    it("clamps a negative index to the top", () => {
        const next = moveInColumns(makeColumns(), "c", "todo", -5)
        expect(ids(next.todo)).toEqual(["c", "a", "b"])
    })

    it("sets completedAt when a card enters done and clears it when it leaves", () => {
        const entered = moveInColumns(makeColumns(), "a", "done", 0)
        expect(entered.done[0].completedAt).not.toBeNull()

        const left = moveInColumns(makeColumns(), "d", "todo", 0)
        expect(left.todo[0].completedAt).toBeNull()
    })

    it("keeps completedAt when a done card is only reordered", () => {
        const columns = makeColumns()
        columns.done.push(item("f", 1, "done", { completedAt: "2026-11-02T10:00:00.000Z" }))
        const next = moveInColumns(columns, "d", "done", 1)
        expect(next.done.find((todo) => todo.id === "d")?.completedAt).toBe("2026-11-01T10:00:00.000Z")
    })

    it("never mutates its input", () => {
        const columns = makeColumns()
        const before = structuredClone(columns)
        moveInColumns(columns, "a", "done", 0)
        expect(columns).toEqual(before)
    })

    it("reuses the columns it did not touch", () => {
        const columns = makeColumns()
        const next = moveInColumns(columns, "a", "in_progress", 0)
        expect(next.in_review).toBe(columns.in_review)
        expect(next.done).toBe(columns.done)
    })

    it("returns the same object for an unknown todo", () => {
        const columns = makeColumns()
        expect(moveInColumns(columns, "zzz", "done", 0)).toBe(columns)
    })
})

describe("boardTotals", () => {
    it("is all zeros for an empty board", () => {
        const empty: BoardColumns = { todo: [], in_progress: [], in_review: [], done: [] }
        expect(boardTotals(empty)).toEqual({
        totalTodos: 0,
        doneTodos: 0,
        unfinishedTodos: 0,
        totalPoints: 0,
        donePoints: 0,
        })
    })

    it("counts todos and points, and an unestimated todo counts as 0 points", () => {
        const columns: BoardColumns = {
        todo: [item("a", 0, "todo", { storyPoints: 5 }), item("b", 1, "todo", { storyPoints: null })],
        in_progress: [],
        in_review: [item("e", 0, "in_review", { storyPoints: 2 })],
        done: [item("d", 0, "done", { storyPoints: 3 })],
        }
        expect(boardTotals(columns)).toEqual({
        totalTodos: 4,
        doneTodos: 1,
        unfinishedTodos: 3,
        totalPoints: 10,
        donePoints: 3,
        })
    })
})

describe("moveInList", () => {
    const list = () => [item("a", 0, "todo"), item("b", 1, "todo"), item("c", 2, "todo")]

    it("moves a todo to the given index and renumbers order", () => {
        const next = moveInList(list(), "a", 1)
        expect(ids(next)).toEqual(["b", "a", "c"])
        expect(orders(next)).toEqual([0, 1, 2])
    })

    it("a huge index means the end", () => {
        expect(ids(moveInList(list(), "a", 10000))).toEqual(["b", "c", "a"])
    })

    it("returns the same array for an unknown todo and never mutates the input", () => {
        const original = list()
        const before = structuredClone(original)
        expect(moveInList(original, "zzz", 0)).toBe(original)
        moveInList(original, "c", 0)
        expect(original).toEqual(before)
    })
})