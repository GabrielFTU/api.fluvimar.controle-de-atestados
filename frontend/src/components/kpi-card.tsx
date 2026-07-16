import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: React.ReactNode
  hint?: string
  tone?: "default" | "warning"
  onClick?: () => void
  className?: string
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  tone = "default",
  onClick,
  className,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        "gap-3",
        tone === "warning" && "ring-warning/40 bg-warning/5",
        onClick && "hover:ring-primary/40 cursor-pointer transition-shadow",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">{label}</span>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              tone === "warning"
                ? "bg-warning/20 text-warning-foreground"
                : "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
        </div>
        {trend ? (
          <div>{trend}</div>
        ) : hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
