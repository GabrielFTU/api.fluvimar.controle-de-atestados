import { useState } from "react"
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "selecao",
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
  }
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  loading?: boolean
  emptyMessage?: string
  globalFilter?: string
  getRowId?: (row: TData) => string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  pageSize?: number
}

export function DataTable<TData>({
  columns,
  data,
  loading,
  emptyMessage = "Nenhum resultado encontrado.",
  globalFilter,
  getRowId,
  rowSelection,
  onRowSelectionChange,
  pageSize = 10,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})

  const selection = rowSelection ?? internalSelection
  const setSelection = (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => {
    const next = typeof updater === "function" ? updater(selection) : updater
    onRowSelectionChange?.(next)
    if (!rowSelection) setInternalSelection(next)
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection: selection },
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const linhas = table.getRowModel().rows
  const totalFiltrado = table.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const direction = header.column.getIsSorted()

                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          className="flex items-center gap-1.5 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {direction === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : direction === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="text-muted-foreground/50 size-3.5" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : linhas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              linhas.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalFiltrado > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {Math.max(1, table.getPageCount())} · {totalFiltrado}{" "}
            {totalFiltrado === 1 ? "resultado" : "resultados"}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Por página</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(valor) => table.setPageSize(Number(valor))}
              >
                <SelectTrigger className="h-8 w-16" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((tamanho) => (
                    <SelectItem key={tamanho} value={String(tamanho)}>
                      {tamanho}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Página anterior"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Próxima página"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
