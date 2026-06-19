using api.fluvimar.domain.Entities.Commun;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.fluvimar.domain.Interfaces.Repositorios
{
    public interface  IAbstractRepositorio<T> where T : AbstractEntity
    {
        Task<ICollection<T>> ObterTodosAsync();
        Task<T> ObterPorIdAsync(Guid id);
        Task AdicionarAsync(T entity);
        Task AtualizarAsync(T entity);
        Task RemoverAsync (T entity);  
    }
}
