import { ArrowLeft, Compass } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"

export function NotFoundPage() {
  const navigate = useNavigate()

  // React Router stores the position in the history stack as `idx`. 0 = the user opened this URL directly,
  // so there is nothing to go back to and the button is hidden (otherwise it would leave the app).
  const canGoBack = typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Compass className="size-8" aria-hidden="true" />
        </div>

        <p aria-hidden="true" className="mt-6 text-7xl font-extrabold tracking-tight text-primary">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn't exist, was moved, or the link is incorrect.
        </p>

        <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          {canGoBack && (
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Go back
            </Button>
          )}
          <Link to="/projects" className={buttonVariants()}>
            Go to projects
          </Link>
        </div>
      </div>
    </main>
  )
}