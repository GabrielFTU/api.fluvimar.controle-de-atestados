import type {
  Atestado,
  AtestadoDetalheItem,
  AtestadoInput,
  Cid,
  ClassificacaoAtestado,
  DetalheAtestadosFiltro,
  DiaSemanaItem,
  Funcionario,
  FuncionarioEstatistica,
  FuncionarioInput,
  LoginInput,
  LoginResponse,
  Medico,
  MedicoInput,
  ReincidenteItem,
  ResumoEstatistica,
  SerieMensalItem,
  Setor,
  SetorEstatistica,
  SetorInput,
  TopCidItem,
  TopFuncionarioItem,
  TopMedicoItem,
  Unidade,
  Usuario,
  UsuarioInput,
} from "@/lib/types"

type FiltroEstatisticasComuns = {
  unidade?: Unidade
  setorId?: string
  classificacao?: ClassificacaoAtestado
}

function montarQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== undefined) query.set(chave, String(valor))
  }
  return query.toString()
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api"
const TOKEN_STORAGE_KEY = "fluvimar:token"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

let aoNaoAutorizado: (() => void) | null = null

// Chamado pelo AuthProvider para reagir a um token expirado/inválido em qualquer requisição.
export function setAoNaoAutorizado(handler: () => void) {
  aoNaoAutorizado = handler
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (init?.body) {
    headers.set("Content-Type", "application/json")
  }

  const token = getToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    setToken(null)
    aoNaoAutorizado?.()
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.message ?? response.statusText)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// Different pages share the same lists (ex: funcionários aparece em Apontamentos,
// Atestados e Pessoas), então cacheamos as respostas de GET em memória para evitar
// refazer a mesma requisição a cada troca de página. Qualquer escrita invalida tudo.
const listCache = new Map<string, Promise<unknown>>()

function cachedList<T>(path: string): Promise<T> {
  let cached = listCache.get(path) as Promise<T> | undefined
  if (!cached) {
    cached = request<T>(path)
    cached.catch(() => listCache.delete(path))
    listCache.set(path, cached)
  }
  return cached
}

function invalidateListCache() {
  listCache.clear()
}

export const funcionariosApi = {
  listar: () => cachedList<Funcionario[]>("/funcionarios"),
  obter: (id: string) => request<Funcionario>(`/funcionarios/${id}`),
  criar: (dto: FuncionarioInput) =>
    request<Funcionario>("/funcionarios", {
      method: "POST",
      body: JSON.stringify(dto),
    }).finally(invalidateListCache),
  atualizar: (id: string, dto: FuncionarioInput) =>
    request<void>(`/funcionarios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...dto }),
    }).finally(invalidateListCache),
  remover: (id: string) =>
    request<void>(`/funcionarios/${id}`, { method: "DELETE" }).finally(invalidateListCache),
}

export const setoresApi = {
  listar: () => cachedList<Setor[]>("/setores"),
  obter: (id: string) => request<Setor>(`/setores/${id}`),
  criar: (dto: SetorInput) =>
    request<void>("/setores", {
      method: "POST",
      body: JSON.stringify(dto),
    }).finally(invalidateListCache),
  atualizar: (id: string, dto: SetorInput) =>
    request<void>(`/setores/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...dto }),
    }).finally(invalidateListCache),
  remover: (id: string) =>
    request<void>(`/setores/${id}`, { method: "DELETE" }).finally(invalidateListCache),
}

export const cidsApi = {
  buscar: (termo: string) =>
    request<Cid[]>(`/cids?termo=${encodeURIComponent(termo)}`),
}

export const medicosApi = {
  listar: () => cachedList<Medico[]>("/medicos"),
  criar: (dto: MedicoInput) =>
    request<Medico>("/medicos", {
      method: "POST",
      body: JSON.stringify(dto),
    }).finally(invalidateListCache),
}

