using api.fluvimar.domain.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.fluvimar.domain.Interfaces.Servicos
{
    public interface ISetorServico
    {
        Task<IEnumerable<SetorDTO.SetorResponse>> ObterTodosAsync();
        Task<SetorDTO.SetorResponse> ObterPorIdAsync(Guid id);
        Task AdicionarAsync(SetorDTO.SetorRequest dto);
        Task RemoveAsync(Guid id);
        Task AtualizarAsync(SetorDTO.AbstractSetorWithIdDTO);
    }
}
