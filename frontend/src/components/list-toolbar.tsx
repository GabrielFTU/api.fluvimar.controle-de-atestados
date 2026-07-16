import { Download, ListFilter, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ListToolbarProps = {
  title: string
  description: string
  selectedCount: number
  onDeleteSelected: () => void
  searchOpen: boolean
  onToggleSearch: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  onExport: () => void
  addLabel: string
  onAdd: () => void
}

export function ListToolbar({
  title,
  description,
  selectedCount,
  onDeleteSelected,
  searchOpen,
  onToggleSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onExport,
  addLabel,
  onAdd,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={selectedCount === 0}
            onClick={onDeleteSelected}
          >
            <Trash2 />
            {selectedCount > 0 ? `Excluir (${selectedCount})` : "Excluir"}
          </Button>
          <Button variant="outline" aria-pressed={searchOpen} onClick={onToggleSearch}>
            <ListFilter />
            Filtros
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download />
            Exportar
          </Button>
          <Button onClick={onAdd}>
            <Plus />
            {addLabel}
          </Button>
        </div>
      </div>
      {searchOpen && (
        <Input
          autoFocus
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
      )}
    </div>
  )
}
