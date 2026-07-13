using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace api.fluvimar.infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AtestadoEntity> Atestados => Set<AtestadoEntity>();
    public DbSet<Funcionario> Funcionarios => Set<Funcionario>();
    public DbSet<SetorEntity> Setores => Set<SetorEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
