import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"

export function RequireAdmin() {
  const { usuario } = useAuth()

  if (!usuario?.isAdmin) {
    return <Navigate to="/estatisticas/geral" replace />
  }

  return <Outlet />
}
