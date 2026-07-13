using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.fluvimar.domain.DTO
{
    public sealed class AtestadoDTO
    {
        public abstract class AbstractProdutoDTO
        {
            [JsonPropertyName("funcionarioId")]
            [Required(ErrorMessage = "O atributo funcionarioId é obrigatório.")]
            public Guid FuncionarioId { get; set; }

            [JsonPropertyName("cid")]
            [StringLength(6, MinimumLength = 2, ErrorMessage = "O CID deve ter entre 2 e 6 caracteres.")]
            public string? CID { get; set; }

            [JsonPropertyName("diaAfastamento")]
            [Required(ErrorMessage = "O atributo diaAfastamento é obrigatório.")]
            public DateTime? DiaAfastamento { get; set; }

            [JsonPropertyName("diaRetorno")]
            [Required(ErrorMessage = "O atributo diaRetorno é obrigatório.")]
            public DateTime? DiaRetorno { get; set; }

            [JsonPropertyName("observacoes")]
            [MaxLength(500, ErrorMessage = "Observações deve ter no máximo 500 caracteres.")]
            public string? Observacoes { get; set; }
        }

        public abstract class AbstractAtestadoWithIdDTO : AbstractProdutoDTO
        {
            [JsonPropertyName("id")]
            [Required(ErrorMessage = "O atributo id é obrigatório.")]
            public Guid Id { get; set; }
        }

        public sealed class AtestadoRequest : AbstractProdutoDTO { }
        public sealed class AtestadoRequestWithId : AbstractAtestadoWithIdDTO { }

        public sealed class AtestadoResponse : AbstractAtestadoWithIdDTO
        {
            [JsonPropertyName("nomeFuncionario")]
            public string NomeFuncionario { get; set; } = string.Empty;
        }
    }
}
