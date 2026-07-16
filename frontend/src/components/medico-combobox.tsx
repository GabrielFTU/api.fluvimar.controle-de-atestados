import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { toast } from "sonner"

import { medicosApi, ApiError } from "@/lib/api"
import type { Medico } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type MedicoComboboxProps = {
  value: string
  onChange: (medicoId: string) => void
  medicos: Medico[]
  onMedicoCriado?: (medico: Medico) => void
  placeholder?: string
}

export function MedicoCombobox({
  value,
  onChange,
  medicos,
  onMedicoCriado,
  placeholder = "Médico (opcional)",
}: MedicoComboboxProps) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState("")
  const [criandoNovo, setCriandoNovo] = useState(false)
  const [nomeNovo, setNomeNovo] = useState("")
  const [crmNovo, setCrmNovo] = useState("")
  const [salvando, setSalvando] = useState(false)

  const termoNormalizado = termo.trim().toLowerCase()

  const resultados = termoNormalizado
    ? medicos.filter(
        (medico) =>
          medico.nome.toLowerCase().includes(termoNormalizado) ||
          medico.crm?.toLowerCase().includes(termoNormalizado)
      )
    : medicos

  const existeExato = medicos.some(
    (medico) => medico.nome.trim().toLowerCase() === termoNormalizado
  )

  const selecionado = medicos.find((medico) => medico.id === value)

  function iniciarCriacao() {
    setNomeNovo(termo.trim())
    setCrmNovo("")
    setCriandoNovo(true)
  }

  function fecharTudo() {
    setAberto(false)
    setCriandoNovo(false)
    setTermo("")
  }

  async function salvarNovoMedico() {
    if (nomeNovo.trim().length < 3) {
      toast.error("O nome do médico deve ter pelo menos 3 caracteres.")
      return
    }

    setSalvando(true)
    try {
      const novo = await medicosApi.criar({ nome: nomeNovo.trim(), crm: crmNovo.trim() || null })
      onMedicoCriado?.(novo)
      onChange(novo.id)
      toast.success(`Dr(a). ${novo.nome} adicionado(a).`)
      fecharTudo()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Erro ao adicionar médico.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Popover
      open={aberto}
      onOpenChange={(abrir) => {
        setAberto(abrir)
        if (!abrir) setCriandoNovo(false)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selecionado && "text-muted-foreground")}>
            {selecionado ? `${selecionado.nome}${selecionado.crm ? ` (${selecionado.crm})` : ""}` : placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        {criandoNovo ? (
          <div className="flex flex-col gap-2 p-3">
            <p className="text-sm font-medium">Novo médico</p>
            <Input
              placeholder="Nome do médico"
              value={nomeNovo}
              onChange={(event) => setNomeNovo(event.target.value)}
              autoFocus
            />
            <Input
              placeholder="CRM (opcional)"
              value={crmNovo}
              onChange={(event) => setCrmNovo(event.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setCriandoNovo(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={salvarNovoMedico} disabled={salvando}>
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput placeholder="Buscar médico por nome ou CRM..." value={termo} onValueChange={setTermo} />
            <CommandList>
              {resultados.length === 0 && (
                <CommandEmpty>Nenhum médico encontrado.</CommandEmpty>
              )}
              <CommandGroup>
                {resultados.map((medico) => (
                  <CommandItem
                    key={medico.id}
                    value={medico.id}
                    onSelect={() => {
                      onChange(medico.id)
                      fecharTudo()
                    }}
                  >
                    <Check className={cn(value === medico.id ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{medico.nome}</span>
                    {medico.crm && (
                      <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                        CRM {medico.crm}
                      </span>
                    )}
                  </CommandItem>
                ))}
                {termo.trim().length >= 3 && !existeExato && (
                  <CommandItem onSelect={iniciarCriacao}>
                    <Plus />
                    Adicionar "{termo.trim()}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
