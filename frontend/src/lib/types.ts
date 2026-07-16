export type Funcionario = {
  id: string
  nome: string
  setorId: string | null
  nomeDoSetor: string | null
}

export type FuncionarioInput = {
  nome: string
  setorId: string | null
}

export type Unidade = "Administracao" | "Unidade1" | "Unidade2"

export type Setor = {
  id: string
  nomeDoSetor: string
  responsavel: string | null
  unidade: Unidade | null
}

export type SetorInput = {
  nomeDoSetor: string
  responsavel: string | null
  unidade: Unidade | null
}

export type Cid = {
  codigo: string
  descricao: string
}

export type Medico = {
  id: string
  nome: string
  crm: string | null
}

export type MedicoInput = {
  nome: string
  crm: string | null
}

export type TipoAtestado = "DiaCompleto" | "Horario"

export type ClassificacaoAtestado = "Atestado" | "Declaracao" | "Acompanhante"

export type Atestado = {
  id: string
  funcionarioId: string
  nomeFuncionario: string
  cid: string | null
  tipoAtestado: TipoAtestado
  classificacao: ClassificacaoAtestado
  medicoId: string | null
  nomeMedico: string | null
  diaAfastamento: string | null
  diaRetorno: string | null
  horaInicio: string | null
  horaFim: string | null
  totalDiasFora: number | null
  totalHoras: number | null
  observacoes: string | null
}

export type AtestadoInput = {
  funcionarioId: string
  cid: string | null
  tipoAtestado: TipoAtestado
  classificacao: ClassificacaoAtestado
  medicoId: string | null
  diaAfastamento: string
  diaRetorno: string
  horaInicio: string | null
  horaFim: string | null
  observacoes: string | null
}

export type ResumoEstatistica = {
  atestadosHoje: number
  atestadosOntem: number
  atestadosMesAtual: number
  atestadosMesAnterior: number
  diasAfastadosMesAtual: number
  diasAfastadosMesAnterior: number
  atestadosAtivosAgora: number
  mediaDiasPorAtestadoMesAtual: number
  atestadosAtivosAcimaDe15Dias: number
  horasAtestadasMesAtual: number
  horasAtestadasMesAnterior: number
}

export type SerieMensalItem = {
  mes: number
  quantidade: number
  diasAfastados: number
}

export type DiaSemanaItem = {
  diaSemana: number
  quantidade: number
}

export type SetorEstatistica = {
  setorId: string | null
  nomeDoSetor: string
  quantidade: number
  diasAfastados: number
}

export type TopFuncionarioItem = {
  funcionarioId: string
  nomeFuncionario: string
  quantidade: number
}

export type TopCidItem = {
  cid: string
  descricao: string | null
  quantidade: number
  quantidadeFuncionarios: number
}

export type TopMedicoItem = {
  medicoId: string
  nomeMedico: string
  crm: string | null
  quantidade: number
  quantidadeFuncionarios: number
}

export type FuncionarioEstatistica = {
  funcionarioId: string
  nomeFuncionario: string
  totalAtestados: number
  totalDiasAfastado: number
  totalHorasAfastado: number
  mediaDiasPorAtestado: number
  ultimoAtestado: string | null
  serieMensal: SerieMensalItem[]
  porDiaSemana: DiaSemanaItem[]
}

export type AtestadoDetalheItem = {
  atestadoId: string
  funcionarioId: string
  nomeFuncionario: string
  nomeDoSetor: string | null
  tipoAtestado: TipoAtestado
  classificacao: ClassificacaoAtestado
  nomeMedico: string | null
  diaAfastamento: string | null
  diaRetorno: string | null
  horaInicio: string | null
  horaFim: string | null
  totalDiasFora: number | null
  totalHoras: number | null
  observacoes: string | null
}

export type DetalheAtestadosFiltro = {
  cid?: string
  setorId?: string
  semSetor?: boolean
  funcionarioId?: string
  medicoId?: string
  classificacao?: ClassificacaoAtestado
  unidade?: Unidade
  ano?: number
  mes?: number
  apenasAtivos?: boolean
  diasMinimosAfastamento?: number
}

export type ReincidenteItem = {
  funcionarioId: string
  nomeFuncionario: string
  nomeDoSetor: string | null
  quantidadeUltimosMeses: number
  ultimoAtestado: string | null
}

export type Usuario = {
  id: string
  nome: string
  email: string
  isAdmin: boolean
  isActive: boolean
}

export type UsuarioInput = {
  nome: string
  email: string
  senha: string
  isAdmin: boolean
}

export type LoginInput = {
  email: string
  senha: string
}

export type LoginResponse = {
  token: string
  expiraEm: string
  usuario: Usuario
}
