using api.fluvimar.domain.Entities.Commun;
using System.Security.Cryptography.X509Certificates;

namespace api.fluvimar.domain.Entities;

public sealed class Funcionario : AbstractEntity {
    public int CodigoInterno { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    
    private Funcionario() : base () { }
    public Funcionario(string userId) : base (userId) { }

    public void SetNome(string nome)
    {
        Nome = nome ?? throw new ArgumentNullException(nameof(nome));
    }
}
