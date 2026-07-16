using api.fluvimar.domain.Entities.Commun;
using api.fluvimar.domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.fluvimar.domain.Entities
{
    public sealed class SetorEntity : AbstractEntity
    {
        public int CodigoInterno { get; private set; }
        public string NomeDoSetor { get; private set; } = String.Empty;
        public string? Responsavel { get; private set; } = String.Empty;
        public Unidade? Unidade { get; private set; }

        private SetorEntity() : base() { }

        public SetorEntity(string userId) : base (userId) { }
        public void setNomeDoSetor(string nomeDoSetor, string userId)
        {
            NomeDoSetor = nomeDoSetor ?? throw new ArgumentNullException(nameof(nomeDoSetor));
            Update(userId);
        }
        public void setResponsavel(string responsavel, string userId)
        {
            Responsavel = responsavel ?? throw new ArgumentNullException(nameof(responsavel));
            Update(userId);
        }
        public void SetUnidade(Unidade? unidade, string userId)
        {
            Unidade = unidade;
            Update(userId);
        }
    }
}
