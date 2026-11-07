import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { InlineSelect } from "./InlineSelect"

export interface SelectOption {
    value: string
    label: string
}

interface OptionSelectProps {
    value: string
    onChange: (value: string) => void
    options: readonly SelectOption[]
    id?: string
    disabled?: boolean
    /** Shown when `value` matches no option (for example while the options are still loading). */
    placeholder?: string
    className?: string
    /** Extra classes for the trigger button only (for example a field height). `className` may sit on a wrapper. */
    triggerClassName?: string
    /**
     * Below 640px, show the options as a drawer that slides open under the trigger (and pushes the page down)
     * instead of a floating popup. Used by the filters; selects inside dialogs keep the popup.
     */
    inlineOnSmall?: boolean
    "aria-label"?: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean
}

export function OptionSelect({
    value,
    onChange,
    options,
    id,
    disabled,
    placeholder = "Select…",
    className,
    triggerClassName,
    inlineOnSmall = false,
    ...aria
    }: OptionSelectProps) {
    // Hooks first, always: the early return below must come after every hook call.
    const isSmall = useMediaQuery("(max-width: 639px)")

    if (inlineOnSmall && isSmall) {
        return (
        <InlineSelect
            value={value}
            onChange={onChange}
            options={options}
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            className={className}
            triggerClassName={triggerClassName}
            {...aria}
        />
        )
    }

  // Passing the label as SelectValue's child makes the trigger show "In Progress", never the raw "in_progress".
    const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder

    return (
        <Select
        value={value}
        onValueChange={(next) => {
            if (next !== null) onChange(next)
        }}
        disabled={disabled}
        >
        <SelectTrigger id={id} className={cn("w-full", triggerClassName, className)} {...aria}>
            <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent
            // The default aligns the selected item OVER the trigger: the list then covers the control, jumps away
            // from it, and (in shadcn) its animation is switched off. Anchoring it below fixes all three.
            alignItemWithTrigger={false}
            side="bottom"
            align="start"
            sideOffset={6}
            className="min-w-(--anchor-width) duration-200"
        >
            {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
                {option.label}
            </SelectItem>
            ))}
        </SelectContent>
        </Select>
    )
}