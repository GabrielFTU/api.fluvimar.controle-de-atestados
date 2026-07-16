using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IFuncionarioServico
    {
        Task<IEnumerable<FuncionarioDTO.FuncionarioResponse>> ObterTodosAsync();
        Task<FuncionarioDTO.FuncionarioResponse> ObterPorIdAsync(Guid id);
        Task<FuncionarioDTO.FuncionarioResponse> AdicionarAsync(FuncionarioDTO.FuncionarioRequest dto, string userId);
        Task AtualizarAsync(FuncionarioDTO.AbstractFuncionarioWithIdDTO dto, string userId);
        Task RemoveAsync(Guid id);
    }
}
