using api.fluvimar.domain.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface IAtestadoServico
    {
        Task<IEnumerable<AtestadoDTO.AtestadoResponse>> ObterTodosAsync();
        Task<AtestadoDTO.AtestadoResponse> ObterPorIdAsync(Guid id);
        Task AdicionarAsync(AtestadoDTO.AtestadoRequest dto);
        Task RemoveAsync (Guid id);
        Task AtualizarAsync(AtestadoDTO.AbstractAtestadoWithIdDTO dto);

    }
}
