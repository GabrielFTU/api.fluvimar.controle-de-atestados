import type { ClassificacaoAtestado } from "@/lib/types"

export function variantePorClassificacao(
  classificacao: ClassificacaoAtestado
): "default" | "violet" | "teal" {
  switch (classificacao) {
    case "Atestado":
      return "default"
    case "Declaracao":
      return "violet"
    case "Acompanhante":
      return "teal"
  }
}
