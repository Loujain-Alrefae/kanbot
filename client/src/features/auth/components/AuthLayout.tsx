import type { ReactNode } from "react"
import icon from "@/assets/kanbot-icon.svg"
import { ThemeToggle } from "@/components/ThemeToggle"

interface AuthLayoutProps {
    title: string
    subtitle: string
    children: ReactNode
    footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-dvh items-center justify-center p-4 py-8">
        <ThemeToggle className="absolute right-4 top-4" />
        <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-card-foreground">
            <div className="flex items-center justify-center gap-2.5">
            <img src={icon} alt="" width={32} height={32} />
            <span className="text-2xl font-extrabold tracking-tight">Kanbot</span>
            </div>
            <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight">{title}</h1>
            <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
            {children}
            <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </section>
        </main>
    )
}