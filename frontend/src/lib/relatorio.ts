import type { AtestadoDetalheItem } from "@/lib/types"

export type ResumoRelatorio = {
  totalAtestados: number
  totalDiasAfastados: number
  totalHoras: number
  colaboradoresEnvolvidos: number
  mediaDiasPorAtestado: number
  afastadosAgora: number
}

export function calcularResumoRelatorio(itens: AtestadoDetalheItem[]): ResumoRelatorio {
  const hoje = new Date()
  hoje.setUTCHours(0, 0, 0, 0)

  const diaCompleto = itens.filter((item) => item.tipoAtestado === "DiaCompleto")

  return {
    totalAtestados: itens.length,
    totalDiasAfastados: diaCompleto.reduce((soma, item) => soma + (item.totalDiasFora ?? 0), 0),
    totalHoras: itens.reduce((soma, item) => soma + (item.totalHoras ?? 0), 0),
    colaboradoresEnvolvidos: new Set(itens.map((item) => item.funcionarioId)).size,
    mediaDiasPorAtestado:
      diaCompleto.length > 0
        ? diaCompleto.reduce((soma, item) => soma + (item.totalDiasFora ?? 0), 0) / diaCompleto.length
        : 0,
    afastadosAgora: diaCompleto.filter((item) => {
      if (!item.diaAfastamento || !item.diaRetorno) return false
      const inicio = new Date(item.diaAfastamento)
      const fim = new Date(item.diaRetorno)
      return inicio <= hoje && fim >= hoje
    }).length,
  }
}

export function rotuloPeriodo(ano: number | undefined, meses: number[] | undefined): string {
  if (!ano) return "Histórico completo"
  if (!meses || meses.length === 0) return `Ano de ${ano}`

  const formatoMes = new Intl.DateTimeFormat("pt-BR", {
    month: meses.length === 1 ? "long" : "short",
  })
  const nomesMeses = meses.map((mes) => {
    const nome = formatoMes.format(new Date(ano, mes - 1, 1))
    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}`
  })

  return `${nomesMeses.join(", ")} de ${ano}`
}
