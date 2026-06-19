using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace api.fluvimar.domain.DTO
{
    public sealed class AtestadoDTO
    {
        public abstract class AbstractProdutoDTO
        {
            [JsonPropertyName("nomeFuncionario")]
            [Required(ErrorMessage ="O atributo nome é obrigatório.")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 255 caracteres. ")]
            public string NomeFuncionario { get; set; } = string.Empty;

            [JsonPropertyName("cid")]
            [StringLength(6, MinimumLength = 2, ErrorMessage = "O .")]
            public string CID { get; set; } = string.Empty;
            
            [JsonPropertyName("diaAfastamento")]
            [Required(ErrorMessage = "O atributo diaAfastamento é obrigatório.")]
            public DateTime? DiaAfastamento { get; set; }

            [JsonPropertyName("diaRetorno")]
            [Required(ErrorMessage = "O atributo diaRetorno é obrigatório.")]
            public DateTime? DiaRetorno { get; set; }

            [JsonPropertyName("observacoes")]
            [MaxLength(500, ErrorMessage = "Observações deve ter no máximo 500 caracteres.")]
            public string? Observacoes {  get; set; }
        }
        public abstract class AbstractAtestadoWithIdDTO : AbstractProdutoDTO
        {
            [JsonPropertyName("id")]
            [Required(ErrorMessage = "O atributo id é obrigatório.")]
            public Guid Id { get; set; } = Guid.Empty;
        }

        public sealed class AtestadoRequest : AbstractProdutoDTO { }
        public sealed class AtestadoRequestWithId : AbstractAtestadoWithIdDTO { }
        public sealed class AtestadoResponse : AbstractAtestadoWithIdDTO { }
    }
}
