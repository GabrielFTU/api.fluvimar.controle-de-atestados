export function formatarData(data: string | null): string {
  if (!data) return "—"

  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
}
