import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type Sentimento = "positivo-se-sobe" | "positivo-se-desce" | "neutro"

type TrendBadgeProps = {
  atual: number
  anterior: number
  sentimento?: Sentimento
  sufixo?: string
  className?: string
}

function calcularVariacao(atual: number, anterior: number) {
  if (anterior === 0) {
    if (atual === 0) return { percentual: 0, direcao: "flat" as const }
    return { percentual: 100, direcao: "up" as const }
  }

  const percentual = ((atual - anterior) / anterior) * 100
  const direcao = percentual > 0.5 ? "up" as const : percentual < -0.5 ? "down" as const : "flat" as const
  return { percentual, direcao }
}

export function TrendBadge({
  atual,
  anterior,
  sentimento = "neutro",
  sufixo = "vs. período anterior",
  className,
}: TrendBadgeProps) {
  const { percentual, direcao } = calcularVariacao(atual, anterior)

  const ehBom =
    direcao === "flat"
      ? null
      : sentimento === "neutro"
        ? null
        : sentimento === "positivo-se-sobe"
          ? direcao === "up"
          : direcao === "down"

  const cor =
    ehBom === null
      ? "text-muted-foreground bg-muted"
      : ehBom
        ? "text-success bg-success/10"
        : "text-destructive bg-destructive/10"

  const Icone = direcao === "up" ? TrendingUp : direcao === "down" ? TrendingDown : Minus

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
        cor,
        className
      )}
    >
      <Icone className="size-3" />
      {direcao !== "flat" ? `${Math.abs(percentual).toFixed(0)}%` : "estável"}
      {sufixo && <span className="text-muted-foreground font-normal">{sufixo}</span>}
    </span>
  )
}
