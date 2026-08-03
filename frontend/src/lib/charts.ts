export function calcularLarguraEixoY(dados: Record<string, string | number>[], chaveValor: string): number {
  const maiorValor = dados.reduce((maior, item) => {
    const valor = Math.abs(Number(item[chaveValor]) || 0)
    return valor > maior ? valor : maior
  }, 0)
  const digitos = Math.max(1, Math.round(maiorValor).toString().length)
  return digitos * 8 + 20
}
