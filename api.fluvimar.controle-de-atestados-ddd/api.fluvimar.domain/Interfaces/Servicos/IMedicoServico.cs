using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IMedicoServico
    {
        Task<IEnumerable<MedicoDTO.MedicoResponse>> ObterTodosAsync();
        Task<MedicoDTO.MedicoResponse> AdicionarAsync(MedicoDTO.MedicoRequest dto, string userId);
    }
}
