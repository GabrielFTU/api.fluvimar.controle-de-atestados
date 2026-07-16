using api.fluvimar.domain.Entities.Commun;

namespace api.fluvimar.domain.Entities;

public sealed class MedicoEntity : AbstractEntity
{
    public int CodigoInterno { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? Crm { get; private set; }

    private MedicoEntity() : base() { }
    public MedicoEntity(string userId) : base(userId) { }

    public void SetNome(string nome)
    {
        Nome = nome ?? throw new ArgumentNullException(nameof(nome));
    }

    public void SetCrm(string? crm)
    {
        Crm = crm;
    }
}
