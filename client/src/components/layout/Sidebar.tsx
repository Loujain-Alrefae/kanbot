import { Link, NavLink, useMatch } from "react-router"
import {
  Columns3,
  FolderKanban,
  Layers,
  ListTodo,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useAuthStore } from "@/store/auth.store"
import { useSidebarStore } from "@/store/sidebar.store"
import { cn } from "@/lib/utils"
import icon from "@/assets/kanbot-icon.svg"
import { ProjectSwitcher } from "./ProjectSwitcher"

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed: boolean
  /** false for links that must stay highlighted on nested routes (Sprints → /sprints/:id) */
  end?: boolean
  onNavigate?: () => void
}

function NavItem({ to, icon: Icon, label, collapsed, end = true, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-lg text-sm font-medium transition-colors",
          collapsed ? "mx-auto size-10 justify-center" : "gap-3 px-3 py-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && label}
    </NavLink>
  )
}

interface SidebarProps {
  /** Icon-only mode (desktop only). */
  collapsed?: boolean
  /** Shows the collapse button (desktop only; the mobile sheet always has the full sidebar). */
  showToggle?: boolean
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, showToggle = false, onNavigate }: SidebarProps) {
  // useMatch reads the URL directly, so it works even though the sidebar sits above the :projectId route.
  const match = useMatch("/projects/:projectId/*")
  const projectId = match?.params.projectId

  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const toggleSidebar = useSidebarStore((s) => s.toggle)

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsed ? "p-2" : "p-3",
      )}
    >
      {/* Header: logo + collapse button */}
      <div className={cn("mb-4 flex", collapsed ? "flex-col items-center gap-2" : "items-center justify-between")}>
        <Link
          to="/projects"
          onClick={onNavigate}
          aria-label="Kanbot, all projects"
          className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
        >
          <img src={icon} alt="" width={30} height={30} />
          {!collapsed && <span className="font-display text-xl font-extrabold tracking-tight">Kanbot</span>}
        </Link>
        {showToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={toggleSidebar}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            title={toggleLabel}
          >
            <ToggleIcon className="size-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {projectId && (
          <>
            <ProjectSwitcher projectId={projectId} collapsed={collapsed} onNavigate={onNavigate} />
            {!collapsed && <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground">Project</p>}
            <div className={cn("space-y-1", collapsed && "pt-3")}>
              <NavItem to={`/projects/${projectId}/backlog`} icon={ListTodo}  label="Backlog" collapsed={collapsed} onNavigate={onNavigate} />
              <NavItem to={`/projects/${projectId}/board`} icon={Columns3} label="Active Sprint" collapsed={collapsed} onNavigate={onNavigate} />
              <NavItem to={`/projects/${projectId}/sprints`} icon={Layers} label="Sprints" collapsed={collapsed} end={false} onNavigate={onNavigate} />
            </div>
            <div className="my-3 border-t border-sidebar-border" />
          </>
        )}
        <NavItem to="/projects" icon={FolderKanban} label="Projects" collapsed={collapsed} onNavigate={onNavigate} />
      </nav>

            {/* Footer: collapsed = only the user avatar; expanded = user info + theme and log out icons */}
      <div className="mt-3 border-t border-sidebar-border pt-3">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2")}>
          <div
            role={collapsed ? "img" : undefined}
            aria-label={collapsed ? (user?.name ?? "Account") : undefined}
            aria-hidden={collapsed ? undefined : true}
            title={collapsed ? [user?.name, user?.email].filter(Boolean).join(" · ") : undefined}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
          >
            {initials}
          </div>

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium" title={user?.name}>
                  {user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground" title={user?.email}>
                  {user?.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button variant="ghost" size="icon" className="size-8" onClick={logout} aria-label="Log out" title="Log out">
                  <LogOut className="size-5" aria-hidden="true" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}