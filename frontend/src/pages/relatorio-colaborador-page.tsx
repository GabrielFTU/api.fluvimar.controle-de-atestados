import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CalendarClock, CalendarDays, ClipboardList, Clock, Download, Gauge, Printer } from "lucide-react"
import { toast } from "sonner"

import { estatisticasApi, funcionariosApi, setoresApi } from "@/lib/api"
import type { AtestadoDetalheItem, ClassificacaoAtestado, Funcionario, Setor, Unidade } from "@/lib/types"
import { calcularResumoRelatorio, rotuloPeriodo } from "@/lib/relatorio"
import { exportarCsv } from "@/lib/csv"
import { formatarData, formatarHoras } from "@/lib/format"
import { MESES } from "@/lib/stats"
import { variantePorClassificacao } from "@/lib/badge-variants"
import { cn } from "@/lib/utils"
import { RelatorioCabecalho, RelatorioRodape } from "@/components/relatorio-chrome"
import { RelatorioMetrica } from "@/components/relatorio-metrica"
import { RelatorioBarra } from "@/components/relatorio-barra"
import { FuncionarioCombobox } from "@/components/funcionario-combobox"
import { MesMultiSelect } from "@/components/mes-multi-select"
import { LimparFiltrosLink } from "@/components/limpar-filtros-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const HISTORICO_COMPLETO = "todos"
const TODAS_AS_UNIDADES = "todas"
const TODOS_OS_SETORES = "todos"

const UNIDADE_LABEL: Record<Unidade, string> = {
  Administracao: "Administração",
  Unidade1: "Unidade 1",
  Unidade2: "Unidade 2",
}

const CLASSIFICACAO_LABEL: Record<ClassificacaoAtestado, string> = {
  Atestado: "Atestado",
  Declaracao: "Declaração",
  Acompanhante: "Acompanhante",
}

const CELULA_TRUNCAVEL = "max-w-40 truncate print:max-w-none print:overflow-visible print:whitespace-normal"

