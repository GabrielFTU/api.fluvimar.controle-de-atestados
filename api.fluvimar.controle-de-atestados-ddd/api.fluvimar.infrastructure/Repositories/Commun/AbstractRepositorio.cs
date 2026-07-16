using api.fluvimar.domain.Entities.Commun;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Repositories.Commun;

public abstract class AbstractRepositorio<T> : IAbstractRepositorio<T> where T : AbstractEntity
{
    protected readonly AppDbContext Context;
    protected readonly DbSet<T> DbSet;

    protected AbstractRepositorio(AppDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public virtual async Task<ICollection<T>> ObterTodosAsync() =>
        await DbSet.ToListAsync();

    public virtual async Task<T> ObterPorIdAsync(Guid id) =>
        await DbSet.FindAsync(id)
            ?? throw new KeyNotFoundException($"{typeof(T).Name} com id {id} não encontrado.");

    public async Task AdicionarAsync(T entity)
    {
        await DbSet.AddAsync(entity);
        await Context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(T entity)
    {
        DbSet.Update(entity);
        await Context.SaveChangesAsync();
    }

    public async Task RemoverAsync(T entity)
    {
        DbSet.Remove(entity);
        await Context.SaveChangesAsync();
    }
}
