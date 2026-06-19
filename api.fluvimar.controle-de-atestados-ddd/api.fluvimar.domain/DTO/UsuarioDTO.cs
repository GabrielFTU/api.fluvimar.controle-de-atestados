using api.fluvimar.domain.Entities.Commun;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace api.fluvimar.domain.DTO
{
    public sealed class UsuarioDTO
    {
        public abstract class AbstractUsuario { 
            [JsonPropertyName("email")]
            [Required(ErrorMessage =" O atributo email é obrigatório.")]
            [EmailAddress(ErrorMessage = "O valor do atributo email é inválido.")]
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string Email { get; set; } = string.Empty;

            [JsonPropertyName("password")]
            [Required(ErrorMessage = "O atributo password é obrigatório.")]
            [PasswordPropertyText(true)]
            [StringLength(50, MinimumLength = 6, ErrorMessage = "O atributo password deve ter entre 6 a 50 caracteres. ")]
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string Password { get; set; } = string.Empty;
        }
        public sealed class SingInRequest : AbstractUsuario { }
        public sealed class SingInResponse : AbstractUsuario
        {
            [JsonPropertyName("confirmedPassword")]
            [Compare(nameof(Password), ErrorMessage = "As senhas devem ser iguais")]
            [JsonIgnore(Condition =JsonIgnoreCondition.WhenWritingNull)]
            public string AcessToken {  get; set; } = string.Empty ;
        }
    }
}
