import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"

import { ApiError, usuariosApi } from "@/lib/api"
import type { Usuario } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/data-table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter entre 3 e 255 caracteres.").max(255),
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.").max(50),
  isAdmin: z.boolean(),
})

type UsuarioFormValues = z.infer<typeof usuarioSchema>

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nome: "", email: "", senha: "", isAdmin: false },
  })

  async function carregar() {
    setCarregando(true)
    try {
      setUsuarios(await usuariosApi.listar())
    } catch (error) {
      toast.error("Não foi possível carregar os usuários.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirNovo() {
    form.reset({ nome: "", email: "", senha: "", isAdmin: false })
    setDialogAberto(true)
  }

  async function salvar(values: UsuarioFormValues) {
    try {
      await usuariosApi.criar(values)
      toast.success("Usuário cadastrado com sucesso.")
      setDialogAberto(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao cadastrar usuário.")
    }
  }

  async function alternarAtivo(usuario: Usuario) {
    try {
      if (usuario.isActive) {
        await usuariosApi.desativar(usuario.id)
        toast.success(`${usuario.nome} foi desativado.`)
      } else {
        await usuariosApi.ativar(usuario.id)
        toast.success(`${usuario.nome} foi ativado.`)
      }
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao atualizar usuário.")
    }
  }

  const columns: ColumnDef<Usuario, unknown>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      id: "perfil",
      header: "Perfil",
      cell: ({ row }) => (
        <Badge variant={row.original.isAdmin ? "default" : "secondary"}>
          {row.original.isAdmin ? "Administrador" : "Operador"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "acoes",
      size: 48,
      enableSorting: false,
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => alternarAtivo(row.original)}>
              {row.original.isActive ? "Desativar" : "Ativar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground text-sm">
            Contas com acesso ao sistema de controle de atestados.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus />
          Novo usuário
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={usuarios}
        loading={carregando}
        getRowId={(usuario) => usuario.id}
        emptyMessage="Nenhum usuário cadastrado."
      />

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(salvar)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="voce@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="flex flex-col gap-1">
                      <FormLabel className="font-normal">Administrador</FormLabel>
                      <FormDescription>
                        Administradores podem gerenciar outros usuários e rodar migrações.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
