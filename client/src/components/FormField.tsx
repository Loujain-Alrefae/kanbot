import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

/* aria-describedby points at the error when there is one, otherwise at the hint. */
export function describe(id: string, error?: string, hint?: string): string | undefined {
    if (error) return `${id}-error`
    if (hint) return `${id}-hint`
    return undefined
}

interface FieldProps {
    id: string
    label: string
    error?: string
    hint?: string
    children: ReactNode
}

export function Field({ id, label, error, hint, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        {children}
        {error ? (
            <p id={`${id}-error`} role="alert" className="text-sm text-destructive-text">
            {error}
            </p>
        ) : hint ? (
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
            </p>
        ) : null}
        </div>
    )
}