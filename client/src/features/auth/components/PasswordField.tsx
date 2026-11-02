import { useState, type ComponentProps } from "react"
import { Input } from "@/components/ui/input"

export function PasswordField({ className, ...props }: ComponentProps<typeof Input>) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
        <Input {...props} type={visible ? "text" : "password"} className={`h-11 pr-16 ${className ?? ""}`} />
        <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:text-foreground"
        >
            {visible ? "Hide" : "Show"}
        </button>
        </div>
    )
}