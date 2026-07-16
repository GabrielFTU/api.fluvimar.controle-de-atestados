import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarClock, Clock, ClipboardList, Download } from "lucide-react"
import { toast } from "sonner"

import { atestadosApi, funcionariosApi } from "@/lib/api"
import type { Atestado, Funcionario } from "@/lib/types"
import { formatarData } from "@/lib/format"
import { exportarCsv } from "@/lib/csv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/kpi-card"
import { DataTable } from "@/components/data-table"
import { FuncionarioCombobox } from "@/components/funcionario-combobox"

const TODOS_OS_FUNCIONARIOS = "todos"

export function ApontamentosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [atestados, setAtestados] = useState<Atestado[]>([])
  const [funcionarioId, setFuncionarioId] = useState<string>(TODOS_OS_FUNCIONARIOS)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      try {
        const [listaFuncionarios, listaAtestados] = await Promise.all([
          funcionariosApi.listar(),
          atestadosApi.listar(),
        ])
        setFuncionarios(listaFuncionarios)
        setAtestados(listaAtestados)
      } catch (error) {
        toast.error("Não foi possível carregar os apontamentos.")
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  const registrosFiltrados = useMemo(
    () =>
      funcionarioId === TODOS_OS_FUNCIONARIOS
        ? atestados
        : atestados.filter((atestado) => atestado.funcionarioId === funcionarioId),
    [atestados, funcionarioId]
  )

  const totalDias = useMemo(
    () => registrosFiltrados.reduce((total, atestado) => total + (atestado.totalDiasFora ?? 0), 0),
    [registrosFiltrados]
  )

  const totalHoras = useMemo(
    () => registrosFiltrados.reduce((total, atestado) => total + (atestado.totalHoras ?? 0), 0),
    [registrosFiltrados]
  )

  function exportar() {
    exportarCsv("apontamentos.csv", registrosFiltrados, [
      { cabecalho: "Funcionário", valor: (atestado) => atestado.nomeFuncionario },
      { cabecalho: "CID", valor: (atestado) => atestado.cid ?? "" },
      { cabecalho: "Afastamento", valor: (atestado) => formatarData(atestado.diaAfastamento) },
      { cabecalho: "Retorno", valor: (atestado) => formatarData(atestado.diaRetorno) },
      {
        cabecalho: "Duração",
        valor: (atestado) =>
          atestado.tipoAtestado === "Horario"
            ? `${atestado.totalHoras ?? 0}h`
            : String(atestado.totalDiasFora ?? ""),
      },
      { cabecalho: "Observações", valor: (atestado) => atestado.observacoes ?? "" },
    ])
  }

  const columns: ColumnDef<Atestado, unknown>[] = [
    {
      accessorKey: "nomeFuncionario",
      header: "Funcionário",
      cell: ({ row }) => <span className="font-medium">{row.original.nomeFuncionario}</span>,
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
        return atestado.totalDiasFora ?? "—"
      },
    },
    {
      accessorKey: "observacoes",
      header: "Observações",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="block max-w-64 truncate">{row.original.observacoes || "—"}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Apontamentos</h1>
          <p className="text-muted-foreground text-sm">Consulta de atestados por funcionário.</p>
        </div>
        <Button variant="outline" onClick={exportar}>
          <Download />
          Exportar
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-64">
          <FuncionarioCombobox
            value={funcionarioId}
            onChange={setFuncionarioId}
            funcionarios={funcionarios}
            onFuncionarioCriado={(novo) => setFuncionarios((atual) => [...atual, novo])}
            opcaoExtra={{ value: TODOS_OS_FUNCIONARIOS, label: "Todos os funcionários" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Atestados encontrados"
          value={registrosFiltrados.length}
          icon={ClipboardList}
        />
        <KpiCard label="Dias afastado (total)" value={totalDias} icon={CalendarClock} />
        <KpiCard label="Horas atestadas (total)" value={`${totalHoras}h`} icon={Clock} />
      </div>

      <DataTable
        columns={columns}
        data={registrosFiltrados}
        loading={carregando}
        getRowId={(atestado) => atestado.id}
        emptyMessage="Nenhum apontamento encontrado."
      />
    </div>
  )
}
