import { z } from "zod"

export const registerSchema = z
    .object({
        name: z.string().trim().min(1, "Enter your name."),
        email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
        password: z.string().min(8, "Use at least 8 characters."),
        confirmPassword: z.string().min(1, "Confirm your password."),
    })
    .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
})

export type RegisterValues = z.infer<typeof registerSchema>