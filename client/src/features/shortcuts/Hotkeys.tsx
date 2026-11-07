import { useState } from "react"
import { QUICK_CREATE_INPUT_ID } from "@/features/backlog/constants"
import { useHotkeys } from "@/hooks/useHotkeys"
import { ShortcutsDialog } from "./ShortcutsDialog"

function focus(element: HTMLElement | null): boolean {
    if (!element) return false // not on a page that has it: let the key do its normal thing
    element.focus()
    return true
}

/* Mounted once in the app shell. Each shortcut looks for its target in the page, so it only acts where it makes sense. */
export function Hotkeys() {
    const [helpOpen, setHelpOpen] = useState(false)

    useHotkeys({
        c: () => focus(document.getElementById(QUICK_CREATE_INPUT_ID)),
        "/": () => focus(document.querySelector<HTMLElement>('[data-hotkey="search"]')),
        "?": () => {
        setHelpOpen(true)
        },
    })

    return <ShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
}