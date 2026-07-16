import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { setoresApi, ApiError } from "@/lib/api"
import type { Setor, Unidade } from "@/lib/types"
import { exportarCsv } from "@/lib/csv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListToolbar } from "@/components/list-toolbar"
import { createSelectionColumn, DataTable } from "@/components/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const NENHUMA_UNIDADE = "nenhuma"

const UNIDADE_LABEL: Record<Unidade, string> = {
  Administracao: "Administração",
  Unidade1: "Unidade 1",
  Unidade2: "Unidade 2",
}

const setorSchema = z.object({
  nomeDoSetor: z.string().min(3, "O nome deve ter entre 3 e 255 caracteres.").max(255),
  responsavel: z.string().max(255).optional(),
  unidade: z.enum(["Administracao", "Unidade1", "Unidade2", NENHUMA_UNIDADE]),
})

type SetorFormValues = z.infer<typeof setorSchema>

export function SetoresPage() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Setor | null>(null)
  const [removendo, setRemovendo] = useState<Setor | null>(null)
  const [selecao, setSelecao] = useState<RowSelectionState>({})
  const [excluindoSelecionados, setExcluindoSelecionados] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState("")

  const form = useForm<SetorFormValues>({
    resolver: zodResolver(setorSchema),
    defaultValues: { nomeDoSetor: "", responsavel: "", unidade: NENHUMA_UNIDADE },
  })

  async function carregar() {
    setCarregando(true)
    try {
      setSetores(await setoresApi.listar())
      setSelecao({})
    } catch (error) {
      toast.error("Não foi possível carregar os setores.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const setoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return setores
    return setores.filter((setor) => setor.nomeDoSetor.toLowerCase().includes(termo))
  }, [setores, busca])

  const selecionados = Object.keys(selecao).filter((id) => selecao[id])

  async function confirmarExclusaoEmMassa() {
    try {
      await Promise.all(selecionados.map((id) => setoresApi.remover(id)))
      toast.success("Setores removidos com sucesso.")
      setExcluindoSelecionados(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover setores.")
    }
  }

  function exportar() {
    exportarCsv("setores.csv", setoresFiltrados, [
      { cabecalho: "Nome do setor", valor: (setor) => setor.nomeDoSetor },
      { cabecalho: "Responsável", valor: (setor) => setor.responsavel ?? "" },
    ])
  }

  function abrirNovo() {
    setEditando(null)
    form.reset({ nomeDoSetor: "", responsavel: "", unidade: NENHUMA_UNIDADE })
    setDialogAberto(true)
  }

  function abrirEdicao(setor: Setor) {
    setEditando(setor)
    form.reset({
      nomeDoSetor: setor.nomeDoSetor,
      responsavel: setor.responsavel ?? "",
      unidade: setor.unidade ?? NENHUMA_UNIDADE,
    })
    setDialogAberto(true)
  }

  async function salvar(values: SetorFormValues) {
    try {
      const dto = {
        nomeDoSetor: values.nomeDoSetor,
        responsavel: values.responsavel || null,
        unidade: values.unidade === NENHUMA_UNIDADE ? null : values.unidade,
      }

      if (editando) {
        await setoresApi.atualizar(editando.id, dto)
        toast.success("Setor atualizado com sucesso.")
      } else {
        await setoresApi.criar(dto)
        toast.success("Setor cadastrado com sucesso.")
      }
      setDialogAberto(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao salvar setor.")
    }
  }

  async function confirmarRemocao() {
    if (!removendo) return

    try {
      await setoresApi.remover(removendo.id)
      toast.success("Setor removido com sucesso.")
      setRemovendo(null)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover setor.")
    }
  }

  const columns: ColumnDef<Setor, unknown>[] = [
    createSelectionColumn<Setor>(),
    {
      accessorKey: "nomeDoSetor",
      header: "Nome do setor",
      cell: ({ row }) => <span className="font-medium">{row.original.nomeDoSetor}</span>,
    },
    {
      accessorKey: "responsavel",
      header: "Responsável",
      cell: ({ row }) => row.original.responsavel || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "unidade",
      header: "Unidade",
      cell: ({ row }) =>
        row.original.unidade ? (
          <Badge variant="secondary">{UNIDADE_LABEL[row.original.unidade]}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
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
            <DropdownMenuItem onClick={() => abrirEdicao(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setRemovendo(row.original)}>
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        title="Setores"
        description="Cadastro de setores da empresa."
        selectedCount={selecionados.length}
        onDeleteSelected={() => setExcluindoSelecionados(true)}
        searchOpen={buscaAberta}
        onToggleSearch={() => setBuscaAberta((atual) => !atual)}
        searchValue={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por nome do setor..."
        onExport={exportar}
        addLabel="Novo setor"
        onAdd={abrirNovo}
      />

      <DataTable
        columns={columns}
        data={setoresFiltrados}
        loading={carregando}
        getRowId={(setor) => setor.id}
        rowSelection={selecao}
        onRowSelectionChange={setSelecao}
        emptyMessage="Nenhum setor cadastrado."
      />

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar setor" : "Novo setor"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(salvar)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="nomeDoSetor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do setor</FormLabel>
                    <FormControl>
                      <Input placeholder="Recursos Humanos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NENHUMA_UNIDADE}>Nenhuma</SelectItem>
                        {(Object.keys(UNIDADE_LABEL) as Unidade[]).map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {UNIDADE_LABEL[unidade]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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

      <AlertDialog open={!!removendo} onOpenChange={(open) => !open && setRemovendo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover setor?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. {removendo?.nomeDoSetor} será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarRemocao}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={excluindoSelecionados} onOpenChange={setExcluindoSelecionados}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover setores selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. {selecionados.length} setor(es) serão removidos
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusaoEmMassa}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
