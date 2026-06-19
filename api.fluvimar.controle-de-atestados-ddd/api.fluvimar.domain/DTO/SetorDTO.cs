using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace api.fluvimar.domain.DTO
{
    public sealed class SetorDTO
    {
        public abstract class AbstractSetorDTO
        {
            [JsonPropertyName("nomeDoSetor")]
            [Required(ErrorMessage = "O atributo nome é obrigatório.")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O nome do setor deve ter entre 3 e 255 caracteres. ")]
            public string NomeDoSetor { get; set; } = string.Empty;

            [JsonPropertyName("responsavel")]
            [StringLength(255, MinimumLength = 3, ErrorMessage = "O atributo responsavel deve ter entre 3 e 255 caracteres. ")]
            public string? Responsavel { get; set; } = string.Empty;

        }

        public abstract class AbstractSetorWithIdDTO : AbstractSetorDTO
        {
            [JsonPropertyName("id")]
            [Required(ErrorMessage = "O atributo id é obrigatório")]
            public Guid Id { get; set; }
        }

        public sealed class SetorRequest : AbstractSetorDTO { }
        public sealed class SetorRequestWihId : AbstractSetorWithIdDTO { }
        public sealed class SetorResponse : AbstractSetorWithIdDTO { }

    }
}