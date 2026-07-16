using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace api.fluvimar.domain.DTO
{
    public sealed class UsuarioDTO
    {
        public sealed class LoginRequest
        {
            [JsonPropertyName("email")]
            [Required(ErrorMessage = "O atributo email é obrigatório.")]
            [EmailAddress(ErrorMessage = "O valor do atributo email é inválido.")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("senha")]
            [Required(ErrorMessage = "O atributo senha é obrigatório.")]
            public string Senha { get; set; } = string.Empty;
        }

        public sealed class UsuarioResponse
        {
            [JsonPropertyName("id")]
            public Guid Id { get; set; }

            [JsonPropertyName("nome")]
            public string Nome { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("isAdmin")]
            public bool IsAdmin { get; set; }

            [JsonPropertyName("isActive")]
            public bool IsActive { get; set; }
        }

        public sealed class LoginResponse
        {
            [JsonPropertyName("token")]
            public string Token { get; set; } = string.Empty;

            [JsonPropertyName("expiraEm")]
            public DateTime ExpiraEm { get; set; }

            [JsonPropertyName("usuario")]
            public UsuarioResponse Usuario { get; set; } = new();
        }

        public sealed class UsuarioCriarRequest
        {
            [JsonPropertyName("nome")]
            [Required(ErrorMessage = "O atributo nome é obrigatório.")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 255 caracteres.")]
            public string Nome { get; set; } = string.Empty;

            [JsonPropertyName("email")]
            [Required(ErrorMessage = "O atributo email é obrigatório.")]
            [EmailAddress(ErrorMessage = "O valor do atributo email é inválido.")]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("senha")]
            [Required(ErrorMessage = "O atributo senha é obrigatório.")]
            [StringLength(50, MinimumLength = 8, ErrorMessage = "A senha deve ter entre 8 a 50 caracteres.")]
            public string Senha { get; set; } = string.Empty;

            [JsonPropertyName("isAdmin")]
            public bool IsAdmin { get; set; }
        }
    }
}
