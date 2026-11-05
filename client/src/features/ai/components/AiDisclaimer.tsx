import { cn } from "@/lib/utils"

export function AiDisclaimer({ className }: { className?: string }) {
    return (
        <p className={cn("text-xs text-muted-foreground", className)}>AI can make mistakes. Review before saving.</p>
    )
}