export function RelatorioColaboradorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [funcionarioId, setFuncionarioId] = useState<string>(searchParams.get("funcionarioId") ?? "")
  const [anos, setAnos] = useState<number[]>([new Date().getUTCFullYear()])
  const [ano, setAno] = useState<string>(String(new Date().getUTCFullYear()))
  const [meses, setMeses] = useState<number[]>([])
  const [unidade, setUnidade] = useState<string>(TODAS_AS_UNIDADES)
  const [setorId, setSetorId] = useState<string>(TODOS_OS_SETORES)
  const [carregando, setCarregando] = useState(true)

  const [itens, setItens] = useState<AtestadoDetalheItem[]>([])
  const [serieMensal, setSerieMensal] = useState<{ mes: string; quantidade: number }[]>([])

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

  const anoNumero = ano === HISTORICO_COMPLETO ? undefined : Number(ano)
  const mesesAtivos = anoNumero === undefined ? undefined : meses

  useEffect(() => {
    if (!funcionarioId) return

    let ativo = true
    setCarregando(true)

    Promise.all([
      estatisticasApi.detalheAtestados({ funcionarioId, ano: anoNumero, meses: mesesAtivos }),
      anoNumero !== undefined ? estatisticasApi.porFuncionario(funcionarioId, anoNumero, mesesAtivos) : null,
    ])
      .then(([listaItens, dados]) => {
        if (!ativo) return
        setItens(listaItens)
        setSerieMensal(
          dados ? dados.serieMensal.map((item) => ({ mes: MESES[item.mes - 1], quantidade: item.quantidade })) : []
        )
      })
      .catch(() => toast.error("Não foi possível carregar o relatório."))
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [funcionarioId, anoNumero, mesesAtivos])

  const resumo = useMemo(() => calcularResumoRelatorio(itens), [itens])
  const ultimoAtestado = itens[0]?.diaAfastamento ?? null
  const periodo = rotuloPeriodo(anoNumero, mesesAtivos)

  const funcionarioSelecionado = funcionarios.find((f) => f.id === funcionarioId)
  const maiorSerieMensal = Math.max(1, ...serieMensal.map((item) => item.quantidade))

  function imprimir() {
    window.print()
  }

  function exportar() {
    exportarCsv(`relatorio-${funcionarioSelecionado?.nome ?? "colaborador"}.csv`, itens, [
      { cabecalho: "Classificação", valor: (item) => CLASSIFICACAO_LABEL[item.classificacao] },
      { cabecalho: "CID", valor: (item) => item.cid ?? "" },
      { cabecalho: "Motivo", valor: (item) => item.cidDescricao ?? "" },
      { cabecalho: "Médico", valor: (item) => item.nomeMedico ?? "" },
      { cabecalho: "Afastamento", valor: (item) => formatarData(item.diaAfastamento) },
      { cabecalho: "Retorno", valor: (item) => formatarData(item.diaRetorno) },
      {
        cabecalho: "Duração",
        valor: (item) =>
          item.tipoAtestado === "Horario" ? formatarHoras(item.totalHoras) : String(item.totalDiasFora ?? ""),
      },
      { cabecalho: "Observações", valor: (item) => item.observacoes ?? "" },
    ])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Relatório individual do colaborador</h1>
          <p className="text-muted-foreground text-sm">
            Histórico completo de atestados, pronto para impressão.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
              placeholder="Selecione um colaborador"
            />
          </div>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={HISTORICO_COMPLETO}>Histórico completo</SelectItem>
              {anos.map((anoDisponivel) => (
                <SelectItem key={anoDisponivel} value={String(anoDisponivel)}>
                  {anoDisponivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MesMultiSelect value={meses} onChange={setMeses} disabled={anoNumero === undefined} />
          <Button variant="outline" onClick={exportar} disabled={itens.length === 0}>
            <Download /> CSV
          </Button>
          <Button onClick={imprimir} disabled={!funcionarioId}>
            <Printer /> Imprimir
          </Button>
          <LimparFiltrosLink
            onClick={() => {
              setUnidade(TODAS_AS_UNIDADES)
              setSetorId(TODOS_OS_SETORES)
              setMeses([])
              setAno(String(new Date().getUTCFullYear()))
            }}
          />
        </div>
      </div>

      {!funcionarioId ? (
        <p className="text-muted-foreground text-sm">
          Nenhum colaborador cadastrado para gerar relatório.
        </p>
      ) : (
        <div className="relatorio-imprimivel flex flex-col gap-6">
          <RelatorioCabecalho
            titulo="Relatório individual de atestados"
            subtitulo={
              funcionarioSelecionado
                ? `${funcionarioSelecionado.nome}${
                    funcionarioSelecionado.nomeDoSetor ? ` · ${funcionarioSelecionado.nomeDoSetor}` : ""
                  }`
                : ""
            }
            periodo={periodo}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 print:flex print:flex-nowrap print:gap-0 print:rounded-md print:border">
            {carregando ? (
              Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)
            ) : (
              <>
                <RelatorioMetrica label="Atestados" value={resumo.totalAtestados} icon={ClipboardList} />
                <RelatorioMetrica label="Dias afastados" value={resumo.totalDiasAfastados} icon={CalendarClock} />
                <RelatorioMetrica label="Horas atestadas" value={formatarHoras(resumo.totalHoras)} icon={Clock} />
                <RelatorioMetrica
                  label="Média dias/atestado"
                  value={resumo.mediaDiasPorAtestado.toFixed(1)}
                  icon={Gauge}
                />
                <RelatorioMetrica label="Último atestado" value={formatarData(ultimoAtestado)} icon={CalendarDays} />
                <RelatorioMetrica
                  label="Situação atual"
                  value={resumo.afastadosAgora > 0 ? "Afastado" : "Ativo"}
                />
              </>
            )}
          </div>

          {anoNumero !== undefined && serieMensal.length > 0 && (
            <section className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-tight">Atestados por mês ({anoNumero})</h2>
              <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                {serieMensal.map((item) => (
                  <RelatorioBarra
                    key={item.mes}
                    rotulo={item.mes}
                    valor={item.quantidade}
                    maximo={maiorSerieMensal}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Histórico completo de atestados</h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classificação</TableHead>
                    <TableHead>CID</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Afastamento</TableHead>
                    <TableHead>Retorno</TableHead>
                    <TableHead className="text-right">Duração</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carregando ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                        Nenhum atestado encontrado no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itens.map((item) => (
                      <TableRow key={item.atestadoId}>
                        <TableCell>
                          <Badge variant={variantePorClassificacao(item.classificacao)}>
                            {CLASSIFICACAO_LABEL[item.classificacao]}
                          </Badge>
                        </TableCell>
                        <TableCell className={CELULA_TRUNCAVEL}>
                          {item.cid ? (
                            <>
                              <span className="font-medium">{item.cid}</span>
                              {item.cidDescricao && (
                                <span className="text-muted-foreground ml-1.5 text-xs">{item.cidDescricao}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className={CELULA_TRUNCAVEL}>
                          {item.nomeMedico ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{formatarData(item.diaAfastamento)}</TableCell>
                        <TableCell>{formatarData(item.diaRetorno)}</TableCell>
                        <TableCell className="text-right">
                          {item.tipoAtestado === "Horario"
                            ? formatarHoras(item.totalHoras)
                            : (item.totalDiasFora ?? "—")}
                        </TableCell>
                        <TableCell className={cn("text-muted-foreground", CELULA_TRUNCAVEL, "max-w-64")}>
                          {item.observacoes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <RelatorioRodape />
        </div>
      )}
    </div>
  )
}
