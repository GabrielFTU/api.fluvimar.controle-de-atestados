type RelatorioBarraProps = {
  rotulo: string
  valor: number
  maximo: number
  detalhe?: string
}

export function RelatorioBarra({ rotulo, valor, maximo, detalhe }: RelatorioBarraProps) {
  const proporcao = maximo > 0 ? Math.min(1, valor / maximo) : 0

  return (
    <div className="flex flex-col gap-1 py-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate">{rotulo}</span>
        <span className="text-muted-foreground shrink-0 tabular-nums">
          {valor}
          {detalhe && <span className="ml-1.5 text-xs">{detalhe}</span>}
        </span>
      </div>
      <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-1.5 w-full text-foreground">
        <rect x="0" y="1.5" width="100" height="3" rx="1.5" fill="none" stroke="currentColor" strokeOpacity="0.2" />
        <rect x="0" y="1.5" width={proporcao * 100} height="3" rx="1.5" fill="currentColor" />
      </svg>
    </div>
  )
}
