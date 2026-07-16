using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.fluvimar.domain.DTO
{
    public sealed class FuncionarioDTO
    {
        public abstract class AbstractFuncionarioDTO
        {
            [JsonPropertyName("nome")]
            [Required(ErrorMessage = "O atributo nome é obrigatório.")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 255 caracteres.")]
            public string Nome { get; set; } = string.Empty;

            [JsonPropertyName("setorId")]
            public Guid? SetorId { get; set; }
        }

        public abstract class AbstractFuncionarioWithIdDTO : AbstractFuncionarioDTO
        {
            [JsonPropertyName("id")]
            [Required(ErrorMessage = "O atributo id é obrigatório.")]
            public Guid Id { get; set; }
        }

        public sealed class FuncionarioRequest : AbstractFuncionarioDTO { }
        public sealed class FuncionarioRequestWithId : AbstractFuncionarioWithIdDTO { }

        public sealed class FuncionarioResponse : AbstractFuncionarioWithIdDTO
        {
            [JsonPropertyName("nomeDoSetor")]
            public string? NomeDoSetor { get; set; }
        }
    }
}
