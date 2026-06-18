using api.fluvimar.domain.Entities.Commun;

namespace api.fluvimar.domain.Entities;

public sealed class Funcionario : AbstractEntity {
    public int CodigoInterno { get; private set; }
    public string Nome { get; private set; } = string.Empty;

}
