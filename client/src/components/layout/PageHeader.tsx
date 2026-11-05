import type { ReactNode } from "react"
import { useMatch } from "react-router"
import { AskAiButton } from "@/features/ai/components/AskAiButton"

interface PageHeaderProps {
    title: string
    meta?: string
    actions?: ReactNode
}

export function PageHeader({ title, meta, actions }: PageHeaderProps) {
    // Ask AI exists only inside a project (the AI needs a project for context). useMatch reads the URL directly.
    const inProject = useMatch("/projects/:projectId/*") !== null

    return (
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
        <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
            {meta && <span className="text-sm text-muted-foreground">{meta}</span>}
        </div>
        {(actions || inProject) && (
            <div className="flex items-center gap-2">
            {actions}
            {inProject && <AskAiButton />}
            </div>
        )}
        </header>
    )
}