using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface ISetorServico
    {
        Task<IEnumerable<SetorDTO.SetorResponse>> ObterTodosAsync();
        Task<SetorDTO.SetorResponse> ObterPorIdAsync(Guid id);
        Task AdicionarAsync(SetorDTO.SetorRequest dto, string userId);
        Task AtualizarAsync(SetorDTO.AbstractSetorWithIdDTO dto, string userId);
        Task RemoveAsync(Guid id);
    }
}
