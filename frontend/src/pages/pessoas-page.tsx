import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { funcionariosApi, setoresApi, ApiError } from "@/lib/api"
import type { Funcionario, Setor } from "@/lib/types"
import { exportarCsv } from "@/lib/csv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ListToolbar } from "@/components/list-toolbar"
import { createSelectionColumn, DataTable } from "@/components/data-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const SEM_SETOR = "sem-setor"
const TODOS_OS_SETORES = "todos"

const pessoaSchema = z.object({
  nome: z.string().min(3, "O nome deve ter entre 3 e 255 caracteres.").max(255),
  setorId: z.string(),
})

type PessoaFormValues = z.infer<typeof pessoaSchema>

export function PessoasPage() {
  const [pessoas, setPessoas] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [removendo, setRemovendo] = useState<Funcionario | null>(null)
  const [selecao, setSelecao] = useState<RowSelectionState>({})
  const [excluindoSelecionados, setExcluindoSelecionados] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroSetor, setFiltroSetor] = useState(TODOS_OS_SETORES)

  const form = useForm<PessoaFormValues>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: { nome: "", setorId: SEM_SETOR },
  })

  async function carregar() {
    setCarregando(true)
    try {
      const [listaPessoas, listaSetores] = await Promise.all([
        funcionariosApi.listar(),
        setoresApi.listar(),
      ])
      setPessoas(listaPessoas)
      setSetores(listaSetores)
      setSelecao({})
    } catch (error) {
      toast.error("Não foi possível carregar as pessoas.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const pessoasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return pessoas.filter((pessoa) => {
      const combinaBusca = !termo || pessoa.nome.toLowerCase().includes(termo)
      const combinaSetor =
        filtroSetor === TODOS_OS_SETORES ||
        (filtroSetor === SEM_SETOR ? !pessoa.setorId : pessoa.setorId === filtroSetor)
      return combinaBusca && combinaSetor
    })
  }, [pessoas, busca, filtroSetor])

  const selecionados = Object.keys(selecao).filter((id) => selecao[id])

  async function confirmarExclusaoEmMassa() {
    try {
      await Promise.all(selecionados.map((id) => funcionariosApi.remover(id)))
      toast.success("Pessoas removidas com sucesso.")
      setExcluindoSelecionados(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover pessoas.")
    }
  }

  function exportar() {
    exportarCsv("pessoas.csv", pessoasFiltradas, [
      { cabecalho: "Nome", valor: (pessoa) => pessoa.nome },
      { cabecalho: "Setor", valor: (pessoa) => pessoa.nomeDoSetor ?? "" },
    ])
  }

  function abrirNovo() {
    setEditando(null)
    form.reset({ nome: "", setorId: SEM_SETOR })
    setDialogAberto(true)
  }

  function abrirEdicao(pessoa: Funcionario) {
    setEditando(pessoa)
    form.reset({ nome: pessoa.nome, setorId: pessoa.setorId ?? SEM_SETOR })
    setDialogAberto(true)
  }

  async function salvar(values: PessoaFormValues) {
    try {
      const dto = {
        nome: values.nome,
        setorId: values.setorId === SEM_SETOR ? null : values.setorId,
      }

      if (editando) {
        await funcionariosApi.atualizar(editando.id, dto)
        toast.success("Pessoa atualizada com sucesso.")
      } else {
        await funcionariosApi.criar(dto)
        toast.success("Pessoa cadastrada com sucesso.")
      }
      setDialogAberto(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao salvar pessoa.")
    }
  }

  async function confirmarRemocao() {
    if (!removendo) return

    try {
      await funcionariosApi.remover(removendo.id)
      toast.success("Pessoa removida com sucesso.")
      setRemovendo(null)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover pessoa.")
    }
  }

  const columns: ColumnDef<Funcionario, unknown>[] = [
    createSelectionColumn<Funcionario>(),
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
    },
    {
      accessorKey: "nomeDoSetor",
      header: "Setor",
      cell: ({ row }) =>
        row.original.nomeDoSetor ? (
          <Badge variant="secondary">{row.original.nomeDoSetor}</Badge>
        ) : (
          <span className="text-muted-foreground">Sem setor</span>
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
        title="Pessoas"
        description="Cadastro de funcionários e seus setores."
        selectedCount={selecionados.length}
        onDeleteSelected={() => setExcluindoSelecionados(true)}
        searchOpen={buscaAberta}
        onToggleSearch={() => setBuscaAberta((atual) => !atual)}
        searchValue={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por nome..."
        onExport={exportar}
        addLabel="Nova pessoa"
        onAdd={abrirNovo}
      />

      <div className="flex items-center gap-2">
        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Todos os setores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_OS_SETORES}>Todos os setores</SelectItem>
            <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
            {setores.map((setor) => (
              <SelectItem key={setor.id} value={setor.id}>
                {setor.nomeDoSetor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={pessoasFiltradas}
        loading={carregando}
        getRowId={(pessoa) => pessoa.id}
        rowSelection={selecao}
        onRowSelectionChange={setSelecao}
        emptyMessage="Nenhuma pessoa cadastrada."
      />

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar pessoa" : "Nova pessoa"}</DialogTitle>
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
                name="setorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
                        {setores.map((setor) => (
                          <SelectItem key={setor.id} value={setor.id}>
                            {setor.nomeDoSetor}
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
            <AlertDialogTitle>Remover pessoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. {removendo?.nome} será removido permanentemente.
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
            <AlertDialogTitle>Remover pessoas selecionadas?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. {selecionados.length} pessoa(s) serão removidas
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
