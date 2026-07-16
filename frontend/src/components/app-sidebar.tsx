import { NavLink, useLocation } from "react-router-dom"
import { BarChart3, ClipboardList, Users, Building2, FileText, UserCog } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const consultas = [
  { title: "Apontamentos", url: "/apontamentos", icon: ClipboardList },
  { title: "Estatísticas Gerais", url: "/estatisticas/geral", icon: BarChart3 },
  { title: "Estatísticas por Funcionário", url: "/estatisticas/funcionario", icon: BarChart3 },
]

const cadastros = [
  { title: "Pessoas", url: "/pessoas", icon: Users },
  { title: "Setores", url: "/setores", icon: Building2 },
  { title: "Atestados", url: "/atestados", icon: FileText },
]

const cadastroUsuarios = { title: "Usuários", url: "/usuarios", icon: UserCog }

export function AppSidebar() {
  const location = useLocation()
  const { usuario } = useAuth()
  const itensCadastros = usuario?.isAdmin ? [...cadastros, cadastroUsuarios] : cadastros

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 border-b py-3">
        <div className="flex items-center gap-2">
          <img src="/img/image.png" alt="Fluvimar" className="size-8 shrink-0 rounded-md object-contain" />
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm leading-tight font-semibold">Fluvimar</span>
            <span className="text-sidebar-foreground/60 truncate text-xs leading-tight">
              Controle de atestados
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Consultas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {consultas.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname.startsWith(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itensCadastros.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={location.pathname.startsWith(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
