using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories.Commun;

namespace api.fluvimar.infrastructure.Repositories;

public sealed class MedicoRepository : AbstractRepositorio<MedicoEntity>, IMedicoRepositorio
{
    public MedicoRepository(AppDbContext context) : base(context) { }
}
