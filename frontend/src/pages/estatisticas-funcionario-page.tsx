import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { CalendarClock, CalendarDays, ClipboardList, Clock, Gauge } from "lucide-react"
import { toast } from "sonner"

import { atestadosApi, estatisticasApi, funcionariosApi, setoresApi } from "@/lib/api"
import type { Atestado, Funcionario, Setor, Unidade } from "@/lib/types"
import { DIAS_SEMANA, MESES } from "@/lib/stats"
import { formatarData } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/kpi-card"
import { StatTrendChart } from "@/components/stat-trend-chart"
import { StatBarChart } from "@/components/stat-bar-chart"
import { DataTable } from "@/components/data-table"
import { FuncionarioCombobox } from "@/components/funcionario-combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type FuncionarioResumo = {
  totalAtestados: number
  totalDiasAfastado: number
  totalHorasAfastado: number
  mediaDiasPorAtestado: number
  ultimoAtestado: string | null
}

const TODOS_OS_MESES = "todos"
const TODAS_AS_UNIDADES = "todas"
const TODOS_OS_SETORES = "todos"

const UNIDADE_LABEL: Record<Unidade, string> = {
  Administracao: "Administração",
  Unidade1: "Unidade 1",
  Unidade2: "Unidade 2",
}

export function EstatisticasFuncionarioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [funcionarioId, setFuncionarioId] = useState<string>(searchParams.get("funcionarioId") ?? "")
  const [anos, setAnos] = useState<number[]>([new Date().getUTCFullYear()])
  const [ano, setAno] = useState<number>(new Date().getUTCFullYear())
  const [mes, setMes] = useState<string>(TODOS_OS_MESES)
  const [unidade, setUnidade] = useState<string>(TODAS_AS_UNIDADES)
  const [setorId, setSetorId] = useState<string>(TODOS_OS_SETORES)
  const [carregando, setCarregando] = useState(true)

  const [resumo, setResumo] = useState<FuncionarioResumo | null>(null)
  const [serieMensal, setSerieMensal] = useState<{ mes: string; quantidade: number }[]>([])
  const [porDiaSemana, setPorDiaSemana] = useState<{ dia: string; quantidade: number }[]>([])
  const [atestados, setAtestados] = useState<Atestado[]>([])

  function selecionarFuncionario(id: string) {
    setFuncionarioId(id)
    setSearchParams(id ? { funcionarioId: id } : {}, { replace: true })
  }

  useEffect(() => {
    Promise.all([funcionariosApi.listar(), estatisticasApi.anos(), setoresApi.listar()])
      .then(([listaFuncionarios, listaAnos, listaSetores]) => {
        setFuncionarios(listaFuncionarios)
        setAnos(listaAnos)
        setSetores(listaSetores)
        const daUrl = searchParams.get("funcionarioId")
        const existe = daUrl && listaFuncionarios.some((funcionario) => funcionario.id === daUrl)
        if (existe) {
          setFuncionarioId(daUrl)
        } else if (listaFuncionarios.length > 0) {
          selecionarFuncionario(listaFuncionarios[0].id)
        }
      })
      .catch(() => toast.error("Não foi possível carregar os funcionários."))
      .finally(() => setCarregando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setoresDaUnidade = useMemo(
    () => (unidade === TODAS_AS_UNIDADES ? setores : setores.filter((s) => s.unidade === unidade)),
    [setores, unidade]
  )

  const unidadePorSetor = useMemo(() => {
    const mapa = new Map<string, Unidade | null>()
    for (const setor of setores) mapa.set(setor.id, setor.unidade)
    return mapa
  }, [setores])

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((funcionario) => {
      const unidadeDoFuncionario = funcionario.setorId ? unidadePorSetor.get(funcionario.setorId) : null
      const combinaUnidade = unidade === TODAS_AS_UNIDADES || unidadeDoFuncionario === unidade
      const combinaSetor = setorId === TODOS_OS_SETORES || funcionario.setorId === setorId
      return combinaUnidade && combinaSetor
    })
  }, [funcionarios, unidade, setorId, unidadePorSetor])

  useEffect(() => {
    if (setorId !== TODOS_OS_SETORES && !setoresDaUnidade.some((s) => s.id === setorId)) {
      setSetorId(TODOS_OS_SETORES)
    }
  }, [setoresDaUnidade, setorId])

  useEffect(() => {
    if (funcionarioId && !funcionariosFiltrados.some((funcionario) => funcionario.id === funcionarioId)) {
      selecionarFuncionario(funcionariosFiltrados[0]?.id ?? "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funcionariosFiltrados])

  useEffect(() => {
    if (!funcionarioId) return

    let ativo = true
    setCarregando(true)
    const mesNumero = mes === TODOS_OS_MESES ? undefined : Number(mes)

    Promise.all([estatisticasApi.porFuncionario(funcionarioId, ano, mesNumero), atestadosApi.listar()])
      .then(([dados, todosAtestados]) => {
        if (!ativo) return
        setResumo({
          totalAtestados: dados.totalAtestados,
          totalDiasAfastado: dados.totalDiasAfastado,
          totalHorasAfastado: dados.totalHorasAfastado,
          mediaDiasPorAtestado: dados.mediaDiasPorAtestado,
          ultimoAtestado: dados.ultimoAtestado,
        })
        setSerieMensal(
          dados.serieMensal.map((item) => ({ mes: MESES[item.mes - 1], quantidade: item.quantidade }))
        )
        setPorDiaSemana(
          dados.porDiaSemana.map((item) => ({
            dia: DIAS_SEMANA[item.diaSemana],
            quantidade: item.quantidade,
          }))
        )
        setAtestados(
          todosAtestados.filter((atestado) => {
            if (atestado.funcionarioId !== funcionarioId) return false
            if (mesNumero === undefined || !atestado.diaAfastamento) return true
            return new Date(atestado.diaAfastamento).getUTCMonth() + 1 === mesNumero
          })
        )
      })
      .catch(() => toast.error("Não foi possível carregar as estatísticas do funcionário."))
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [funcionarioId, ano, mes])

  const columns = useMemo<ColumnDef<Atestado, unknown>[]>(
    () => [
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
    ],
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Estatísticas por funcionário</h1>
        <p className="text-muted-foreground text-sm">
          Histórico individual de atestados e afastamentos.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={unidade} onValueChange={setUnidade}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS_AS_UNIDADES}>Todas as unidades</SelectItem>
            {(Object.keys(UNIDADE_LABEL) as Unidade[]).map((valor) => (
              <SelectItem key={valor} value={valor}>
                {UNIDADE_LABEL[valor]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={setorId} onValueChange={setSetorId}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_OS_SETORES}>Todos os setores</SelectItem>
            {setoresDaUnidade.map((setor) => (
              <SelectItem key={setor.id} value={setor.id}>
                {setor.nomeDoSetor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-64">
          <FuncionarioCombobox
            value={funcionarioId}
            onChange={selecionarFuncionario}
            funcionarios={funcionariosFiltrados}
            onFuncionarioCriado={(novo) => {
              setFuncionarios((atual) => [...atual, novo])
              selecionarFuncionario(novo.id)
            }}
            placeholder="Selecione um funcionário"
          />
        </div>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS_OS_MESES}>Todos os meses</SelectItem>
            {MESES.map((nomeMes, index) => (
              <SelectItem key={nomeMes} value={String(index)}>
                {nomeMes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(ano)} onValueChange={(valor) => setAno(Number(valor))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map((anoDisponivel) => (
              <SelectItem key={anoDisponivel} value={String(anoDisponivel)}>
                {anoDisponivel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!funcionarioId ? (
        <p className="text-muted-foreground text-sm">
          Nenhum funcionário cadastrado para exibir estatísticas.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {resumo ? (
              <>
                <KpiCard
                  label={mes === TODOS_OS_MESES ? "Atestados no ano" : "Atestados no período"}
                  value={resumo.totalAtestados}
                  icon={ClipboardList}
                />
                <KpiCard
                  label={mes === TODOS_OS_MESES ? "Dias afastado no ano" : "Dias afastado no período"}
                  value={resumo.totalDiasAfastado}
                  icon={CalendarClock}
                />
                <KpiCard
                  label={mes === TODOS_OS_MESES ? "Horas atestadas no ano" : "Horas atestadas no período"}
                  value={`${resumo.totalHorasAfastado}h`}
                  icon={Clock}
                  hint="Atestados de horário específico"
                />
                <KpiCard
                  label="Média de dias por atestado"
                  value={resumo.mediaDiasPorAtestado.toFixed(1)}
                  icon={Gauge}
                />
                <KpiCard
                  label="Último atestado"
                  value={formatarData(resumo.ultimoAtestado)}
                  icon={CalendarDays}
                />
              </>
            ) : (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full" />
              ))
            )}
          </div>

          {carregando ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <StatTrendChart
                titulo={`Atestados por mês (${ano})`}
                dados={serieMensal}
                chaveCategoria="mes"
                chaveValor="quantidade"
              />
              <StatBarChart
                titulo={`Atestados por dia da semana (${ano})`}
                dados={porDiaSemana}
                chaveCategoria="dia"
                chaveValor="quantidade"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Histórico de atestados</h2>
            <DataTable
              columns={columns}
              data={atestados}
              loading={carregando}
              getRowId={(atestado) => atestado.id}
              emptyMessage="Nenhum atestado encontrado para este funcionário."
            />
          </div>
        </>
      )}
    </div>
  )
}
