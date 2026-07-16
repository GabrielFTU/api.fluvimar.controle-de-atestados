using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.fluvimar.domain.DTO
{
    public sealed class MedicoDTO
    {
        public sealed class MedicoRequest
        {
            [JsonPropertyName("nome")]
            [Required(ErrorMessage = "O atributo nome é obrigatório.")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 255 caracteres.")]
            public string Nome { get; set; } = string.Empty;

            [JsonPropertyName("crm")]
            [StringLength(20, ErrorMessage = "O CRM deve ter no máximo 20 caracteres.")]
            public string? Crm { get; set; }
        }

        public sealed class MedicoResponse
        {
            [JsonPropertyName("id")]
            public Guid Id { get; set; }

            [JsonPropertyName("nome")]
            public string Nome { get; set; } = string.Empty;

            [JsonPropertyName("crm")]
            public string? Crm { get; set; }
        }
    }
}
