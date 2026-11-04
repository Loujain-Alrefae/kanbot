import type { Sprint } from "@/types/api"

export interface DisplayStats {
    totalTodos: number
    doneTodos: number
    totalPoints: number
    donePoints: number
    /** null = not applicable (the sprint is not completed yet). */
    carriedOver: number | null
}

/* A completed sprint shows its frozen snapshot; planned and active sprints show the live stats. */
export function displayStats(sprint: Sprint): DisplayStats {
    const final = sprint.status === "completed" ? sprint.completedStats : null
    if (final) {
        return {
        totalTodos: final.totalTodos,
        doneTodos: final.doneTodos,
        totalPoints: final.totalPoints,
        donePoints: final.donePoints,
        carriedOver: final.carriedOver,
        }
    }
    const { totalTodos, doneTodos, totalPoints, donePoints } = sprint.stats
    return { totalTodos, doneTodos, totalPoints, donePoints, carriedOver: null }
    }

    /* Completion by story points (as in the wireframe: 30 / 32 = 94%). Falls back to todos when nothing is estimated. */
    export function completionPercent(stats: DisplayStats): number {
    if (stats.totalPoints > 0) return Math.round((stats.donePoints / stats.totalPoints) * 100)
    if (stats.totalTodos > 0) return Math.round((stats.doneTodos / stats.totalTodos) * 100)
    return 0
}