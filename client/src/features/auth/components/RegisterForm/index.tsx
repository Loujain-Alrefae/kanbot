import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fieldErrors } from "@/api/client"
import { PasswordField } from "../PasswordField"
import { useRegister } from "../../hooks/useRegister"
import { registerSchema, type RegisterValues } from "./config"

const SERVER_FIELDS = ["name", "email", "password"] as const
type ServerField = (typeof SERVER_FIELDS)[number]

export function RegisterForm() {
    const registerUser = useRegister()
    const [formError, setFormError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    })

    const onSubmit = handleSubmit(({ name, email, password }) => {
        setFormError(null)
        registerUser.mutate(
        { name, email, password },
        {
            onError: (err) => {
            // 409 and validation errors arrive as details[]: show them under the matching field (AUTH-1).
            let matched = false
            for (const [field, message] of Object.entries(fieldErrors(err))) {
                if ((SERVER_FIELDS as readonly string[]).includes(field)) {
                setError(field as ServerField, { message })
                matched = true
                }
            }
            if (!matched) setFormError(err.message)
            },
        },
        )
    })

    return (
        <>
        {formError && (
            <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
            {formError}
            </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                className="h-11"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
            />
            {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
            />
            {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <PasswordField
                id="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby="password-hint"
                {...register("password")}
            />
            {errors.password && 
                <p id="password-hint" className="text-sm text-destructive">{errors.password.message}</p>
            }
            </div>

            <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
            <PasswordField
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Repeat your password"
                aria-invalid={errors.confirmPassword ? true : undefined}
                aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
                <p id="confirm-error" className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
            </div>

            <Button type="submit" className="h-11 w-full" disabled={registerUser.isPending}>
            {registerUser.isPending ? "Creating account…" : "Create account"}
            </Button>
        </form>
        </>
    )
}