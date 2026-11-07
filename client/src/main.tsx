import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router/dom"
import { toast } from "sonner"
import "@fontsource-variable/inter"
import "./index.css"
import { router } from "./router"
import { setUnauthorizedHandler } from "@/api/client"
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/queryClient"
import "@/store/theme.store"

// AUTH-6: the API client already clears the session on a 401, and the route
// guard then redirects to /login. Here we only tell the user why.
setUnauthorizedHandler(() => {
  queryClient.clear()
  toast.error("Your session has expired. Please log in again.", { id: "session-expired" })
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)