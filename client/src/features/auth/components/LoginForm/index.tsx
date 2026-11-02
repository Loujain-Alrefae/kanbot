import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fieldErrors } from "@/api/client"
import { PasswordField } from "../PasswordField"
import { useLogin } from "../../hooks/useLogin"
import { loginSchema, type LoginValues } from "./config"

export function LoginForm() {
    const login = useLogin()
    const [formError, setFormError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = handleSubmit((values) => {
        setFormError(null)
        login.mutate(values, {
        onError: (err) => {
            // Field-level server errors go under the field, everything else in the alert (AUTH-2).
            let matched = false
            for (const [name, message] of Object.entries(fieldErrors(err))) {
            if (name === "email" || name === "password") {
                setError(name, { message })
                matched = true
            }
            }
            if (!matched) setFormError(err.message)
        },
        })
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
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
            />
            {errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="h-11 w-full" disabled={login.isPending}>
            {login.isPending ? "Logging in…" : "Log in"}
            </Button>
        </form>
        </>
    )
}