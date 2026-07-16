using api.fluvimar.domain.Entities.Commun;
using System.Security.Cryptography.X509Certificates;

namespace api.fluvimar.domain.Entities;

public sealed class Funcionario : AbstractEntity {
    public int CodigoInterno { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public Guid? SetorId { get; private set; }
    public SetorEntity? Setor { get; private set; }

    private Funcionario() : base () { }
    public Funcionario(string userId) : base (userId) { }

    public void SetNome(string nome)
    {
        Nome = nome ?? throw new ArgumentNullException(nameof(nome));
    }

    public void SetSetor(SetorEntity? setor)
    {
        Setor = setor;
        SetorId = setor?.Id;
    }
}
