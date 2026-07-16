import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Clock,
  ClipboardList,
  Gauge,
  Repeat,
  Stethoscope,
} from "lucide-react"
import { toast } from "sonner"

import { estatisticasApi, setoresApi } from "@/lib/api"
import type {
  AtestadoDetalheItem,
  ClassificacaoAtestado,
  DetalheAtestadosFiltro,
  ReincidenteItem,
  ResumoEstatistica,
  Setor,
  SetorEstatistica,
  TopCidItem,
  TopFuncionarioItem,
  TopMedicoItem,
  Unidade,
} from "@/lib/types"
import { DIAS_SEMANA, MESES } from "@/lib/stats"
import { KpiCard } from "@/components/kpi-card"
import { TrendBadge } from "@/components/trend-badge"
import { StatTrendChart } from "@/components/stat-trend-chart"
import { StatBarChart } from "@/components/stat-bar-chart"
import { AtestadoDetalheDialog } from "@/components/atestado-detalhe-dialog"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const TODOS_OS_MESES = "todos"
const TODAS_AS_UNIDADES = "todas"
const TODOS_OS_SETORES = "todos"
const TODAS_AS_CLASSIFICACOES = "todas"

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

export function EstatisticasGeralPage() {
  const navigate = useNavigate()
  const [anos, setAnos] = useState<number[]>([new Date().getUTCFullYear()])
  const [ano, setAno] = useState<number>(new Date().getUTCFullYear())
  const [mes, setMes] = useState<string>(TODOS_OS_MESES)
  const [unidade, setUnidade] = useState<string>(TODAS_AS_UNIDADES)
  const [setorId, setSetorId] = useState<string>(TODOS_OS_SETORES)
  const [classificacao, setClassificacao] = useState<string>(TODAS_AS_CLASSIFICACOES)
  const [setores, setSetores] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)

  const [resumo, setResumo] = useState<ResumoEstatistica | null>(null)
  const [reincidentes, setReincidentes] = useState<ReincidenteItem[]>([])
  const [serieMensal, setSerieMensal] = useState<{ mes: string; quantidade: number }[]>([])
  const [porDiaSemana, setPorDiaSemana] = useState<{ dia: string; quantidade: number }[]>([])
  const [porSetor, setPorSetor] = useState<SetorEstatistica[]>([])
  const [topFuncionarios, setTopFuncionarios] = useState<TopFuncionarioItem[]>([])
  const [topCids, setTopCids] = useState<TopCidItem[]>([])
  const [topMedicos, setTopMedicos] = useState<TopMedicoItem[]>([])

  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogTitulo, setDialogTitulo] = useState("")
  const [dialogDescricao, setDialogDescricao] = useState<string | undefined>(undefined)
  const [dialogItens, setDialogItens] = useState<AtestadoDetalheItem[]>([])
  const [dialogCarregando, setDialogCarregando] = useState(false)

  useEffect(() => {
    estatisticasApi
      .anos()
      .then(setAnos)
      .catch(() => toast.error("Não foi possível carregar os anos disponíveis."))
    estatisticasApi
      .resumo()
      .then(setResumo)
      .catch(() => toast.error("Não foi possível carregar o resumo."))
    estatisticasApi
      .reincidentes()
      .then(setReincidentes)
      .catch(() => toast.error("Não foi possível carregar os funcionários reincidentes."))
    setoresApi
      .listar()
      .then(setSetores)
      .catch(() => toast.error("Não foi possível carregar os setores."))
  }, [])

  const setoresDaUnidade = useMemo(
    () => (unidade === TODAS_AS_UNIDADES ? setores : setores.filter((s) => s.unidade === unidade)),
    [setores, unidade]
  )

  useEffect(() => {
    if (setorId !== TODOS_OS_SETORES && !setoresDaUnidade.some((s) => s.id === setorId)) {
      setSetorId(TODOS_OS_SETORES)
    }
  }, [setoresDaUnidade, setorId])

  const filtroComum = useMemo(
    () => ({
      unidade: unidade === TODAS_AS_UNIDADES ? undefined : (unidade as Unidade),
      setorId: setorId === TODOS_OS_SETORES ? undefined : setorId,
      classificacao: classificacao === TODAS_AS_CLASSIFICACOES ? undefined : (classificacao as ClassificacaoAtestado),
    }),
    [unidade, setorId, classificacao]
  )

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    const mesNumero = mes === TODOS_OS_MESES ? undefined : Number(mes)

    Promise.all([
      estatisticasApi.serieMensal(ano, filtroComum),
      estatisticasApi.porDiaSemana(ano, mesNumero, filtroComum),
      estatisticasApi.porSetor(ano, mesNumero, filtroComum),
      estatisticasApi.topFuncionarios(ano, mesNumero, 10, filtroComum),
      estatisticasApi.topCids(ano, mesNumero, 10, filtroComum),
      estatisticasApi.topMedicos(ano, mesNumero, 10, filtroComum),
    ])
      .then(([serie, diaSemana, porSetorResp, ranking, cids, medicos]) => {
        if (!ativo) return
        setSerieMensal(serie.map((item) => ({ mes: MESES[item.mes - 1], quantidade: item.quantidade })))
        setPorDiaSemana(
          diaSemana.map((item) => ({ dia: DIAS_SEMANA[item.diaSemana], quantidade: item.quantidade }))
        )
        setPorSetor(porSetorResp)
        setTopFuncionarios(ranking)
        setTopCids(cids)
        setTopMedicos(medicos)
      })
      .catch(() => toast.error("Não foi possível carregar as estatísticas."))
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [ano, mes, filtroComum])

  const maiorQuantidadeSetor = useMemo(
    () => Math.max(1, ...porSetor.map((item) => item.quantidade)),
    [porSetor]
  )

  function abrirDetalhe(titulo: string, descricao: string | undefined, filtro: DetalheAtestadosFiltro) {
    setDialogTitulo(titulo)
    setDialogDescricao(descricao)
    setDialogAberto(true)
    setDialogCarregando(true)
    estatisticasApi
      .detalheAtestados(filtro)
      .then(setDialogItens)
      .catch(() => toast.error("Não foi possível carregar o detalhamento."))
      .finally(() => setDialogCarregando(false))
  }

  function abrirDetalheSetor(item: SetorEstatistica) {
    abrirDetalhe(item.nomeDoSetor, `Atestados de ${ano}`, {
      ...filtroComum,
      setorId: item.setorId ?? undefined,
      semSetor: !item.setorId,
      ano,
      mes: mes === TODOS_OS_MESES ? undefined : Number(mes),
    })
  }

  function abrirDetalheFuncionario(item: TopFuncionarioItem) {
    abrirDetalhe(item.nomeFuncionario, `Atestados de ${ano}`, {
      ...filtroComum,
      funcionarioId: item.funcionarioId,
      ano,
      mes: mes === TODOS_OS_MESES ? undefined : Number(mes),
    })
  }

  function abrirDetalheCid(item: TopCidItem) {
    abrirDetalhe(
      `CID ${item.cid}`,
      item.descricao ? `${item.descricao} · Atestados de ${ano}` : `Atestados de ${ano}`,
      { ...filtroComum, cid: item.cid, ano, mes: mes === TODOS_OS_MESES ? undefined : Number(mes) }
    )
  }

  function abrirDetalheMedico(item: TopMedicoItem) {
    abrirDetalhe(
      item.nomeMedico,
      item.crm ? `CRM ${item.crm} · Atestados de ${ano}` : `Atestados de ${ano}`,
      { ...filtroComum, medicoId: item.medicoId, ano, mes: mes === TODOS_OS_MESES ? undefined : Number(mes) }
    )
  }

  function abrirDetalheAcimaDe15Dias() {
    abrirDetalhe(
      "Afastamentos acima de 15 dias",
      "A partir do 16º dia de afastamento, a responsabilidade pelo benefício passa da empresa para o INSS.",
      { apenasAtivos: true, diasMinimosAfastamento: 15 }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Estatísticas gerais</h1>
          <p className="text-muted-foreground text-sm">
            Visão consolidada de atestados da empresa.
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
          <Select value={classificacao} onValueChange={setClassificacao}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS_AS_CLASSIFICACOES}>Todas as classificações</SelectItem>
              {(Object.keys(CLASSIFICACAO_LABEL) as ClassificacaoAtestado[]).map((valor) => (
                <SelectItem key={valor} value={valor}>
                  {CLASSIFICACAO_LABEL[valor]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <SelectTrigger className="w-24">
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumo ? (
          <>
            <KpiCard
              label="Atestados hoje"
              value={resumo.atestadosHoje}
              icon={ClipboardList}
              trend={
                <TrendBadge
                  atual={resumo.atestadosHoje}
                  anterior={resumo.atestadosOntem}
                  sentimento="positivo-se-desce"
                  sufixo="vs. ontem"
                />
              }
            />
            <KpiCard
              label="Atestados no mês"
              value={resumo.atestadosMesAtual}
              icon={CalendarClock}
              trend={
                <TrendBadge
                  atual={resumo.atestadosMesAtual}
                  anterior={resumo.atestadosMesAnterior}
                  sentimento="positivo-se-desce"
                  sufixo="vs. mês anterior"
                />
              }
            />
            <KpiCard
              label="Dias afastados no mês"
              value={resumo.diasAfastadosMesAtual}
              icon={Gauge}
              trend={
                <TrendBadge
                  atual={resumo.diasAfastadosMesAtual}
                  anterior={resumo.diasAfastadosMesAnterior}
                  sentimento="positivo-se-desce"
                  sufixo="vs. mês anterior"
                />
              }
            />
            <KpiCard
              label="Ativos agora"
              value={resumo.atestadosAtivosAgora}
              icon={Activity}
              hint="Funcionários afastados neste momento"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumo ? (
          <>
            <KpiCard
              label="Afastamentos acima de 15 dias"
              value={resumo.atestadosAtivosAcimaDe15Dias}
              icon={AlertTriangle}
              tone="warning"
              hint="Clique para ver quem — a partir do 16º dia o INSS assume o benefício"
              onClick={resumo.atestadosAtivosAcimaDe15Dias > 0 ? abrirDetalheAcimaDe15Dias : undefined}
            />
            <KpiCard
              label="Horas atestadas no mês"
              value={`${resumo.horasAtestadasMesAtual}h`}
              icon={Clock}
              trend={
                <div className="flex flex-col gap-1">
                  <TrendBadge
                    atual={resumo.horasAtestadasMesAtual}
                    anterior={resumo.horasAtestadasMesAnterior}
                    sentimento="positivo-se-desce"
                    sufixo="vs. mês anterior"
                  />
                  <span className="text-muted-foreground text-xs">
                    Atestados de horário — não contam como dia afastado
                  </span>
                </div>
              }
            />
          </>
        ) : (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}

        <Card className={reincidentes.length > 0 ? "ring-warning/40 bg-warning/5" : undefined}>
          <CardHeader className="flex flex-row items-center gap-2">
            <span className="bg-warning/20 text-warning-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Repeat className="size-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-normal">Funcionários reincidentes</CardTitle>
              <p className="text-muted-foreground text-xs">3+ atestados nos últimos 6 meses</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {reincidentes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum funcionário reincidente.</p>
            ) : (
              reincidentes.slice(0, 5).map((item) => (
                <button
                  key={item.funcionarioId}
                  type="button"
                  onClick={() => navigate(`/estatisticas/funcionario?funcionarioId=${item.funcionarioId}`)}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-md px-1.5 py-1 text-left text-sm"
                >
                  <span className="truncate">{item.nomeFuncionario}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {item.quantidadeUltimosMeses}x
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Atestados por setor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {carregando ? (
              <Skeleton className="h-24 w-full" />
            ) : porSetor.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum atestado no período.</p>
            ) : (
              porSetor.map((item) => (
                <button
                  key={item.setorId ?? "sem-setor"}
                  type="button"
                  onClick={() => abrirDetalheSetor(item)}
                  className="hover:bg-muted flex flex-col gap-1 rounded-md px-1.5 py-1 text-left"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{item.nomeDoSetor}</span>
                    <span className="text-muted-foreground tabular-nums">{item.quantidade}</span>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-chart-1 h-full rounded-full"
                      style={{ width: `${(item.quantidade / maiorQuantidadeSetor) * 100}%` }}
                    />
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Top funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead className="text-right">Atestados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : topFuncionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                      Nenhum atestado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  topFuncionarios.map((item, index) => (
                    <TableRow
                      key={item.funcionarioId}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() => abrirDetalheFuncionario(item)}
                    >
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="truncate">{item.nomeFuncionario}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantidade}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Top CIDs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>CID</TableHead>
                  <TableHead className="text-right">Atestados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : topCids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                      Nenhum CID registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  topCids.map((item, index) => (
                    <TableRow
                      key={item.cid}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() => abrirDetalheCid(item)}
                    >
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <span className="font-medium">{item.cid}</span>
                        {item.descricao && (
                          <span className="text-muted-foreground ml-1.5 truncate text-xs">
                            {item.descricao}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="tabular-nums">{item.quantidade}</div>
                        <div className="text-muted-foreground text-xs">
                          {item.quantidadeFuncionarios}{" "}
                          {item.quantidadeFuncionarios === 1 ? "pessoa" : "pessoas"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Stethoscope className="text-muted-foreground size-4" />
            <CardTitle className="text-sm font-normal">Top médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead className="text-right">Atestados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : topMedicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground h-24 text-center">
                      Nenhum médico registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  topMedicos.map((item, index) => (
                    <TableRow
                      key={item.medicoId}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() => abrirDetalheMedico(item)}
                    >
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <span className="font-medium">{item.nomeMedico}</span>
                        {item.crm && (
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            CRM {item.crm}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="tabular-nums">{item.quantidade}</div>
                        <div className="text-muted-foreground text-xs">
                          {item.quantidadeFuncionarios}{" "}
                          {item.quantidadeFuncionarios === 1 ? "pessoa" : "pessoas"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AtestadoDetalheDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        titulo={dialogTitulo}
        descricao={dialogDescricao}
        itens={dialogItens}
        carregando={dialogCarregando}
      />
    </div>
  )
}
