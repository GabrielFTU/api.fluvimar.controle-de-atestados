import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cidsApi } from "@/lib/api"
import type { Cid } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type CidComboboxProps = {
  value: string
  onChange: (value: string) => void
}

export function CidCombobox({ value, onChange }: CidComboboxProps) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState("")
  const [resultados, setResultados] = useState<Cid[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!aberto || termo.trim().length < 2) {
      setResultados([])
      return
    }

    const controller = new AbortController()
    setCarregando(true)
    const timeout = setTimeout(() => {
      cidsApi
        .buscar(termo)
        .then((cids) => {
          if (!controller.signal.aborted) setResultados(cids)
        })
        .catch(() => {
          if (!controller.signal.aborted) setResultados([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setCarregando(false)
        })
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [termo, aberto])

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Buscar CID..."}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o código ou a descrição..."
            value={termo}
            onValueChange={setTermo}
          />
          <CommandList>
            {carregando && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!carregando && termo.trim().length < 2 && (
              <CommandEmpty>Digite ao menos 2 caracteres.</CommandEmpty>
            )}
            {!carregando && termo.trim().length >= 2 && resultados.length === 0 && (
              <CommandEmpty>Nenhum CID encontrado.</CommandEmpty>
            )}
            <CommandGroup>
              {resultados.map((cid) => (
                <CommandItem
                  key={cid.codigo}
                  value={cid.codigo}
                  onSelect={() => {
                    onChange(cid.codigo)
                    setAberto(false)
                  }}
                >
                  <Check
                    className={cn(value === cid.codigo ? "opacity-100" : "opacity-0")}
                  />
                  <span className="font-medium">{cid.codigo}</span>
                  <span className="truncate text-muted-foreground">{cid.descricao}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
