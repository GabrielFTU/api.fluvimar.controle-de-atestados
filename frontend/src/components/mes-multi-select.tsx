import { ChevronDownIcon } from "lucide-react"

import { MESES } from "@/lib/stats"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type MesMultiSelectProps = {
  value: number[]
  onChange: (value: number[]) => void
  disabled?: boolean
  className?: string
}

export function MesMultiSelect({ value, onChange, disabled, className }: MesMultiSelectProps) {
  function alternar(mes: number) {
    if (value.includes(mes)) {
      onChange(value.filter((item) => item !== mes))
    } else {
      onChange([...value, mes].sort((a, b) => a - b))
    }
  }

  const rotulo =
    value.length === 0
      ? "Todos os meses"
      : value.length === 1
        ? MESES[value[0] - 1]
        : `${value.length} meses selecionados`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("w-36 justify-between font-normal", className)}
        >
          <span className="truncate">{rotulo}</span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44 p-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className="flex w-full items-center rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Todos os meses
        </button>
        <div className="my-1 h-px bg-border" />
        <div className="flex flex-col">
          {MESES.map((nomeMes, index) => {
            const mes = index + 1
            const selecionado = value.includes(mes)
            return (
              <button
                key={mes}
                type="button"
                onClick={() => alternar(mes)}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Checkbox checked={selecionado} className="pointer-events-none" />
                {nomeMes}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
