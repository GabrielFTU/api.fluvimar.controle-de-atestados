import { useEffect, useMemo, useState } from "react"
import { Activity, CalendarClock, ClipboardList, Clock, Download, Gauge, Printer, Users } from "lucide-react"
import { toast } from "sonner"

import { estatisticasApi, setoresApi } from "@/lib/api"
import type {
  AtestadoDetalheItem,
  ClassificacaoAtestado,
  Setor,
  SetorEstatistica,
  TopCidItem,
  TopFuncionarioItem,
  Unidade,
} from "@/lib/types"
import { calcularResumoRelatorio, rotuloPeriodo } from "@/lib/relatorio"
import { exportarCsv } from "@/lib/csv"
import { formatarData, formatarHoras } from "@/lib/format"
import { variantePorClassificacao } from "@/lib/badge-variants"
import { cn } from "@/lib/utils"
import { RelatorioCabecalho, RelatorioRodape } from "@/components/relatorio-chrome"
import { RelatorioMetrica } from "@/components/relatorio-metrica"
import { RelatorioBarra } from "@/components/relatorio-barra"
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

const TODAS_AS_UNIDADES = "todas"
const TODOS_OS_SETORES = "todos"
const TODAS_AS_CLASSIFICACOES = "todas"

const CELULA_TRUNCAVEL = "max-w-40 truncate print:max-w-none print:overflow-visible print:whitespace-normal"

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

