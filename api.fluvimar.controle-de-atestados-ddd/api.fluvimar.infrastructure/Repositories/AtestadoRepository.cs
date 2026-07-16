using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class AtestadoRepository : AbstractRepositorio<AtestadoEntity>, IAtestadosRepositorio
{
    public AtestadoRepository(AppDbContext context) : base(context) { }

    public async Task<ICollection<AtestadoEntity>> ObterTodosComFuncionarioESetorAsync() =>
        await Context.Set<AtestadoEntity>()
            .Include(a => a.Funcionario)
            .ThenInclude(f => f.Setor)
            .ToListAsync();
}
