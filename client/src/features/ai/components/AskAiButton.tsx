import { useAiUiStore } from "@/store/ai-ui.store"
import { AiButton } from "./AiButton"

export function AskAiButton() {
    const openDrawer = useAiUiStore((s) => s.openDrawer)
    return <AiButton onClick={openDrawer}>Ask AI</AiButton>
}