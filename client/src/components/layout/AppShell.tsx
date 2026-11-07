import { useState } from "react"
import { Outlet } from "react-router"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { AiHost } from "@/features/ai/components/AiHost"
import { useSidebarStore } from "@/store/sidebar.store"
import { cn } from "@/lib/utils"
import icon from "@/assets/kanbot-icon.svg"
import { Sidebar } from "./Sidebar"
import { Hotkeys } from "@/features/shortcuts/Hotkeys"

export function AppShell() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const collapsed = useSidebarStore((s) => s.collapsed)

    return (
        <div className="flex min-h-dvh">
        {/* Desktop (1024px and up): fixed sidebar that can collapse to an icon rail */}
        <aside
            className={cn(
            "sticky top-0 hidden h-dvh shrink-0 transition-[width] duration-200 motion-reduce:transition-none lg:block",
            collapsed ? "w-18" : "w-64",
            )}
        >
            <Sidebar collapsed={collapsed} showToggle />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
            {/* Below 1024px: top bar with a menu button that opens the full sidebar in a sheet */}
            <div className="flex items-center gap-2 border-b px-2.5 py-2 lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <Menu className="size-6" aria-hidden="true" />
            </Button>
            <img src={icon} alt="" width={30} height={30} />
            <span className="font-display text-xl font-extrabold tracking-tight">Kanbot</span>
            </div>
            <main className="min-w-0 flex-1">
            <Outlet />
            </main>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
        </Sheet>

        {/* The AI drawer and dialogs live here once; any button in any page opens them through the store. */}
        <AiHost />
        <Hotkeys />
        </div>
    )
}