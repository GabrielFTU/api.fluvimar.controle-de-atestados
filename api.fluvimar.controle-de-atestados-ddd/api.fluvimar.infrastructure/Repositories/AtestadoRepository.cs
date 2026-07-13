using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class AtestadoRepository : AbstractRepositorio<AtestadoEntity>, IAtestadosRepositorio
{
    public AtestadoRepository(AppDbContext context) : base(context) { }
}
