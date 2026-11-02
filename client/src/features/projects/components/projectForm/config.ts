import { z } from "zod"

export const projectSchema = z.object({
    name: z.string().trim().min(1, "Enter a project name.").max(80, "Use at most 80 characters."),
    // Empty = let the server generate it from the name (PRJ-2).
    key: z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => v === "" || /^[A-Z]{2,6}$/.test(v), "Use 2–6 letters (A–Z)."),
    description: z.string().trim().max(500, "Use at most 500 characters."),
})

export type ProjectValues = z.infer<typeof projectSchema>