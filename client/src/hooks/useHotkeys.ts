import { useEffect, useRef } from "react"

/* Return false when the shortcut had nothing to do on this page: then the key keeps its normal behavior. */
type Handler = (event: KeyboardEvent) => boolean | void
export type HotkeyMap = Record<string, Handler>

// Anything open on top of the page (dialog, drawer, menu, select list): shortcuts must stay out of its way.
const OVERLAY = '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]'

function isTyping(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable) return true
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"
}

/*
 * Single-key shortcuts. They are ignored while typing, while anything is open on top of the page, with
 * Ctrl / Alt / Meta (browser shortcuts stay untouched), on key repeat and during IME composition.
 * The default action is blocked only when a shortcut really ran.
 */
export function useHotkeys(map: HotkeyMap) {
    const latest = useRef(map)
    useEffect(() => {
        latest.current = map
    })

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
        if (event.defaultPrevented || event.repeat || event.isComposing) return
        if (event.ctrlKey || event.altKey || event.metaKey) return
        if (isTyping(event.target)) return
        if (document.querySelector(OVERLAY)) return

        const handler = latest.current[event.key]
        if (!handler) return
        if (handler(event) !== false) event.preventDefault()
        }

        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [])
}