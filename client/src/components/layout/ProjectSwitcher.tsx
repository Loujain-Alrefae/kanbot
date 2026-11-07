import { useNavigate } from "react-router"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProjects } from "@/hooks/useProjects"
import { cn } from "@/lib/utils"

interface ProjectSwitcherProps {
    projectId: string
    collapsed?: boolean
    onNavigate?: () => void
}

export function ProjectSwitcher({ projectId, collapsed = false, onNavigate }: ProjectSwitcherProps) {
    const navigate = useNavigate()
    const { data: projects } = useProjects()
    const current = projects?.find((p) => p.id === projectId)

    const go = (path: string) => {
        navigate(path)
        onNavigate?.()
    }

    return (
        <DropdownMenu>
        <DropdownMenuTrigger
            aria-label="Switch project"
            title={current ? `${current.key} · ${current.name}` : "Switch project"}
            className={cn(
            "flex items-center rounded-lg border bg-card text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40",
            collapsed ? "mx-auto size-10 justify-center text-xs font-semibold" : "w-full gap-2 px-3 py-2 text-left",
            )}
        >
            {collapsed ? (
            <span>{current ? current.key.slice(0, 3) : "…"}</span>
            ) : (
            <>
                <span className="min-w-0 flex-1 truncate">
                {current ? (
                    <>
                    <span className="font-semibold">{current.key}</span> · {current.name}
                    </>
                ) : (
                    "Select project"
                )}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </>
            )}
        </DropdownMenuTrigger>

        {/* If TypeScript rejects `side`, remove it: the menu then opens below the trigger. */}
        <DropdownMenuContent align="start" side={collapsed ? "right" : "bottom"} className="w-60">
            {projects?.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => go(`/projects/${p.id}/backlog`)}>
                <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{p.key}</span> · {p.name}
                </span>
                {p.id === projectId && <Check className="size-4" aria-hidden="true" />}
            </DropdownMenuItem>
            ))}
            {projects?.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">No projects yet</div>}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => go("/projects")}>All projects</DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
}