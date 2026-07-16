import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/app-layout"
import { RequireAdmin } from "@/components/require-admin"
import { RequireAuth } from "@/components/require-auth"
import { LoginPage } from "@/pages/login-page"

const ApontamentosPage = lazy(() =>
  import("@/pages/apontamentos-page").then((m) => ({ default: m.ApontamentosPage }))
)
const PessoasPage = lazy(() =>
  import("@/pages/pessoas-page").then((m) => ({ default: m.PessoasPage }))
)
const SetoresPage = lazy(() =>
  import("@/pages/setores-page").then((m) => ({ default: m.SetoresPage }))
)
const AtestadosPage = lazy(() =>
  import("@/pages/atestados-page").then((m) => ({ default: m.AtestadosPage }))
)
const EstatisticasGeralPage = lazy(() =>
  import("@/pages/estatisticas-geral-page").then((m) => ({ default: m.EstatisticasGeralPage }))
)
const EstatisticasFuncionarioPage = lazy(() =>
  import("@/pages/estatisticas-funcionario-page").then((m) => ({
    default: m.EstatisticasFuncionarioPage,
  }))
)
const UsuariosPage = lazy(() =>
  import("@/pages/usuarios-page").then((m) => ({ default: m.UsuariosPage }))
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/apontamentos" replace />} />
          <Route
            path="/apontamentos"
            element={
              <Suspense fallback={null}>
                <ApontamentosPage />
              </Suspense>
            }
          />
          <Route
            path="/pessoas"
            element={
              <Suspense fallback={null}>
                <PessoasPage />
              </Suspense>
            }
          />
          <Route
            path="/setores"
            element={
              <Suspense fallback={null}>
                <SetoresPage />
              </Suspense>
            }
          />
          <Route
            path="/atestados"
            element={
              <Suspense fallback={null}>
                <AtestadosPage />
              </Suspense>
            }
          />
          <Route
            path="/estatisticas/geral"
            element={
              <Suspense fallback={null}>
                <EstatisticasGeralPage />
              </Suspense>
            }
          />
          <Route
            path="/estatisticas/funcionario"
            element={
              <Suspense fallback={null}>
                <EstatisticasFuncionarioPage />
              </Suspense>
            }
          />
          <Route element={<RequireAdmin />}>
            <Route
              path="/usuarios"
              element={
                <Suspense fallback={null}>
                  <UsuariosPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
