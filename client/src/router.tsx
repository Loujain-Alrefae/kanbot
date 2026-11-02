import { createBrowserRouter, Navigate } from "react-router"
import { GuestRoute, ProtectedRoute } from "@/features/auth/components/RouteGuards"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { AppShell } from "@/components/layout/AppShell"
import { ProjectsPage } from "@/features/projects/pages/ProjectsPage"
import { BacklogPage } from "@/features/backlog/pages/BacklogPage"
import { BoardPage } from "@/features/board/pages/BoardPage"
import { SprintsPage } from "@/features/sprints/pages/SprintsPage"
import { ProjectRoute } from "@/features/projects/components/ProjectRoute"

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/projects", element: <ProjectsPage /> },
          {
            path: "/projects/:projectId",
            element: <ProjectRoute />,
            children: [
              { index: true, element: <Navigate to="backlog" replace /> },
              { path: "backlog", element: <BacklogPage /> },
              { path: "board", element: <BoardPage /> },
              { path: "sprints", element: <SprintsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/projects" replace /> },
  { path: "*", element: <div className="p-6">Page not found</div> },
])