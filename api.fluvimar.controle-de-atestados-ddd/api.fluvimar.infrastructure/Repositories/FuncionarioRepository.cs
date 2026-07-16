using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class FuncionarioRepository : AbstractRepositorio<Funcionario>, IFuncionarioRepositorio
{
    public FuncionarioRepository(AppDbContext context) : base(context) { }

    public override async Task<ICollection<Funcionario>> ObterTodosAsync() =>
        await Context.Set<Funcionario>().Include(f => f.Setor).ToListAsync();

    public override async Task<Funcionario> ObterPorIdAsync(Guid id) =>
        await Context.Set<Funcionario>().Include(f => f.Setor).FirstOrDefaultAsync(f => f.Id == id)
            ?? throw new KeyNotFoundException($"Funcionario com id {id} não encontrado.");
}
