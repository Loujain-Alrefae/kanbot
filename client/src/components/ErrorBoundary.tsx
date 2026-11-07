import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { ErrorScreen } from "./ErrorScreen"

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    failed: boolean
}

/* A class component: React offers error boundaries only in this form. Wraps everything outside the router. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { failed: false }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { failed: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Unexpected error:", error, info.componentStack) // development only
    }

    render() {
        return this.state.failed ? <ErrorScreen /> : this.props.children
    }
}