export function formatarData(data: string | null): string {
  if (!data) return "—"

  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export function formatarHoras(horas: number | null | undefined): string {
  const totalMinutos = Math.round((horas ?? 0) * 60)
  const h = Math.floor(totalMinutos / 60)
  const m = totalMinutos % 60

  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}
