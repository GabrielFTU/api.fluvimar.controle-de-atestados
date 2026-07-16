using api.fluvimar.domain.Entities;

namespace api.fluvimar.domain.Interfaces.Repositorios
{
    public interface ICidRepositorio
    {
        Task<IEnumerable<CidEntity>> BuscarAsync(string termo, int limite);
        Task<IEnumerable<CidEntity>> ObterPorCodigosAsync(IEnumerable<string> codigos);
    }
}
