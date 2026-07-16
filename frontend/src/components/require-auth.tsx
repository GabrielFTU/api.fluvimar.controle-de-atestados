import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"

export function RequireAuth() {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return null

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
