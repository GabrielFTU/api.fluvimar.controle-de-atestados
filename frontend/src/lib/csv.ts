type ColunaCsv<T> = {
  cabecalho: string
  valor: (item: T) => string
}

function escaparCampoCsv(valor: string): string {
  if (/[";\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

export function exportarCsv<T>(nomeArquivo: string, itens: T[], colunas: ColunaCsv<T>[]) {
  const linhas = [
    colunas.map((coluna) => escaparCampoCsv(coluna.cabecalho)).join(";"),
    ...itens.map((item) => colunas.map((coluna) => escaparCampoCsv(coluna.valor(item))).join(";")),
  ]

  const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = nomeArquivo
  link.click()

  URL.revokeObjectURL(url)
}
