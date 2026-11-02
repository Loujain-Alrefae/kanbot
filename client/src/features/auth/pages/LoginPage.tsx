import { Link } from "react-router"
import { AuthLayout } from "../components/AuthLayout"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up your sprint."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}