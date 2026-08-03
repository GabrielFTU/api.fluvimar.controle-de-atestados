import type { LucideIcon } from "lucide-react"

type RelatorioMetricaProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
}

export function RelatorioMetrica({ label, value, icon: Icon, hint }: RelatorioMetricaProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-3 print:min-w-0 print:flex-1 print:gap-1 print:rounded-none print:border-0 print:border-r print:border-foreground/20 print:px-3 print:py-0 print:last:border-r-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        {Icon && <Icon className="text-muted-foreground size-3.5 shrink-0 print:hidden" />}
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums print:text-lg">{value}</span>
      {hint && <span className="text-muted-foreground text-xs print:hidden">{hint}</span>}
    </div>
  )
}
