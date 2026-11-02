import { Link, NavLink, useMatch } from "react-router"
import { Columns3, FolderKanban, Layers, ListTodo, LogOut, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"
import icon from "@/assets/kanbot-icon.svg"
import { ProjectSwitcher } from "./ProjectSwitcher"

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
  onNavigate?: () => void
}

function NavItem({ to, icon: Icon, label, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )
      }
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  // useMatch reads the URL directly, so it works even though the sidebar sits above the :projectId route.
  const match = useMatch("/projects/:projectId/*")
  const projectId = match?.params.projectId

  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
      <Link to="/projects" onClick={onNavigate} className="mb-4 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
        <img src={icon} alt="" width={28} height={28} />
        <span className="text-xl font-extrabold tracking-tight">Kanbot</span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto">
        {projectId && (
          <>
            <ProjectSwitcher projectId={projectId} onNavigate={onNavigate} />
            <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground">Project</p>
            <NavItem to={`/projects/${projectId}/backlog`} icon={ListTodo} label="Backlog" onNavigate={onNavigate} />
            <NavItem to={`/projects/${projectId}/board`} icon={Columns3} label="Active Sprint" onNavigate={onNavigate} />
            <NavItem to={`/projects/${projectId}/sprints`} icon={Layers} label="Sprints" onNavigate={onNavigate} />
            <div className="my-3 border-t border-sidebar-border" />
          </>
        )}
        <NavItem to="/projects" icon={FolderKanban} label="Projects" onNavigate={onNavigate} />
      </nav>

      <div className="mt-3 space-y-2 border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-3 px-1">
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="flex-1 justify-start gap-2" onClick={logout}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}