import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SelectOption } from "./OptionSelect"

interface InlineSelectProps {
    value: string
    onChange: (value: string) => void
    options: readonly SelectOption[]
    id?: string
    disabled?: boolean
    placeholder?: string
    /** Applied to the wrapper, so flex sizing classes (flex-1, min-w-32…) work like they do on the trigger. */
    className?: string
    "aria-label"?: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean
    triggerClassName?: string
}


export function InlineSelect({
    value,
    onChange,
    options,
    id,
    disabled,
    placeholder = "Select…",
    className,
    triggerClassName,
    ...aria
    }: InlineSelectProps) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
    const listId = useId()

    const selectedIndex = options.findIndex((option) => option.value === value)
    const label = options[selectedIndex]?.label ?? placeholder
    const ariaLabel = aria["aria-label"]

    const show = useCallback(() => {
        setActiveIndex(Math.max(selectedIndex, 0))
        setOpen(true)
    }, [selectedIndex])

    function close(returnFocus: boolean) {
        setOpen(false)
        if (returnFocus) triggerRef.current?.focus()
    }

    // A press (mouse or touch) anywhere outside closes it, so two filters never stay open together.
    useEffect(() => {
        if (!open) return
        function handlePointerDown(event: PointerEvent) {
        if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
        }
        document.addEventListener("pointerdown", handlePointerDown)
        return () => document.removeEventListener("pointerdown", handlePointerDown)
    }, [open])

    // Keyboard focus follows the active option. preventScroll: the panel is still growing when it opens.
    useEffect(() => {
        if (open) optionRefs.current[activeIndex]?.focus({ preventScroll: true })
    }, [open, activeIndex])

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        show()
        }
    }

    function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const last = options.length - 1
        switch (event.key) {
        case "ArrowDown":
            event.preventDefault()
            setActiveIndex((index) => Math.min(index + 1, last))
            break
        case "ArrowUp":
            event.preventDefault()
            setActiveIndex((index) => Math.max(index - 1, 0))
            break
        case "Home":
            event.preventDefault()
            setActiveIndex(0)
            break
        case "End":
            event.preventDefault()
            setActiveIndex(last)
            break
        case "Escape":
            event.preventDefault()
            event.stopPropagation()
            close(true)
            break
        case "Tab":
            // Put focus back on the trigger first, so Tab / Shift+Tab continue from there instead of from a hidden option.
            triggerRef.current?.focus()
            setOpen(false)
            break
        }
    }

    return (
        <div ref={rootRef} className={cn("min-w-0", className)}>
        <button
            ref={triggerRef}
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            // The current value is part of the name, so a screen reader says "Filter by priority: All priorities".
            aria-label={ariaLabel ? `${ariaLabel}: ${label}` : undefined}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            onClick={() => (open ? close(false) : show())}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-field px-3 text-left text-sm outline-none transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:border-primary aria-invalid:border-destructive",
                triggerClassName,
            )}        >
            <span className="truncate">{label}</span>
            <ChevronDown
            className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180",
            )}
            aria-hidden="true"
            />
        </button>

        {/* grid-template-rows 0fr -> 1fr animates the height. While closed the panel is `inert`: not focusable, not clickable, hidden from screen readers. */}
        <div
            inert={!open}
            className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
        >
            <div className="overflow-hidden">
            <div
                id={listId}
                role="listbox"
                aria-label={ariaLabel}
                onKeyDown={handleListKeyDown}
                className="mt-1.5 max-h-64 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
            >
                {options.map((option, index) => {
                const isSelected = option.value === value
                return (
                    <button
                    key={option.value}
                    ref={(node) => {
                        optionRefs.current[index] = node
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={index === activeIndex ? 0 : -1}
                    onClick={() => {
                        onChange(option.value)
                        close(true)
                    }}
                    className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset aria-selected:bg-accent aria-selected:font-medium aria-selected:text-accent-foreground"
                    >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                    </button>
                )
                })}
            </div>
            </div>
        </div>
        </div>
    )
}