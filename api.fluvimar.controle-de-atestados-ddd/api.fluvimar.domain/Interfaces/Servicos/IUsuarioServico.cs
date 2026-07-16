using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IUsuarioServico
    {
        Task<IEnumerable<UsuarioDTO.UsuarioResponse>> ObterTodosAsync();
        Task<UsuarioDTO.UsuarioResponse> AdicionarAsync(UsuarioDTO.UsuarioCriarRequest dto, string userId);
        Task AtivarAsync(Guid id, string userId);
        Task DesativarAsync(Guid id, string userId);
    }
}
