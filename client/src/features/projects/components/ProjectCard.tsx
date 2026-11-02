import { Link } from "react-router"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import type { ProjectWithStats } from "@/types/api"

interface ProjectCardProps {
    project: ProjectWithStats
    onEdit: (project: ProjectWithStats) => void
    onDelete: (project: ProjectWithStats) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const { stats } = project
    const sprintText = stats.activeSprint ? `${stats.activeSprint.name} active` : "No active sprint"

    return (
        // The title link is stretched over the whole card (after:absolute); the menu sits above it (z-10).
        <article className="relative flex flex-col rounded-2xl border bg-card p-5 text-card-foreground transition-colors hover:border-primary/50">
        <div className="flex items-start gap-3">
            <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg font-extrabold text-primary"
            >
            {project.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold tracking-tight">
                <Link
                to={`/projects/${project.id}/backlog`}
                className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                >
                {project.name}
                </Link>
            </h2>
            <span className="mt-1 inline-block rounded bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background">
                {project.key}
            </span>
            </div>

            <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Actions for ${project.name}`}
                className="relative z-10 -mr-1.5 -mt-1.5 flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            >
                <MoreHorizontal className="size-5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(project)}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
            {project.description || "No description"}
        </p>

        <div className="mt-4 border-t pt-3 text-sm text-muted-foreground">
            {stats.backlogCount} backlog · {sprintText}
        </div>
        </article>
    )
}