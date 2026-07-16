import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

import { authApi, getToken, setAoNaoAutorizado, setToken } from "@/lib/api"
import type { LoginInput, Usuario } from "@/lib/types"

const USUARIO_STORAGE_KEY = "fluvimar:usuario"

type AuthContextValue = {
  usuario: Usuario | null
  carregando: boolean
  login: (dto: LoginInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem(USUARIO_STORAGE_KEY)
    setUsuario(null)
  }, [])

  useEffect(() => {
    setAoNaoAutorizado(logout)
  }, [logout])

  useEffect(() => {
    const token = getToken()
    const usuarioSalvo = localStorage.getItem(USUARIO_STORAGE_KEY)
    if (token && usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo) as Usuario)
      } catch {
        logout()
      }
    }
    setCarregando(false)
  }, [logout])

  async function login(dto: LoginInput) {
    const resposta = await authApi.login(dto)
    setToken(resposta.token)
    localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(resposta.usuario))
    setUsuario(resposta.usuario)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider.")
  return context
}
