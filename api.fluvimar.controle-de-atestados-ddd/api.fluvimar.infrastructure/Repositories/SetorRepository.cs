using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class SetorRepository : AbstractRepositorio<SetorEntity>, ISetorRepositorio
{
    public SetorRepository(AppDbContext context) : base(context) { }
}
