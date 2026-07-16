using api.fluvimar.domain.Entities.Commun;

namespace api.fluvimar.domain.Entities;

public sealed class Usuario : AbstractEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public bool IsAdmin { get; private set; }

    private Usuario() : base() { }
    public Usuario(string userId) : base(userId) { }

    public void SetNome(string nome)
    {
        Nome = nome ?? throw new ArgumentNullException(nameof(nome));
    }

    public void SetEmail(string email)
    {
        Email = email?.Trim().ToLowerInvariant() ?? throw new ArgumentNullException(nameof(email));
    }

    public void SetSenhaHash(string senhaHash)
    {
        SenhaHash = senhaHash ?? throw new ArgumentNullException(nameof(senhaHash));
    }

    public void SetIsAdmin(bool isAdmin)
    {
        IsAdmin = isAdmin;
    }
}
