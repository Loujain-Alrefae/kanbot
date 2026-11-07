import { Sparkles } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* Every AI button: indigo tint (.ai-btn) and the sparkle icon. */
export function AiButton({ children, variant = "outline", className, ...props }: ComponentProps<typeof Button>) {
    return (
        <Button type="button" variant={variant} className={cn("ai-btn", className)} {...props}>
        <Sparkles className="size-4" aria-hidden="true" />
        {children}
        </Button>
    )
}