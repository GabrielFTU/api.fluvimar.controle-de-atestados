import { useAuth } from "@/lib/auth-context"

type RelatorioCabecalhoProps = {
  titulo: string
  subtitulo: string
  periodo: string
  filtros?: string
}

export function RelatorioCabecalho({ titulo, subtitulo, periodo, filtros }: RelatorioCabecalhoProps) {
  const { usuario } = useAuth()
  const geradoEm = new Date().toLocaleString("pt-BR")

  return (
    <div className="flex flex-col gap-3 border-b pb-4 print:flex-row print:items-start print:justify-between print:gap-6">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        <p className="text-muted-foreground text-sm">{subtitulo}</p>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs print:w-56 print:shrink-0 print:flex-col print:items-end print:gap-y-1 print:rounded-md print:border print:px-3 print:py-2 print:text-right">
        <span>Período: {periodo}</span>
        {filtros && <span>Filtros: {filtros}</span>}
        <span>
          Gerado em {geradoEm}
          {usuario ? ` por ${usuario.nome}` : ""}
        </span>
      </div>
    </div>
  )
}

export function RelatorioRodape() {
  return (
    <div className="text-muted-foreground border-t pt-3 text-center text-xs">
      Documento gerado automaticamente pelo sistema Fluvimar — Controle de Atestados.
    </div>
  )
}
