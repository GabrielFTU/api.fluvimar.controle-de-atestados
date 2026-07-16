import { useNavigate } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import type { AtestadoDetalheItem, ClassificacaoAtestado } from "@/lib/types"
import { formatarData } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const LIMITE_DIAS_INSS = 15

const CLASSIFICACAO_LABEL: Record<ClassificacaoAtestado, string> = {
  Atestado: "Atestado",
  Declaracao: "Declaração",
  Acompanhante: "Acompanhante",
}

type AtestadoDetalheDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descricao?: string
  itens: AtestadoDetalheItem[]
  carregando?: boolean
}

export function AtestadoDetalheDialog({
  open,
  onOpenChange,
  titulo,
  descricao,
  itens,
  carregando,
}: AtestadoDetalheDialogProps) {
  const navigate = useNavigate()

  function verFuncionario(funcionarioId: string) {
    onOpenChange(false)
    navigate(`/estatisticas/funcionario?funcionarioId=${funcionarioId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descricao && <p className="text-muted-foreground text-sm">{descricao}</p>}
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Afastamento</TableHead>
                <TableHead>Retorno</TableHead>
                <TableHead className="text-right">Duração</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : itens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Nenhum atestado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                itens.map((item) => (
                  <TableRow key={item.atestadoId}>
                    <TableCell className="font-medium">{item.nomeFuncionario}</TableCell>
                    <TableCell>
                      <Badge variant={item.classificacao === "Atestado" ? "secondary" : "outline"}>
                        {CLASSIFICACAO_LABEL[item.classificacao]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.nomeMedico ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {item.nomeDoSetor ?? (
                        <span className="text-muted-foreground">Sem setor</span>
                      )}
                    </TableCell>
                    <TableCell>{formatarData(item.diaAfastamento)}</TableCell>
                    <TableCell>{formatarData(item.diaRetorno)}</TableCell>
                    <TableCell className="text-right">
                      {item.tipoAtestado === "Horario" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Badge variant="secondary">{item.totalHoras ?? 0}h</Badge>
                          <span className="text-muted-foreground text-xs">
                            {item.horaInicio?.slice(0, 5)}–{item.horaFim?.slice(0, 5)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="tabular-nums">{item.totalDiasFora ?? "—"}</span>
                          {(item.totalDiasFora ?? 0) > LIMITE_DIAS_INSS && (
                            <Badge
                              variant="outline"
                              className="border-warning text-warning-foreground bg-warning/15"
                            >
                              +15d
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Ver estatísticas do funcionário"
                        onClick={() => verFuncionario(item.funcionarioId)}
                      >
                        <ArrowUpRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
