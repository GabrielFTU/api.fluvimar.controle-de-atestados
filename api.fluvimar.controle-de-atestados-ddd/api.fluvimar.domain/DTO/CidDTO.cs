using System.Text.Json.Serialization;

namespace api.fluvimar.domain.DTO
{
    public sealed class CidDTO
    {
        public sealed class CidResponse
        {
            [JsonPropertyName("codigo")]
            public string Codigo { get; set; } = string.Empty;

            [JsonPropertyName("descricao")]
            public string Descricao { get; set; } = string.Empty;
        }
    }
}
