import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
    ...aria
    }: OptionSelectProps) {
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
        <SelectTrigger id={id} className={cn("w-full", className)} {...aria}>
            <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
            {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
                {option.label}
            </SelectItem>
            ))}
        </SelectContent>
        </Select>
    )
}