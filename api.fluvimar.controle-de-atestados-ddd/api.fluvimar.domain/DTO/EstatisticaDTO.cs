using System.Text.Json.Serialization;
using api.fluvimar.domain.Enums;

namespace api.fluvimar.domain.DTO
{
    public sealed class EstatisticaDTO
    {
        public sealed class ResumoResponse
        {
            [JsonPropertyName("atestadosHoje")]
            public int AtestadosHoje { get; set; }

            [JsonPropertyName("atestadosOntem")]
            public int AtestadosOntem { get; set; }

            [JsonPropertyName("atestadosMesAtual")]
            public int AtestadosMesAtual { get; set; }

            [JsonPropertyName("atestadosMesAnterior")]
            public int AtestadosMesAnterior { get; set; }

            [JsonPropertyName("diasAfastadosMesAtual")]
            public int DiasAfastadosMesAtual { get; set; }

            [JsonPropertyName("diasAfastadosMesAnterior")]
            public int DiasAfastadosMesAnterior { get; set; }

            [JsonPropertyName("atestadosAtivosAgora")]
            public int AtestadosAtivosAgora { get; set; }

            [JsonPropertyName("mediaDiasPorAtestadoMesAtual")]
            public double MediaDiasPorAtestadoMesAtual { get; set; }

            [JsonPropertyName("atestadosAtivosAcimaDe15Dias")]
            public int AtestadosAtivosAcimaDe15Dias { get; set; }

            [JsonPropertyName("horasAtestadasMesAtual")]
            public double HorasAtestadasMesAtual { get; set; }

            [JsonPropertyName("horasAtestadasMesAnterior")]
            public double HorasAtestadasMesAnterior { get; set; }
        }

        public sealed class SerieMensalItem
        {
            [JsonPropertyName("mes")]
            public int Mes { get; set; }

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }

            [JsonPropertyName("diasAfastados")]
            public int DiasAfastados { get; set; }
        }

        public sealed class DiaSemanaItem
        {
            [JsonPropertyName("diaSemana")]
            public int DiaSemana { get; set; }

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }
        }

        public sealed class SetorItem
        {
            [JsonPropertyName("setorId")]
            public Guid? SetorId { get; set; }

            [JsonPropertyName("nomeDoSetor")]
            public string NomeDoSetor { get; set; } = string.Empty;

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }

            [JsonPropertyName("diasAfastados")]
            public int DiasAfastados { get; set; }
        }

        public sealed class TopFuncionarioItem
        {
            [JsonPropertyName("funcionarioId")]
            public Guid FuncionarioId { get; set; }

            [JsonPropertyName("nomeFuncionario")]
            public string NomeFuncionario { get; set; } = string.Empty;

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }
        }

        public sealed class TopCidItem
        {
            [JsonPropertyName("cid")]
            public string Cid { get; set; } = string.Empty;

            [JsonPropertyName("descricao")]
            public string? Descricao { get; set; }

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }

            [JsonPropertyName("quantidadeFuncionarios")]
            public int QuantidadeFuncionarios { get; set; }
        }

        public sealed class TopMedicoItem
        {
            [JsonPropertyName("medicoId")]
            public Guid MedicoId { get; set; }

            [JsonPropertyName("nomeMedico")]
            public string NomeMedico { get; set; } = string.Empty;

            [JsonPropertyName("crm")]
            public string? Crm { get; set; }

            [JsonPropertyName("quantidade")]
            public int Quantidade { get; set; }

            [JsonPropertyName("quantidadeFuncionarios")]
            public int QuantidadeFuncionarios { get; set; }
        }

        public sealed class AtestadoDetalheItem
        {
            [JsonPropertyName("atestadoId")]
            public Guid AtestadoId { get; set; }

            [JsonPropertyName("funcionarioId")]
            public Guid FuncionarioId { get; set; }

            [JsonPropertyName("nomeFuncionario")]
            public string NomeFuncionario { get; set; } = string.Empty;

            [JsonPropertyName("nomeDoSetor")]
            public string? NomeDoSetor { get; set; }

            [JsonPropertyName("tipoAtestado")]
            public TipoAtestado TipoAtestado { get; set; }

            [JsonPropertyName("classificacao")]
            public ClassificacaoAtestado Classificacao { get; set; }

            [JsonPropertyName("nomeMedico")]
            public string? NomeMedico { get; set; }

            [JsonPropertyName("diaAfastamento")]
            public DateTime? DiaAfastamento { get; set; }

            [JsonPropertyName("diaRetorno")]
            public DateTime? DiaRetorno { get; set; }

            [JsonPropertyName("horaInicio")]
            public TimeSpan? HoraInicio { get; set; }

            [JsonPropertyName("horaFim")]
            public TimeSpan? HoraFim { get; set; }

            [JsonPropertyName("totalDiasFora")]
            public int? TotalDiasFora { get; set; }

            [JsonPropertyName("totalHoras")]
            public double? TotalHoras { get; set; }

            [JsonPropertyName("observacoes")]
            public string? Observacoes { get; set; }
        }

        public sealed class ReincidenteItem
        {
            [JsonPropertyName("funcionarioId")]
            public Guid FuncionarioId { get; set; }

            [JsonPropertyName("nomeFuncionario")]
            public string NomeFuncionario { get; set; } = string.Empty;

            [JsonPropertyName("nomeDoSetor")]
            public string? NomeDoSetor { get; set; }

            [JsonPropertyName("quantidadeUltimosMeses")]
            public int QuantidadeUltimosMeses { get; set; }

            [JsonPropertyName("ultimoAtestado")]
            public DateTime? UltimoAtestado { get; set; }
        }

        public sealed class FuncionarioEstatisticaResponse
        {
            [JsonPropertyName("funcionarioId")]
            public Guid FuncionarioId { get; set; }

            [JsonPropertyName("nomeFuncionario")]
            public string NomeFuncionario { get; set; } = string.Empty;

            [JsonPropertyName("totalAtestados")]
            public int TotalAtestados { get; set; }

            [JsonPropertyName("totalDiasAfastado")]
            public int TotalDiasAfastado { get; set; }

            [JsonPropertyName("totalHorasAfastado")]
            public double TotalHorasAfastado { get; set; }

            [JsonPropertyName("mediaDiasPorAtestado")]
            public double MediaDiasPorAtestado { get; set; }

            [JsonPropertyName("ultimoAtestado")]
            public DateTime? UltimoAtestado { get; set; }

            [JsonPropertyName("serieMensal")]
            public List<SerieMensalItem> SerieMensal { get; set; } = new();

            [JsonPropertyName("porDiaSemana")]
            public List<DiaSemanaItem> PorDiaSemana { get; set; } = new();
        }
    }
}
