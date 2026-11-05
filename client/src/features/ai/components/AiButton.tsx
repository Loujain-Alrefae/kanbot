import { Sparkles } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

/* A button with the ✦ icon, for every AI action (same look as the wireframes). */
export function AiButton({ children, variant = "outline", ...props }: ComponentProps<typeof Button>) {
    return (
        <Button type="button" variant={variant} {...props}>
        <Sparkles className="size-4" aria-hidden="true" />
        {children}
        </Button>
    )
}