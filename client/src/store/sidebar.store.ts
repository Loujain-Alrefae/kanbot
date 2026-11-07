import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
    collapsed: boolean
    toggle: () => void
}

/* Desktop sidebar state (expanded or icon-only), remembered between visits. */
export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
        collapsed: false,
        toggle: () => set((state) => ({ collapsed: !state.collapsed })),
        }),
        { name: "kanbot-sidebar" },
    ),
)