export function RelatorioSetorPage() {
  const [anos, setAnos] = useState<number[]>([new Date().getUTCFullYear()])
  const [ano, setAno] = useState<number>(new Date().getUTCFullYear())
  const [meses, setMeses] = useState<number[]>([])
  const [unidade, setUnidade] = useState<string>(TODAS_AS_UNIDADES)
  const [setorId, setSetorId] = useState<string>(TODOS_OS_SETORES)
  const [classificacao, setClassificacao] = useState<string>(TODAS_AS_CLASSIFICACOES)
  const [setores, setSetores] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)

  const [itens, setItens] = useState<AtestadoDetalheItem[]>([])
  const [porSetor, setPorSetor] = useState<SetorEstatistica[]>([])
  const [topFuncionarios, setTopFuncionarios] = useState<TopFuncionarioItem[]>([])
  const [topCids, setTopCids] = useState<TopCidItem[]>([])

  useEffect(() => {
    estatisticasApi
      .anos()
      .then(setAnos)
      .catch(() => toast.error("Não foi possível carregar os anos disponíveis."))
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

    Promise.all([
      estatisticasApi.detalheAtestados({ ...filtroComum, ano, meses }),
      setorId === TODOS_OS_SETORES
        ? estatisticasApi.porSetor(ano, meses, {
            unidade: filtroComum.unidade,
            classificacao: filtroComum.classificacao,
          })
        : Promise.resolve([]),
      estatisticasApi.topFuncionarios(ano, meses, 15, filtroComum),
      estatisticasApi.topCids(ano, meses, 15, filtroComum),
    ])
      .then(([listaItens, listaPorSetor, listaFuncionarios, listaCids]) => {
        if (!ativo) return
        setItens(listaItens)
        setPorSetor(listaPorSetor)
        setTopFuncionarios(listaFuncionarios)
        setTopCids(listaCids)
      })
      .catch(() => toast.error("Não foi possível carregar o relatório."))
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [ano, meses, filtroComum, setorId])

  const resumo = useMemo(() => calcularResumoRelatorio(itens), [itens])
  const periodo = rotuloPeriodo(ano, meses)

  const setorSelecionado = setores.find((s) => s.id === setorId)
  const subtitulo =
    setorSelecionado?.nomeDoSetor ??
    (unidade === TODAS_AS_UNIDADES ? "Todas as unidades" : UNIDADE_LABEL[unidade as Unidade])

  const filtrosDescricao = [
    classificacao !== TODAS_AS_CLASSIFICACOES ? CLASSIFICACAO_LABEL[classificacao as ClassificacaoAtestado] : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const maiorPorSetor = Math.max(1, ...porSetor.map((item) => item.quantidade))
  const maiorPorFuncionario = Math.max(1, ...topFuncionarios.map((item) => item.quantidade))
  const maiorPorCid = Math.max(1, ...topCids.map((item) => item.quantidade))

  function imprimir() {
    window.print()
  }

  function exportar() {
    exportarCsv(`relatorio-atestados-${ano}.csv`, itens, [
      { cabecalho: "Colaborador", valor: (item) => item.nomeFuncionario },
      { cabecalho: "Setor", valor: (item) => item.nomeDoSetor ?? "Sem setor" },
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
          <h1 className="text-xl font-semibold tracking-tight">Relatório por unidade/setor</h1>
          <p className="text-muted-foreground text-sm">
            Visão consolidada e detalhamento completo dos atestados no período.
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
          <MesMultiSelect value={meses} onChange={setMeses} />
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
          <Button variant="outline" onClick={exportar} disabled={itens.length === 0}>
            <Download /> CSV
          </Button>
          <Button onClick={imprimir}>
            <Printer /> Imprimir
          </Button>
          <LimparFiltrosLink
            onClick={() => {
              setUnidade(TODAS_AS_UNIDADES)
              setSetorId(TODOS_OS_SETORES)
              setClassificacao(TODAS_AS_CLASSIFICACOES)
              setMeses([])
              setAno(new Date().getUTCFullYear())
            }}
          />
        </div>
      </div>

      <div className="relatorio-imprimivel flex flex-col gap-6">
        <RelatorioCabecalho
          titulo="Relatório de atestados por unidade/setor"
          subtitulo={subtitulo}
          periodo={periodo}
          filtros={filtrosDescricao || undefined}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 print:flex print:flex-nowrap print:gap-0 print:rounded-md print:border">
          {carregando ? (
            Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)
          ) : (
            <>
              <RelatorioMetrica label="Atestados" value={resumo.totalAtestados} icon={ClipboardList} />
              <RelatorioMetrica label="Dias afastados" value={resumo.totalDiasAfastados} icon={CalendarClock} />
              <RelatorioMetrica label="Horas atestadas" value={formatarHoras(resumo.totalHoras)} icon={Clock} />
              <RelatorioMetrica label="Colaboradores" value={resumo.colaboradoresEnvolvidos} icon={Users} />
              <RelatorioMetrica
                label="Média dias/atestado"
                value={resumo.mediaDiasPorAtestado.toFixed(1)}
                icon={Gauge}
              />
              <RelatorioMetrica label="Afastados agora" value={resumo.afastadosAgora} icon={Activity} />
            </>
          )}
        </div>

        {setorId === TODOS_OS_SETORES && (
          <section className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-tight">Distribuição por setor</h2>
            <div className="divide-y">
              {porSetor.length === 0 ? (
                <p className="text-muted-foreground py-2 text-sm">Nenhum atestado no período.</p>
              ) : (
                porSetor.map((item) => (
                  <RelatorioBarra
                    key={item.setorId ?? "sem-setor"}
                    rotulo={item.nomeDoSetor}
                    valor={item.quantidade}
                    maximo={maiorPorSetor}
                  />
                ))
              )}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-tight">Colaboradores com mais atestados</h2>
            <div className="divide-y">
              {topFuncionarios.length === 0 ? (
                <p className="text-muted-foreground py-2 text-sm">Nenhum atestado no período.</p>
              ) : (
                topFuncionarios.map((item) => (
                  <RelatorioBarra
                    key={item.funcionarioId}
                    rotulo={item.nomeFuncionario}
                    valor={item.quantidade}
                    maximo={maiorPorFuncionario}
                  />
                ))
              )}
            </div>
          </section>

          <section className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold tracking-tight">Principais motivos (CID)</h2>
            <div className="divide-y">
              {topCids.length === 0 ? (
                <p className="text-muted-foreground py-2 text-sm">Nenhum CID registrado.</p>
              ) : (
                topCids.map((item) => (
                  <RelatorioBarra
                    key={item.cid}
                    rotulo={item.descricao ? `${item.cid} · ${item.descricao}` : item.cid}
                    valor={item.quantidade}
                    maximo={maiorPorCid}
                    detalhe={`${item.quantidadeFuncionarios} ${item.quantidadeFuncionarios === 1 ? "pessoa" : "pessoas"}`}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Detalhamento completo</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Setor</TableHead>
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
                      <TableCell colSpan={9}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-muted-foreground h-24 text-center">
                      Nenhum atestado encontrado no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => (
                    <TableRow key={item.atestadoId}>
                      <TableCell className={cn("font-medium", CELULA_TRUNCAVEL)}>
                        {item.nomeFuncionario}
                      </TableCell>
                      <TableCell className={CELULA_TRUNCAVEL}>{item.nomeDoSetor ?? "Sem setor"}</TableCell>
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
                      <TableCell className={cn("text-muted-foreground", CELULA_TRUNCAVEL, "max-w-56")}>
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
    </div>
  )
}
