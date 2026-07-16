using api.fluvimar.domain.DTO;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface ICidServico
    {
        Task<IEnumerable<CidDTO.CidResponse>> BuscarAsync(string termo);
    }
}
