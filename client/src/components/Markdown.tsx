import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import { cn } from "@/lib/utils"

/*
 * The ONLY place AI text is rendered as Markdown (NFR-7).
 * - No rehype-raw: raw HTML in the text is shown as plain text, never executed.
 * - Images are dropped (they would make an external request).
 * - Links open in a new tab. Tables and code scroll sideways INSIDE their own box,
 *   so a wide answer never stretches the drawer or the page.
 */
const components: Components = {
    img: () => null,
    a: ({ children, href }) => (
        <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2"
        >
        {children}
        </a>
    ),
    h1: ({ children }) => <h3 className="mt-4 text-base font-semibold first:mt-0">{children}</h3>,
    h2: ({ children }) => <h3 className="mt-4 text-base font-semibold first:mt-0">{children}</h3>,
    h3: ({ children }) => <h4 className="mt-3 text-sm font-semibold first:mt-0">{children}</h4>,
    h4: ({ children }) => <h4 className="mt-3 text-sm font-semibold first:mt-0">{children}</h4>,
    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">{children}</blockquote>
    ),
    hr: () => <hr className="border-border" />,
    pre: ({ children }) => (
        <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">{children}</pre>
    ),
    code: ({ className, children }) => (
        <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)}>{children}</code>
    ),
    table: ({ children }) => (
        <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse text-left text-xs">{children}</table>
        </div>
    ),
    th: ({ children }) => <th className="border-b bg-muted px-3 py-2 font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b px-3 py-2 align-top last:border-b-0">{children}</td>,
}

interface MarkdownProps {
    children: string
    className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
    return (
        <div className={cn("min-w-0 space-y-2 text-sm wrap-break-word", className)}>
        <ReactMarkdown components={components}>{children}</ReactMarkdown>
        </div>
    )
}