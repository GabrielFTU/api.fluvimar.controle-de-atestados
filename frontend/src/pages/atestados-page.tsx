import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { atestadosApi, funcionariosApi, medicosApi, ApiError } from "@/lib/api"
import { CidCombobox } from "@/components/cid-combobox"
import { FuncionarioCombobox } from "@/components/funcionario-combobox"
import { MedicoCombobox } from "@/components/medico-combobox"
import type { Atestado, ClassificacaoAtestado, Funcionario, Medico, TipoAtestado } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import { formatarData } from "@/lib/format"

const TODOS_OS_SETORES = "todos"
const SEM_SETOR = "sem-setor"
const TODOS_OS_STATUS = "todos"
const TODAS_AS_CLASSIFICACOES = "todas"

const CLASSIFICACAO_LABEL: Record<ClassificacaoAtestado, string> = {
  Atestado: "Atestado",
  Declaracao: "Declaração",
  Acompanhante: "Acompanhante",
}

const atestadoSchema = z
  .object({
    funcionarioId: z.string().min(1, "Selecione um funcionário."),
    cid: z
      .string()
      .max(6, "O CID deve ter no máximo 6 caracteres.")
      .refine((value) => value.length === 0 || value.length >= 2, {
        message: "O CID deve ter entre 2 e 6 caracteres.",
      })
      .optional(),
    tipoAtestado: z.enum(["DiaCompleto", "Horario"]),
    classificacao: z.enum(["Atestado", "Declaracao", "Acompanhante"]),
    medicoId: z.string().optional(),
    diaAfastamento: z.string().min(1, "Informe a data do atestado."),
    diaRetorno: z.string().optional(),
    horaInicio: z.string().optional(),
    horaFim: z.string().optional(),
    observacoes: z.string().max(500, "Máximo de 500 caracteres.").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.tipoAtestado === "DiaCompleto") {
      if (!values.diaRetorno) {
        ctx.addIssue({
          code: "custom",
          path: ["diaRetorno"],
          message: "Informe o dia de retorno.",
        })
      }
    } else {
      if (!values.horaInicio) {
        ctx.addIssue({ code: "custom", path: ["horaInicio"], message: "Informe o horário de início." })
      }
      if (!values.horaFim) {
        ctx.addIssue({ code: "custom", path: ["horaFim"], message: "Informe o horário de fim." })
      }
      if (values.horaInicio && values.horaFim && values.horaFim <= values.horaInicio) {
        ctx.addIssue({
          code: "custom",
          path: ["horaFim"],
          message: "O horário de fim deve ser posterior ao início.",
        })
      }
    }
  })

type AtestadoFormValues = z.infer<typeof atestadoSchema>

function statusAtestado(atestado: Atestado): "ativo" | "encerrado" {
  if (!atestado.diaAfastamento || !atestado.diaRetorno) return "encerrado"

  const hoje = new Date().setUTCHours(0, 0, 0, 0)
  const afastamento = new Date(atestado.diaAfastamento).setUTCHours(0, 0, 0, 0)
  const retorno = new Date(atestado.diaRetorno).setUTCHours(0, 0, 0, 0)

  return hoje >= afastamento && hoje <= retorno ? "ativo" : "encerrado"
}

