using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class UsuarioRepository : AbstractRepositorio<Usuario>, IUsuarioRepositorio
{
    public UsuarioRepository(AppDbContext context) : base(context) { }

    public async Task<Usuario?> ObterPorEmailAsync(string email)
    {
        var emailNormalizado = email.Trim().ToLowerInvariant();
        return await DbSet.FirstOrDefaultAsync(u => u.Email == emailNormalizado);
    }
}
