import { create } from "zustand"

/*
 * Which AI surface is open. A button anywhere (the top bar, the backlog toolbar, the board header) opens one
 * by calling an action here; AiHost, mounted once in the app shell, renders them.
 * Opening one closes the others, so the drawer never sits under a dialog.
 */
interface AiUiState {
    drawerOpen: boolean
    generateOpen: boolean
    planOpen: boolean
    summaryOpen: boolean
    openDrawer: () => void
    openGenerate: () => void
    openPlan: () => void
    openSummary: () => void
    /** Closes everything. */
    closeAll: () => void
    closeDrawer: () => void
    closeGenerate: () => void
    closePlan: () => void
    closeSummary: () => void
}

const CLOSED = { drawerOpen: false, generateOpen: false, planOpen: false, summaryOpen: false }

export const useAiUiStore = create<AiUiState>()((set) => ({
    ...CLOSED,
    openDrawer: () => set({ ...CLOSED, drawerOpen: true }),
    openGenerate: () => set({ ...CLOSED, generateOpen: true }),
    openPlan: () => set({ ...CLOSED, planOpen: true }),
    openSummary: () => set({ ...CLOSED, summaryOpen: true }),
    closeAll: () => set(CLOSED),
    closeDrawer: () => set({ drawerOpen: false }),
    closeGenerate: () => set({ generateOpen: false }),
    closePlan: () => set({ planOpen: false }),
    closeSummary: () => set({ summaryOpen: false }),
}))