using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IAutenticacaoServico
    {
        Task<UsuarioDTO.LoginResponse> LoginAsync(UsuarioDTO.LoginRequest dto);
        Task<UsuarioDTO.UsuarioResponse> ObterUsuarioAtualAsync(Guid usuarioId);
    }
}
