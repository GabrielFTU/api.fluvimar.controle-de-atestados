using api.fluvimar.domain.Entities;

namespace api.fluvimar.domain.Interfaces.Repositorios
{
    public interface IUsuarioRepositorio : IAbstractRepositorio<Usuario>
    {
        Task<Usuario?> ObterPorEmailAsync(string email);
    }
}
