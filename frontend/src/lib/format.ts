export function formatarData(data: string | null): string {
  if (!data) return "—"

  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export function formatarHoras(horas: number | null | undefined): string {
  const valor = Math.round((horas ?? 0) * 10) / 10
  return `${valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}h`
}
