import { LogOut } from "lucide-react"
import { Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { LgpdNoticeDialog } from "@/components/lgpd-notice-dialog"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const TITULOS_POR_ROTA: Record<string, string> = {
  "/apontamentos": "Apontamentos",
  "/pessoas": "Pessoas",
  "/setores": "Setores",
  "/atestados": "Atestados",
  "/estatisticas/geral": "Estatísticas gerais",
  "/estatisticas/funcionario": "Estatísticas por funcionário",
  "/usuarios": "Usuários",
}

function tituloDaPagina(pathname: string): string {
  const rota = Object.keys(TITULOS_POR_ROTA).find((rota) => pathname.startsWith(rota))
  return rota ? TITULOS_POR_ROTA[rota] : "Fluvimar"
}

function lerSidebarPersistida(): boolean {
  const match = document.cookie.match(/(?:^|; )sidebar_state=(true|false)/)
  return match ? match[1] === "true" : true
}

export function AppLayout() {
  const location = useLocation()
  const { usuario, logout } = useAuth()

  return (
    <SidebarProvider defaultOpen={lerSidebarPersistida()}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 supports-backdrop-filter:bg-background/70 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-sm">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h2 className="text-sm font-medium">{tituloDaPagina(location.pathname)}</h2>
          <img
            src="/img/fluvimar-frase.png"
            alt="Fluvimar"
            className="absolute left-1/2 top-1/2 h-8 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-muted-foreground hidden text-sm sm:inline">{usuario?.nome}</span>
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
              <LogOut />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <LgpdNoticeDialog />
    </SidebarProvider>
  )
}
