import type { Sprint } from "@/types/api"

export interface VelocityPoint {
    id: string
    name: string
    donePoints: number
    totalPoints: number
}

const MAX_SPRINTS = 8

/* Completed sprints only, oldest to newest (left to right), from their frozen completedStats. Never mutates the input. */
export function velocityPoints(sprints: Sprint[]): VelocityPoint[] {
    return sprints
        .filter((sprint) => sprint.status === "completed" && sprint.completedStats !== null)
        .sort((a, b) => (a.completedAt ?? a.createdAt).localeCompare(b.completedAt ?? b.createdAt))
        .slice(-MAX_SPRINTS)
        .map((sprint) => ({
        id: sprint.id,
        name: sprint.name,
        donePoints: sprint.completedStats?.donePoints ?? 0,
        totalPoints: sprint.completedStats?.totalPoints ?? 0,
        }))
    }

export function averageVelocity(points: VelocityPoint[]): number {
    if (points.length === 0) return 0
    return Math.round(points.reduce((sum, point) => sum + point.donePoints, 0) / points.length)
}