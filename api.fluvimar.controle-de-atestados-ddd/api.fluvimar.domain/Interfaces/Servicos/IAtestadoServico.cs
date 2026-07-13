using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IAtestadoServico
    {
        Task<IEnumerable<AtestadoDTO.AtestadoResponse>> ObterTodosAsync();
        Task<AtestadoDTO.AtestadoResponse> ObterPorIdAsync(Guid id);
        Task AdicionarAsync(AtestadoDTO.AtestadoRequest dto, string userId);
        Task AtualizarAsync(AtestadoDTO.AbstractAtestadoWithIdDTO dto, string userId);
        Task RemoveAsync(Guid id);
    }
}
