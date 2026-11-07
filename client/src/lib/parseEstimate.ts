import { POINTS_OPTIONS } from "@/lib/todo"
import type { StoryPoints } from "@/types/api"

export interface ParsedEstimate {
    points: StoryPoints
    reason: string
}

const LABELLED = /estimate\s*[:=-]?\s*\**\s*(\d+)/i
const ANY_NUMBER = /\d+/

function cleanReason(text: string): string {
    return text
        .replace(/[*_`#>]/g, "")
        .replace(/^[\s:.,;\-–—·]+/, "")
        .replace(/^(story\s+)?(points?|pts)\b/i, "")
        .replace(/^[\s:.,;\-–—·]+/, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 240)
}


export function parseEstimate(text: string): ParsedEstimate | null {
    const labelled = LABELLED.exec(text)
    const match = labelled ?? ANY_NUMBER.exec(text)
    if (!match) return null

    const value = Number(labelled ? labelled[1] : match[0])
    const points = POINTS_OPTIONS.find((option) => option === value)
    if (points === undefined) return null

    return { points, reason: cleanReason(text.replace(match[0], " ")) }
    }