using api.fluvimar.domain.Classes;

namespace api.fluvimar.domain.Entities;

public sealed class CidEntity
{
    public string Codigo { get; private set; } = string.Empty;
    public string Descricao { get; private set; } = string.Empty;
    public string Busca { get; private set; } = string.Empty;

    private CidEntity() { }

    public CidEntity(string codigo, string descricao)
    {
        Codigo = codigo ?? throw new ArgumentNullException(nameof(codigo));
        Descricao = descricao ?? throw new ArgumentNullException(nameof(descricao));
        Busca = NormalizadorTexto.Normalizar($"{codigo} {descricao}");
    }
}
