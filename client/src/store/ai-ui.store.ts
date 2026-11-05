import { create } from "zustand"

interface AiUiState {
    drawerOpen: boolean
    generateOpen: boolean
    planOpen: boolean
    summaryOpen: boolean
    /** A message waiting for AiHost to send it (the "Improve with AI" button). */
    pendingPrompt: string | null
    openDrawer: () => void
    openGenerate: () => void
    openPlan: () => void
    openSummary: () => void
    /** Opens the drawer and sends this message as the user. */
    askAi: (prompt: string) => void
    consumePrompt: () => void
    closeAll: () => void
    closeDrawer: () => void
    closeGenerate: () => void
    closePlan: () => void
    closeSummary: () => void
}

const CLOSED = { drawerOpen: false, generateOpen: false, planOpen: false, summaryOpen: false }

export const useAiUiStore = create<AiUiState>()((set) => ({
    ...CLOSED,
    pendingPrompt: null,
    openDrawer: () => set({ ...CLOSED, drawerOpen: true }),
    openGenerate: () => set({ ...CLOSED, generateOpen: true }),
    openPlan: () => set({ ...CLOSED, planOpen: true }),
    openSummary: () => set({ ...CLOSED, summaryOpen: true }),
    askAi: (prompt) => set({ ...CLOSED, drawerOpen: true, pendingPrompt: prompt }),
    consumePrompt: () => set({ pendingPrompt: null }),
    closeAll: () => set(CLOSED),
    closeDrawer: () => set({ drawerOpen: false }),
    closeGenerate: () => set({ generateOpen: false }),
    closePlan: () => set({ planOpen: false }),
    closeSummary: () => set({ summaryOpen: false }),
}))