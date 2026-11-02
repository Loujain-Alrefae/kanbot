import { Link } from "react-router"
import { AuthLayout } from "../components/AuthLayout"
import { RegisterForm } from "../components/RegisterForm"

export function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Plan sprints with an AI teammate."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}