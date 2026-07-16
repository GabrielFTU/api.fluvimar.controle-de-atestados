import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatTrendChartProps = {
  titulo: string
  dados: Record<string, string | number>[]
  chaveCategoria: string
  chaveValor: string
  cor?: string
}

export function StatTrendChart({
  titulo,
  dados,
  chaveCategoria,
  chaveValor,
  cor = "var(--chart-1)",
}: StatTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm font-normal">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity={0.18} />
                <stop offset="100%" stopColor={cor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey={chaveCategoria}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)", fontWeight: 400 }}
              itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey={chaveValor}
              stroke={cor}
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={{ r: 3, fill: cor, strokeWidth: 2, stroke: "var(--card)" }}
              activeDot={{ r: 5, fill: cor, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
