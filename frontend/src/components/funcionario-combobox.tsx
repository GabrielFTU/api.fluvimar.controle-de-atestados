import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { funcionariosApi, ApiError } from "@/lib/api"
import type { Funcionario } from "@/lib/types"
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

type FuncionarioComboboxProps = {
  value: string
  onChange: (funcionarioId: string) => void
  funcionarios: Funcionario[]
  onFuncionarioCriado?: (funcionario: Funcionario) => void
  placeholder?: string
  opcaoExtra?: { value: string; label: string }
}

export function FuncionarioCombobox({
  value,
  onChange,
  funcionarios,
  onFuncionarioCriado,
  placeholder = "Buscar pessoa...",
  opcaoExtra,
}: FuncionarioComboboxProps) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState("")
  const [criando, setCriando] = useState(false)

  const termoNormalizado = termo.trim().toLowerCase()

  const resultados = useMemo(() => {
    if (!termoNormalizado) return funcionarios
    return funcionarios.filter((funcionario) =>
      funcionario.nome.toLowerCase().includes(termoNormalizado)
    )
  }, [funcionarios, termoNormalizado])

  const existeExato = funcionarios.some(
    (funcionario) => funcionario.nome.trim().toLowerCase() === termoNormalizado
  )

  const rotuloSelecionado =
    (opcaoExtra && opcaoExtra.value === value ? opcaoExtra.label : undefined) ??
    funcionarios.find((funcionario) => funcionario.id === value)?.nome

  async function criarFuncionario() {
    const nome = termo.trim()
    setCriando(true)
    try {
      const novo = await funcionariosApi.criar({ nome, setorId: null })
      onFuncionarioCriado?.(novo)
      onChange(novo.id)
      toast.success(`"${novo.nome}" adicionado.`)
      setAberto(false)
      setTermo("")
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao adicionar pessoa.")
    } finally {
      setCriando(false)
    }
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !rotuloSelecionado && "text-muted-foreground")}>
            {rotuloSelecionado ?? placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Digite o nome..." value={termo} onValueChange={setTermo} />
          <CommandList>
            {resultados.length === 0 && !termoNormalizado && (
              <CommandEmpty>Nenhuma pessoa cadastrada.</CommandEmpty>
            )}
            {resultados.length === 0 && termoNormalizado && !criando && (
              <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {opcaoExtra && (
                <CommandItem
                  value={opcaoExtra.value}
                  onSelect={() => {
                    onChange(opcaoExtra.value)
                    setAberto(false)
                  }}
                >
                  <Check className={cn(value === opcaoExtra.value ? "opacity-100" : "opacity-0")} />
                  {opcaoExtra.label}
                </CommandItem>
              )}
              {resultados.map((funcionario) => (
                <CommandItem
                  key={funcionario.id}
                  value={funcionario.id}
                  onSelect={() => {
                    onChange(funcionario.id)
                    setAberto(false)
                  }}
                >
                  <Check className={cn(value === funcionario.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{funcionario.nome}</span>
                  {funcionario.nomeDoSetor && (
                    <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                      {funcionario.nomeDoSetor}
                    </span>
                  )}
                </CommandItem>
              ))}
              {termo.trim().length >= 3 && !existeExato && (
                <CommandItem disabled={criando} onSelect={criarFuncionario}>
                  {criando ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                  Adicionar "{termo.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
