import { describe, expect, it } from "vitest"
import { parseEstimate } from "./parseEstimate"

describe("parseEstimate", () => {
    it("reads the labelled format and keeps the reason", () => {
        expect(parseEstimate("Estimate: 5\nBecause it is small.")).toEqual({ points: 5, reason: "Because it is small." })
    })

    it("accepts every allowed story point", () => {
        for (const points of [1, 2, 3, 5, 8, 13]) {
        expect(parseEstimate(`Estimate: ${points}`)?.points).toBe(points)
        }
    })

    it("reads a number inside markdown bold", () => {
        expect(parseEstimate("Estimate: **13** because it touches auth.")?.points).toBe(13)
    })

    it("prefers the labelled number over an earlier number in the text", () => {
        expect(parseEstimate("It takes 4 days. Estimate: 3")?.points).toBe(3)
    })

    it("falls back to the first number in a plain sentence", () => {
        expect(parseEstimate("I would say about 8 points for this one.")?.points).toBe(8)
    })

    it("returns null when there is no number", () => {
        expect(parseEstimate("It looks medium sized to me.")).toBeNull()
        expect(parseEstimate("")).toBeNull()
    })

    it("returns null for a number that is not an allowed story point", () => {
        expect(parseEstimate("Estimate: 4")).toBeNull()
        expect(parseEstimate("Estimate: 21")).toBeNull()
        expect(parseEstimate("Estimate: 0")).toBeNull()
    })
})