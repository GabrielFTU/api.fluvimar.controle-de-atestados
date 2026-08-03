import { cn } from "@/lib/utils"

type LimparFiltrosLinkProps = {
  onClick: () => void
  className?: string
}

export function LimparFiltrosLink({ onClick, className }: LimparFiltrosLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ml-auto shrink-0 text-sm text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
        className
      )}
    >
      Limpar filtro
    </button>
  )
}