export function AtestadosPage() {
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Atestado | null>(null)
  const [removendo, setRemovendo] = useState<Atestado | null>(null)
  const [selecao, setSelecao] = useState<RowSelectionState>({})
  const [excluindoSelecionados, setExcluindoSelecionados] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroSetor, setFiltroSetor] = useState(TODOS_OS_SETORES)
  const [filtroStatus, setFiltroStatus] = useState(TODOS_OS_STATUS)
  const [filtroClassificacao, setFiltroClassificacao] = useState(TODAS_AS_CLASSIFICACOES)

  const form = useForm<AtestadoFormValues>({
    resolver: zodResolver(atestadoSchema),
    defaultValues: {
      funcionarioId: "",
      cid: "",
      tipoAtestado: "DiaCompleto",
      classificacao: "Atestado",
      medicoId: "",
      diaAfastamento: "",
      diaRetorno: "",
      horaInicio: "",
      horaFim: "",
      observacoes: "",
    },
  })

  const tipoAtestado = form.watch("tipoAtestado")

  async function carregar() {
    setCarregando(true)
    try {
      const [listaAtestados, listaFuncionarios, listaMedicos] = await Promise.all([
        atestadosApi.listar(),
        funcionariosApi.listar(),
        medicosApi.listar(),
      ])
      setAtestados(listaAtestados)
      setFuncionarios(listaFuncionarios)
      setMedicos(listaMedicos)
      setSelecao({})
    } catch (error) {
      toast.error("Não foi possível carregar os atestados.")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const setorPorFuncionario = useMemo(() => {
    const mapa = new Map<string, string | null>()
    for (const funcionario of funcionarios) mapa.set(funcionario.id, funcionario.setorId)
    return mapa
  }, [funcionarios])

  const setoresDisponiveis = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const funcionario of funcionarios) {
      if (funcionario.setorId && funcionario.nomeDoSetor) {
        mapa.set(funcionario.setorId, funcionario.nomeDoSetor)
      }
    }
    return Array.from(mapa.entries()).map(([id, nome]) => ({ id, nome }))
  }, [funcionarios])

  const atestadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return atestados.filter((atestado) => {
      const combinaBusca = !termo || atestado.nomeFuncionario.toLowerCase().includes(termo)
      const combinaStatus =
        filtroStatus === TODOS_OS_STATUS || statusAtestado(atestado) === filtroStatus
      const setorId = setorPorFuncionario.get(atestado.funcionarioId) ?? null
      const combinaSetor =
        filtroSetor === TODOS_OS_SETORES ||
        (filtroSetor === SEM_SETOR ? !setorId : setorId === filtroSetor)
      const combinaClassificacao =
        filtroClassificacao === TODAS_AS_CLASSIFICACOES || atestado.classificacao === filtroClassificacao
      return combinaBusca && combinaStatus && combinaSetor && combinaClassificacao
    })
  }, [atestados, busca, filtroStatus, filtroSetor, filtroClassificacao, setorPorFuncionario])

  const selecionados = Object.keys(selecao).filter((id) => selecao[id])

  async function confirmarExclusaoEmMassa() {
    try {
      await Promise.all(selecionados.map((id) => atestadosApi.remover(id)))
      toast.success("Atestados removidos com sucesso.")
      setExcluindoSelecionados(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover atestados.")
    }
  }

  function exportar() {
    exportarCsv("atestados.csv", atestadosFiltrados, [
      { cabecalho: "Funcionário", valor: (atestado) => atestado.nomeFuncionario },
      { cabecalho: "Classificação", valor: (atestado) => CLASSIFICACAO_LABEL[atestado.classificacao] },
      { cabecalho: "Médico", valor: (atestado) => atestado.nomeMedico ?? "" },
      { cabecalho: "CID", valor: (atestado) => atestado.cid ?? "" },
      {
        cabecalho: "Tipo",
        valor: (atestado) => (atestado.tipoAtestado === "Horario" ? "Horário" : "Dia completo"),
      },
      { cabecalho: "Afastamento", valor: (atestado) => formatarData(atestado.diaAfastamento) },
      { cabecalho: "Retorno", valor: (atestado) => formatarData(atestado.diaRetorno) },
      {
        cabecalho: "Duração",
        valor: (atestado) =>
          atestado.tipoAtestado === "Horario"
            ? `${atestado.totalHoras ?? 0}h (${atestado.horaInicio?.slice(0, 5) ?? ""}–${atestado.horaFim?.slice(0, 5) ?? ""})`
            : `${atestado.totalDiasFora ?? 0} dia(s)`,
      },
      {
        cabecalho: "Status",
        valor: (atestado) => (statusAtestado(atestado) === "ativo" ? "Ativo" : "Encerrado"),
      },
      { cabecalho: "Observações", valor: (atestado) => atestado.observacoes ?? "" },
    ])
  }

  function abrirNovo() {
    setEditando(null)
    form.reset({
      funcionarioId: "",
      cid: "",
      tipoAtestado: "DiaCompleto",
      classificacao: "Atestado",
      medicoId: "",
      diaAfastamento: "",
      diaRetorno: "",
      horaInicio: "",
      horaFim: "",
      observacoes: "",
    })
    setDialogAberto(true)
  }

  function abrirEdicao(atestado: Atestado) {
    setEditando(atestado)
    form.reset({
      funcionarioId: atestado.funcionarioId,
      cid: atestado.cid ?? "",
      tipoAtestado: atestado.tipoAtestado,
      classificacao: atestado.classificacao,
      medicoId: atestado.medicoId ?? "",
      diaAfastamento: atestado.diaAfastamento?.slice(0, 10) ?? "",
      diaRetorno: atestado.diaRetorno?.slice(0, 10) ?? "",
      horaInicio: atestado.horaInicio?.slice(0, 5) ?? "",
      horaFim: atestado.horaFim?.slice(0, 5) ?? "",
      observacoes: atestado.observacoes ?? "",
    })
    setDialogAberto(true)
  }

  async function salvar(values: AtestadoFormValues) {
    try {
      const dto = {
        funcionarioId: values.funcionarioId,
        cid: values.cid || null,
        tipoAtestado: values.tipoAtestado,
        classificacao: values.classificacao,
        medicoId: values.medicoId || null,
        diaAfastamento: values.diaAfastamento,
        diaRetorno: values.tipoAtestado === "Horario" ? values.diaAfastamento : values.diaRetorno!,
        horaInicio: values.tipoAtestado === "Horario" ? `${values.horaInicio}:00` : null,
        horaFim: values.tipoAtestado === "Horario" ? `${values.horaFim}:00` : null,
        observacoes: values.observacoes || null,
      }

      if (editando) {
        await atestadosApi.atualizar(editando.id, dto)
        toast.success("Atestado atualizado com sucesso.")
      } else {
        await atestadosApi.criar(dto)
        toast.success("Atestado cadastrado com sucesso.")
      }
      setDialogAberto(false)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao salvar atestado.")
    }
  }

  async function confirmarRemocao() {
    if (!removendo) return

    try {
      await atestadosApi.remover(removendo.id)
      toast.success("Atestado removido com sucesso.")
      setRemovendo(null)
      await carregar()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao remover atestado.")
    }
  }

  const columns: ColumnDef<Atestado, unknown>[] = [
    createSelectionColumn<Atestado>(),
    {
      accessorKey: "nomeFuncionario",
      header: "Funcionário",
      cell: ({ row }) => <span className="font-medium">{row.original.nomeFuncionario}</span>,
    },
    {
      accessorKey: "classificacao",
      header: "Classificação",
      cell: ({ row }) => (
        <Badge variant={row.original.classificacao === "Atestado" ? "secondary" : "outline"}>
          {CLASSIFICACAO_LABEL[row.original.classificacao]}
        </Badge>
      ),
    },
    {
      accessorKey: "nomeMedico",
      header: "Médico",
      cell: ({ row }) => row.original.nomeMedico || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "cid",
      header: "CID",
      cell: ({ row }) => row.original.cid || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "diaAfastamento",
      header: "Afastamento",
      cell: ({ row }) => formatarData(row.original.diaAfastamento),
    },
    {
      accessorKey: "diaRetorno",
      header: "Retorno",
      cell: ({ row }) => formatarData(row.original.diaRetorno),
    },
    {
      id: "duracao",
      header: "Duração",
      accessorFn: (atestado) =>
        atestado.tipoAtestado === "Horario" ? (atestado.totalHoras ?? 0) : (atestado.totalDiasFora ?? 0),
      cell: ({ row }) => {
        const atestado = row.original

        if (atestado.tipoAtestado === "Horario") {
          return (
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary">{atestado.totalHoras ?? 0}h</Badge>
              <span className="text-muted-foreground text-xs">
                {atestado.horaInicio?.slice(0, 5)}–{atestado.horaFim?.slice(0, 5)}
              </span>
            </div>
          )
        }

        const dias = atestado.totalDiasFora
        return (
          <div className="flex items-center gap-1.5">
            <span>{dias ?? "—"}</span>
            {dias !== null && dias > 15 && (
              <Badge
                variant="outline"
                className="border-warning text-warning-foreground bg-warning/15"
                title="Acima de 15 dias: a partir do 16º dia o INSS assume o benefício"
              >
                +15d
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (atestado) => statusAtestado(atestado),
      cell: ({ row }) => {
        const status = statusAtestado(row.original)
        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span
              className={`size-1.5 rounded-full ${
                status === "ativo" ? "bg-success" : "bg-muted-foreground"
              }`}
            />
            {status === "ativo" ? "Ativo" : "Encerrado"}
          </span>
        )
      },
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
        title="Atestados"
        description="Cadastro de atestados médicos."
        selectedCount={selecionados.length}
        onDeleteSelected={() => setExcluindoSelecionados(true)}
        searchOpen={buscaAberta}
        onToggleSearch={() => setBuscaAberta((atual) => !atual)}
        searchValue={busca}
        onSearchChange={setBusca}
        searchPlaceholder="Buscar por funcionário..."
        onExport={exportar}
        addLabel="Novo atestado"
        onAdd={abrirNovo}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-36" size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_OS_STATUS}>Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_OS_SETORES}>Todos os setores</SelectItem>
            <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
            {setoresDisponiveis.map((setor) => (
              <SelectItem key={setor.id} value={setor.id}>
                {setor.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroClassificacao} onValueChange={setFiltroClassificacao}>
          <SelectTrigger className="w-44" size="sm">
            <SelectValue placeholder="Classificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_AS_CLASSIFICACOES}>Todas as classificações</SelectItem>
            {Object.entries(CLASSIFICACAO_LABEL).map(([valor, rotulo]) => (
              <SelectItem key={valor} value={valor}>
                {rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={atestadosFiltrados}
        loading={carregando}
        getRowId={(atestado) => atestado.id}
        rowSelection={selecao}
        onRowSelectionChange={setSelecao}
        emptyMessage="Nenhum atestado cadastrado."
      />

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar atestado" : "Novo atestado"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(salvar)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="funcionarioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funcionário</FormLabel>
                    <FormControl>
                      <FuncionarioCombobox
                        value={field.value}
                        onChange={field.onChange}
                        funcionarios={funcionarios}
                        onFuncionarioCriado={(novo) => setFuncionarios((atual) => [...atual, novo])}
                        placeholder="Selecione um funcionário"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoAtestado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de atestado</FormLabel>
                      <Select
                        onValueChange={(valor) => field.onChange(valor as TipoAtestado)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DiaCompleto">Dia completo</SelectItem>
                          <SelectItem value="Horario">Horário específico</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classificacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classificação</FormLabel>
                      <Select
                        onValueChange={(valor) => field.onChange(valor as ClassificacaoAtestado)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CLASSIFICACAO_LABEL).map(([valor, rotulo]) => (
                            <SelectItem key={valor} value={valor}>
                              {rotulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {tipoAtestado === "DiaCompleto" ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="diaAfastamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do afastamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diaRetorno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do retorno</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="diaAfastamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora início</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horaFim"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora fim</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CID</FormLabel>
                      <FormControl>
                        <CidCombobox value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico</FormLabel>
                      <FormControl>
                        <MedicoCombobox
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          medicos={medicos}
                          onMedicoCriado={(novo) => setMedicos((atual) => [...atual, novo])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Opcional" {...field} />
                    </FormControl>
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
            <AlertDialogTitle>Remover atestado?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O atestado de {removendo?.nomeFuncionario} será
              removido permanentemente.
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
            <AlertDialogTitle>Remover atestados selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. {selecionados.length} atestado(s) serão removidos
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
