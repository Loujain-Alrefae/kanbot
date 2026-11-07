import { describe, expect, it } from "vitest"
import { averageVelocity, velocityPoints } from "./velocity"
import type { Sprint, SprintStatus } from "@/types/api"

function sprint(id: string, status: SprintStatus, completedAt: string | null, done = 0, total = 0): Sprint {
    const byStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 }
    const stats = { totalTodos: 0, doneTodos: 0, totalPoints: total, donePoints: done, byStatus }
    return {
        id,
        projectId: "p1",
        name: `Sprint ${id}`,
        goal: "",
        startDate: null,
        endDate: null,
        status,
        startedAt: null,
        completedAt,
        completedStats: status === "completed" ? { ...stats, carriedOver: 0 } : null,
        summary: null,
        stats,
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
    }
}

describe("velocityPoints", () => {
    it("keeps completed sprints only", () => {
        const points = velocityPoints([
        sprint("1", "completed", "2026-10-05T00:00:00.000Z", 10, 12),
        sprint("2", "active", null),
        sprint("3", "planned", null),
        ])
        expect(points.map((point) => point.id)).toEqual(["1"])
    })

    it("orders oldest to newest by completion date", () => {
        const points = velocityPoints([
        sprint("new", "completed", "2026-11-01T00:00:00.000Z"),
        sprint("old", "completed", "2026-10-01T00:00:00.000Z"),
        ])
        expect(points.map((point) => point.id)).toEqual(["old", "new"])
    })

    it("reads the frozen numbers from completedStats", () => {
        const [point] = velocityPoints([sprint("1", "completed", "2026-10-05T00:00:00.000Z", 30, 32)])
        expect(point).toEqual({ id: "1", name: "Sprint 1", donePoints: 30, totalPoints: 32 })
    })

    it("keeps only the latest 8 sprints", () => {
        const many = Array.from({ length: 10 }, (_, i) =>
        sprint(String(i), "completed", `2026-10-${String(i + 10).padStart(2, "0")}T00:00:00.000Z`),
        )
        const points = velocityPoints(many)
        expect(points).toHaveLength(8)
        expect(points[0].id).toBe("2")
        expect(points[7].id).toBe("9")
    })

    it("does not change the order of the array it receives", () => {
        const input = [
        sprint("new", "completed", "2026-11-01T00:00:00.000Z"),
        sprint("old", "completed", "2026-10-01T00:00:00.000Z"),
        ]
        velocityPoints(input)
        expect(input.map((s) => s.id)).toEqual(["new", "old"])
    })
})

describe("averageVelocity", () => {
    it("is 0 when there is nothing to average", () => {
        expect(averageVelocity([])).toBe(0)
    })

    it("rounds the average of points done", () => {
        const points = [
        { id: "1", name: "a", donePoints: 10, totalPoints: 12 },
        { id: "2", name: "b", donePoints: 15, totalPoints: 15 },
        ]
        expect(averageVelocity(points)).toBe(13) // 12.5 rounds up
    })
})