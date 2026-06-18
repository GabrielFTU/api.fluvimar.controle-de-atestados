using api.fluvimar.domain.Entities.Commun;
using api.fluvimar.domain.Enums;

namespace api.fluvimar.domain.Entities;

public sealed class AtestadoEntity : AbstractEntity
{
    public int CodigoInterno { get; private set; }
    public String NomeFuncionario { get; private set; } = String.Empty;
    public String CID {  get; private set; } = string.Empty;
    public DateTime? DiaAfastamento { get; private set; } 
    public DateTime? DiaRetorno { get; private set; }
    public int? TotalDiasFora => (DiaAfastamento.HasValue && DiaRetorno.HasValue) ?
                                 (DiaRetorno.Value - DiaAfastamento.Value).Days : null;
    public String? Observacoes { get; private set; } = String.Empty;
    public Funcionario Funcionario { get; private set; }

    private AtestadoEntity() : base() { }
    public AtestadoEntity (string userId) : base(userId) { }

    public void setObservacao (string observacao)
    {
        Observacoes = observacao?.ToUpper() ??
        throw new ArgumentNullException(nameof(observacao));
    }

    public void setCID (string cid) 
    {
        CID = cid ??
            throw new ArgumentNullException(nameof(cid));
    }

    public void setDiaAfastamento (DateTime diaAfastamento)
    {
        if (diaAfastamento > DateTime.Now)
            throw new ArgumentException("O afastamento não pode ser no futuro.");

        if (DiaRetorno != default && diaAfastamento >= DiaRetorno)
            throw new ArgumentException("O afastamento não pode ser feito apos o retorno");
    
        DiaAfastamento = diaAfastamento;
    }
    public void setDiaRetorno (DateTime diaRetorno)
    {
        if (diaRetorno > DiaAfastamento)
            throw new ArgumentException("O dia de retorno não pode ser anterior ao afastamento");

        if (DiaAfastamento != default && diaRetorno <= DiaAfastamento)
            throw new ArgumentException("O retorno não pode ser feito anterior ao afastamento");
    }

}