export const atestadosApi = {
  listar: () => cachedList<Atestado[]>("/atestados"),
  obter: (id: string) => request<Atestado>(`/atestados/${id}`),
  criar: (dto: AtestadoInput) =>
    request<void>("/atestados", {
      method: "POST",
      body: JSON.stringify(dto),
    }).finally(invalidateListCache),
  atualizar: (id: string, dto: AtestadoInput) =>
    request<void>(`/atestados/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...dto }),
    }).finally(invalidateListCache),
  remover: (id: string) =>
    request<void>(`/atestados/${id}`, { method: "DELETE" }).finally(invalidateListCache),
}

export const estatisticasApi = {
  resumo: () => request<ResumoEstatistica>("/estatisticas/resumo"),
  anos: () => request<number[]>("/estatisticas/anos"),
  serieMensal: (ano: number, filtro: FiltroEstatisticasComuns = {}) =>
    request<SerieMensalItem[]>(
      `/estatisticas/serie-mensal?${montarQuery({ ano, ...filtro })}`
    ),
  porDiaSemana: (ano?: number, mes?: number, filtro: FiltroEstatisticasComuns = {}) =>
    request<DiaSemanaItem[]>(
      `/estatisticas/dia-semana?${montarQuery({ ano, mes, ...filtro })}`
    ),
  porSetor: (ano?: number, mes?: number, filtro: Omit<FiltroEstatisticasComuns, "setorId"> = {}) =>
    request<SetorEstatistica[]>(
      `/estatisticas/por-setor?${montarQuery({ ano, mes, ...filtro })}`
    ),
  topFuncionarios: (ano: number, mes?: number, limite = 10, filtro: FiltroEstatisticasComuns = {}) =>
    request<TopFuncionarioItem[]>(
      `/estatisticas/top-funcionarios?${montarQuery({ ano, mes, limite, ...filtro })}`
    ),
  topCids: (ano?: number, mes?: number, limite = 10, filtro: FiltroEstatisticasComuns = {}) =>
    request<TopCidItem[]>(
      `/estatisticas/top-cids?${montarQuery({ ano, mes, limite, ...filtro })}`
    ),
  topMedicos: (ano?: number, mes?: number, limite = 10, filtro: FiltroEstatisticasComuns = {}) =>
    request<TopMedicoItem[]>(
      `/estatisticas/top-medicos?${montarQuery({ ano, mes, limite, ...filtro })}`
    ),
  porFuncionario: (funcionarioId: string, ano?: number, mes?: number) =>
    request<FuncionarioEstatistica>(
      `/estatisticas/funcionario/${funcionarioId}?${montarQuery({ ano, mes })}`
    ),
  detalheAtestados: (filtro: DetalheAtestadosFiltro) => {
    const params = new URLSearchParams()
    if (filtro.cid) params.set("cid", filtro.cid)
    if (filtro.setorId) params.set("setorId", filtro.setorId)
    if (filtro.semSetor) params.set("semSetor", "true")
    if (filtro.funcionarioId) params.set("funcionarioId", filtro.funcionarioId)
    if (filtro.medicoId) params.set("medicoId", filtro.medicoId)
    if (filtro.classificacao) params.set("classificacao", filtro.classificacao)
    if (filtro.unidade) params.set("unidade", filtro.unidade)
    if (filtro.ano) params.set("ano", String(filtro.ano))
    if (filtro.mes !== undefined) params.set("mes", String(filtro.mes))
    if (filtro.apenasAtivos) params.set("apenasAtivos", "true")
    if (filtro.diasMinimosAfastamento !== undefined)
      params.set("diasMinimosAfastamento", String(filtro.diasMinimosAfastamento))
    return request<AtestadoDetalheItem[]>(`/estatisticas/atestados-detalhe?${params.toString()}`)
  },
  reincidentes: (meses = 6, minimo = 3) =>
    request<ReincidenteItem[]>(`/estatisticas/reincidentes?meses=${meses}&minimo=${minimo}`),
}

export const authApi = {
  login: (dto: LoginInput) =>
    request<LoginResponse>("/autenticacao/login", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  me: () => request<Usuario>("/autenticacao/me"),
}

export const usuariosApi = {
  listar: () => request<Usuario[]>("/usuarios"),
  criar: (dto: UsuarioInput) =>
    request<Usuario>("/usuarios", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  ativar: (id: string) => request<void>(`/usuarios/${id}/ativar`, { method: "PATCH" }),
  desativar: (id: string) => request<void>(`/usuarios/${id}/desativar`, { method: "PATCH" }),
}
