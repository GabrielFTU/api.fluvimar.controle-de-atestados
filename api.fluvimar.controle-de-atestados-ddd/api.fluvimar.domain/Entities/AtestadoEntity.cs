using api.fluvimar.domain.Entities.Commun;

namespace api.fluvimar.domain.Entities;

public sealed class AtestadoEntity : AbstractEntity
{
    public int CodigoInterno { get; private set; }
    public string NomeFuncionario { get; private set; } = string.Empty;
    public string? CID { get; private set; }
    public DateTime? DiaAfastamento { get; private set; }
    public DateTime? DiaRetorno { get; private set; }
    public int? TotalDiasFora => (DiaAfastamento.HasValue && DiaRetorno.HasValue) ?
                                 (DiaRetorno.Value - DiaAfastamento.Value).Days : null;
    public string? Observacoes { get; private set; }
    public Guid FuncionarioId { get; private set; }
    public Funcionario Funcionario { get; private set; } = null!;

    private AtestadoEntity() : base() { }
    public AtestadoEntity(string userId) : base(userId) { }

    public void SetFuncionario(Funcionario funcionario)
    {
        Funcionario = funcionario ?? throw new ArgumentNullException(nameof(funcionario));
        FuncionarioId = funcionario.Id;
        NomeFuncionario = funcionario.Nome;
    }

    public void SetCID(string? cid)
    {
        CID = cid;
    }

    public void SetDiaAfastamento(DateTime diaAfastamento)
    {
        if (diaAfastamento > DateTime.Now)
            throw new ArgumentException("O afastamento não pode ser no futuro.");

        if (DiaRetorno.HasValue && diaAfastamento >= DiaRetorno)
            throw new ArgumentException("O afastamento não pode ser feito após o retorno.");

        DiaAfastamento = diaAfastamento;
    }

    public void SetDiaRetorno(DateTime diaRetorno)
    {
        if (DiaAfastamento.HasValue && diaRetorno <= DiaAfastamento)
            throw new ArgumentException("O retorno não pode ser anterior ou igual ao afastamento.");

        DiaRetorno = diaRetorno;
    }

    public void SetObservacao(string? observacao)
    {
        Observacoes = observacao?.ToUpper();
    }
}
